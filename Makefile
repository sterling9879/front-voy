.PHONY: dev prod install clean logs backup seed setup

# Development
dev:
	docker-compose up -d

dev-build:
	docker-compose up -d --build

# Production
prod:
	docker-compose -f docker-compose.prod.yml up -d --build

prod-down:
	docker-compose -f docker-compose.prod.yml down

# Installation
install:
	chmod +x install.sh
	sudo ./install.sh

# Setup local development
setup:
	npm install
	cp .env.example .env
	npx prisma generate
	npx prisma db push
	npm run db:seed

# Database
seed:
	npx tsx prisma/seed.ts

migrate:
	npx prisma migrate dev

studio:
	npx prisma studio

# Cleanup
clean:
	docker-compose down -v
	docker system prune -f

# Logs
logs:
	docker-compose logs -f

logs-backend:
	docker-compose logs -f backend

logs-frontend:
	docker-compose logs -f frontend

# Backup
backup:
	docker-compose exec postgres pg_dump -U copyintel copyintel_db > backup_$$(date +%Y%m%d).sql

# Status
status:
	docker-compose ps
