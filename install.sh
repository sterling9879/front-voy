#!/bin/bash

#############################################
# Copy Intelligence - Instalação Automática
# Compatível com Ubuntu 22.04 LTS
# Uso: curl -fsSL https://seudominio.com/install.sh | sudo bash
#############################################

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[OK]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[AVISO]${NC} $1"; }
print_error() { echo -e "${RED}[ERRO]${NC} $1"; }

# Verificar se é root
if [ "$EUID" -ne 0 ]; then
    print_error "Execute como root: sudo bash install.sh"
    exit 1
fi

# Verificar Ubuntu 22.04
if ! grep -q "Ubuntu 22" /etc/os-release 2>/dev/null; then
    print_warning "Este script foi testado no Ubuntu 22.04. Continuando mesmo assim..."
fi

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║           COPY INTELLIGENCE - INSTALAÇÃO                   ║"
echo "║           Sistema de Análise de Copies com IA              ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Coletar informações
read -p "Digite seu domínio (ex: copyintel.seusite.com): " DOMAIN
read -p "Digite seu email (para SSL): " EMAIL
read -p "Digite sua GEMINI_API_KEY: " GEMINI_API_KEY

if [ -z "$DOMAIN" ] || [ -z "$EMAIL" ] || [ -z "$GEMINI_API_KEY" ]; then
    print_error "Todos os campos são obrigatórios!"
    exit 1
fi

# Gerar senhas seguras
DB_PASSWORD=$(openssl rand -base64 32 | tr -dc 'a-zA-Z0-9' | head -c 32)
JWT_SECRET=$(openssl rand -base64 64 | tr -dc 'a-zA-Z0-9' | head -c 64)

print_status "Atualizando sistema..."
apt-get update -qq
apt-get upgrade -y -qq

print_status "Instalando dependências..."
apt-get install -y -qq \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    git \
    ufw

# Instalar Docker se não existir
if ! command -v docker &> /dev/null; then
    print_status "Instalando Docker..."
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
    print_success "Docker instalado!"
else
    print_success "Docker já instalado!"
fi

# Instalar Docker Compose se não existir
if ! command -v docker-compose &> /dev/null; then
    print_status "Instalando Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    print_success "Docker Compose instalado!"
else
    print_success "Docker Compose já instalado!"
fi

# Configurar firewall
print_status "Configurando firewall..."
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
print_success "Firewall configurado!"

# Criar diretório do projeto
PROJECT_DIR="/opt/copy-intelligence"
print_status "Criando diretório do projeto em $PROJECT_DIR..."
mkdir -p $PROJECT_DIR
cd $PROJECT_DIR

# Clonar repositório
print_status "Baixando código fonte..."
if [ -d ".git" ]; then
    git pull
else
    git clone https://github.com/seu-usuario/copy-intelligence.git .
fi

# Criar arquivo .env
print_status "Configurando variáveis de ambiente..."
cat > .env << EOF
# Banco de Dados
DB_USER=copyintel
DB_PASSWORD=${DB_PASSWORD}
DB_NAME=copyintel_db

# API
GEMINI_API_KEY=${GEMINI_API_KEY}
JWT_SECRET=${JWT_SECRET}
VITE_API_URL=https://${DOMAIN}/api

# Domínio
DOMAIN=${DOMAIN}
EMAIL=${EMAIL}

# Ambiente
NODE_ENV=production
EOF

print_success "Arquivo .env criado!"

# Atualizar nginx.conf com domínio
print_status "Configurando Nginx..."
sed -i "s/DOMAIN_PLACEHOLDER/${DOMAIN}/g" docker/nginx/nginx.conf

# Subir containers sem SSL primeiro (para obter certificado)
print_status "Iniciando containers Docker..."

# Criar nginx temporário para obter certificado
cat > docker/nginx/nginx-temp.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    server {
        listen 80;
        server_name _;

        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }

        location / {
            proxy_pass http://frontend:4000;
        }

        location /api {
            proxy_pass http://backend:4001;
        }
    }
}
EOF

