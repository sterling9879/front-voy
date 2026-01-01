# Voyra IA - Copy Intelligence

Sistema completo de gerenciamento e análise de copies com inteligência artificial.

## Funcionalidades

- **Board Kanban**: Organize suas copies em colunas (Em Teste, Campeãs, Escalando, Não Validou, Arquivo)
- **DNA da Copy**: Análise automática com IA (tom, hook, gatilhos, storytelling)
- **Score de Confiança**: Avaliação baseada em campanhas, gasto e tempo de teste
- **Histórico de Versões**: Controle de mudanças e possibilidade de restaurar versões
- **Dashboard de Analytics**: Métricas de performance, evolução e insights
- **Laboratório de Hipóteses**: Crie e gerencie testes A/B
- **Timeline**: Histórico cronológico de todas as mudanças
- **Benchmark por Nicho**: Compare sua performance com o mercado

## Stack Tecnológica

- **Frontend**: React + TypeScript + Tailwind CSS + Vite
- **Backend**: Node.js + Express + Prisma
- **Banco de Dados**: PostgreSQL
- **IA**: Google Gemini API
- **Deploy**: Docker + Nginx + Certbot

## Instalação Rápida (Produção)

```bash
curl -fsSL https://seudominio.com/install.sh | sudo bash
```

## Desenvolvimento Local

### Pré-requisitos

- Node.js 20+
- Docker e Docker Compose
- PostgreSQL (ou use via Docker)

### Setup

```bash
# Clonar repositório
git clone https://github.com/seu-usuario/copy-intelligence.git
cd copy-intelligence

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais

# Subir banco de dados
docker-compose up -d postgres

# Gerar Prisma Client e criar tabelas
npx prisma generate
npx prisma db push

# Popular com dados de exemplo
npm run db:seed

# Iniciar desenvolvimento
npm run dev
```

### Comandos Úteis

```bash
# Desenvolvimento
npm run dev              # Inicia frontend e backend
npm run dev:frontend     # Apenas frontend
npm run dev:backend      # Apenas backend

# Database
npm run db:generate      # Gera Prisma Client
npm run db:migrate       # Executa migrations
npm run db:seed          # Popula banco com dados de teste
npm run db:studio        # Abre Prisma Studio

# Build
npm run build            # Build completo
npm run build:frontend   # Build frontend
npm run build:backend    # Build backend

# Docker
make dev                 # Sobe ambiente de desenvolvimento
make prod                # Sobe ambiente de produção
make logs                # Ver logs
make backup              # Backup do banco
```

## Variáveis de Ambiente

```env
# Banco de Dados
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# APIs
GEMINI_API_KEY=sua_chave_gemini
JWT_SECRET=sua_chave_jwt_64_caracteres

# URLs
VITE_API_URL=http://localhost:3001/api
```

## Credenciais de Teste

Após executar o seed:

- **Email**: demo@voyra.com
- **Senha**: 123456

## Estrutura do Projeto

```
/src
  /frontend
    /components     # Componentes React
    /pages          # Páginas da aplicação
    /hooks          # Custom hooks
    /services       # API clients
    /stores         # Estado global (Zustand)
  /backend
    /routes         # Rotas Express
    /controllers    # Controllers
    /services       # Lógica de negócio
    /middleware     # Middlewares
    /ai             # Integração Gemini
  /shared
    /types          # Tipos compartilhados
    /constants      # Constantes
/prisma
  schema.prisma     # Schema do banco
  seed.ts           # Dados de exemplo
/docker
  Dockerfile.*      # Dockerfiles
  nginx/            # Configuração Nginx
```

## Licença

Proprietary - Voyra IA