# Usar nginx temp para obter certificado
cp docker/nginx/nginx.conf docker/nginx/nginx-ssl.conf
cp docker/nginx/nginx-temp.conf docker/nginx/nginx.conf

docker-compose -f docker-compose.prod.yml up -d --build

# Aguardar containers subirem
print_status "Aguardando serviços iniciarem..."
sleep 30

# Obter certificado SSL
print_status "Obtendo certificado SSL com Certbot..."
docker-compose -f docker-compose.prod.yml run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email ${EMAIL} \
    --agree-tos \
    --no-eff-email \
    -d ${DOMAIN}

# Restaurar nginx com SSL
cp docker/nginx/nginx-ssl.conf docker/nginx/nginx.conf
rm docker/nginx/nginx-temp.conf docker/nginx/nginx-ssl.conf

# Reiniciar nginx com SSL
docker-compose -f docker-compose.prod.yml restart nginx

# Configurar renovação automática do SSL
print_status "Configurando renovação automática do SSL..."
(crontab -l 2>/dev/null; echo "0 12 * * * cd $PROJECT_DIR && docker-compose -f docker-compose.prod.yml run --rm certbot renew --quiet && docker-compose -f docker-compose.prod.yml restart nginx") | crontab -

# Criar script de gerenciamento
cat > /usr/local/bin/copyintel << 'EOF'
#!/bin/bash
cd /opt/copy-intelligence

case "$1" in
    start)
        docker-compose -f docker-compose.prod.yml up -d
        ;;
    stop)
        docker-compose -f docker-compose.prod.yml down
        ;;
    restart)
        docker-compose -f docker-compose.prod.yml restart
        ;;
    logs)
        docker-compose -f docker-compose.prod.yml logs -f ${2:-}
        ;;
    status)
        docker-compose -f docker-compose.prod.yml ps
        ;;
    update)
        git pull
        docker-compose -f docker-compose.prod.yml up -d --build
        ;;
    backup)
        mkdir -p /opt/copy-intelligence/backups
        BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
        docker-compose -f docker-compose.prod.yml exec -T postgres pg_dump -U copyintel copyintel_db > /opt/copy-intelligence/backups/$BACKUP_FILE
        echo "Backup salvo em: /opt/copy-intelligence/backups/$BACKUP_FILE"
        ;;
    seed)
        docker-compose -f docker-compose.prod.yml exec backend npx tsx prisma/seed.ts
        ;;
    *)
        echo "Uso: copyintel {start|stop|restart|logs|status|update|backup|seed}"
        exit 1
        ;;
esac
EOF

chmod +x /usr/local/bin/copyintel

# Criar diretório de backups
mkdir -p $PROJECT_DIR/backups

# Configurar backup automático diário
(crontab -l 2>/dev/null; echo "0 3 * * * /usr/local/bin/copyintel backup") | crontab -

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║              INSTALAÇÃO CONCLUÍDA COM SUCESSO!             ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
print_success "Sistema instalado em: $PROJECT_DIR"
print_success "Acesse: https://${DOMAIN}"
echo ""
echo "Comandos úteis:"
echo "  copyintel start    - Iniciar sistema"
echo "  copyintel stop     - Parar sistema"
echo "  copyintel restart  - Reiniciar sistema"
echo "  copyintel logs     - Ver logs (copyintel logs backend)"
echo "  copyintel status   - Ver status dos containers"
echo "  copyintel update   - Atualizar sistema"
echo "  copyintel backup   - Fazer backup do banco"
echo "  copyintel seed     - Popular banco com dados de exemplo"
echo ""
print_warning "Guarde essas credenciais em local seguro:"
echo "  DB_PASSWORD: ${DB_PASSWORD}"
echo "  JWT_SECRET: ${JWT_SECRET}"
echo ""
print_success "Backup automático configurado para 3h da manhã diariamente."
print_success "Renovação SSL automática configurada."
