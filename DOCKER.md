# Docker Setup Guide

Este guia explica como executar o projeto usando Docker e Docker Compose.

## 📋 Pré-requisitos

- Docker 20.10+
- Docker Compose 2.0+
- 4GB de RAM disponível

## 🚀 Início Rápido

### 1. Clonar e configurar variáveis de ambiente

```bash
# Copiar os arquivos .env.example para .env em cada serviço
cp apps/api-gateway/.env.example apps/api-gateway/.env
cp apps/auth-service/.env.example apps/auth-service/.env
cp apps/tasks-service/.env.example apps/tasks-service/.env
cp apps/notifications-service/.env.example apps/notifications-service/.env
cp apps/web/.env.example apps/web/.env
```

### 2. Subir todos os serviços

```bash
# Build e start de todos os serviços
docker-compose up --build

# Ou em modo detached (background)
docker-compose up -d --build
```

### 3. Acessar os serviços

- **Frontend (Web)**: http://localhost:3000
- **API Gateway**: http://localhost:3001
- **API Gateway Docs (Swagger)**: http://localhost:3001/api/docs
- **Auth Service**: http://localhost:3002
- **Tasks Service**: http://localhost:3003
- **Notifications Service**: http://localhost:3004
- **RabbitMQ Management**: http://localhost:15672 (admin/admin)
- **PostgreSQL**: localhost:5432 (postgres/password)

## 📦 Estrutura dos Dockerfiles

Cada serviço possui um Dockerfile multi-stage com 4 estágios:

1. **base**: Configuração base com Node.js 20 Alpine e pnpm
2. **dependencies**: Instalação de dependências do monorepo
3. **development**: Estágio para desenvolvimento com hot-reload
4. **builder**: Build da aplicação
5. **production**: Imagem otimizada para produção

## 🔧 Comandos Úteis

### Gerenciar serviços

```bash
# Parar todos os serviços
docker-compose down

# Parar e remover volumes (limpa banco de dados)
docker-compose down -v

# Ver logs de todos os serviços
docker-compose logs -f

# Ver logs de um serviço específico
docker-compose logs -f api-gateway
docker-compose logs -f web
docker-compose logs -f tasks-service

# Reiniciar um serviço específico
docker-compose restart api-gateway

# Reconstruir um serviço específico
docker-compose up -d --build api-gateway
```

### Executar comandos nos containers

```bash
# Acessar shell do container
docker-compose exec api-gateway sh

# Executar migrations
docker-compose exec api-gateway pnpm --filter api-gateway migration:run

# Instalar dependências
docker-compose exec api-gateway pnpm install
```

### Build para produção

```bash
# Build das imagens de produção
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build

# Start em produção
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## 🐛 Troubleshooting

### Problema: "Port already in use"

```bash
# Verificar portas em uso
sudo lsof -i :3000
sudo lsof -i :3001
sudo lsof -i :5432

# Parar containers antigos
docker-compose down
```

### Problema: "Cannot connect to database"

```bash
# Verificar se o PostgreSQL está rodando
docker-compose ps db

# Ver logs do banco
docker-compose logs db

# Recriar o container do banco
docker-compose up -d --force-recreate db
```

### Problema: "RabbitMQ connection failed"

```bash
# Verificar se o RabbitMQ está rodando
docker-compose ps rabbitmq

# Ver logs do RabbitMQ
docker-compose logs rabbitmq

# Aguardar alguns segundos após o start para o RabbitMQ inicializar
```

### Problema: Dependências não atualizadas

```bash
# Limpar tudo e reconstruir
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### Problema: Hot reload não funciona

O hot reload está configurado com volumes para funcionar automaticamente. Se não estiver funcionando:

```bash
# Verificar se os volumes estão montados
docker-compose exec api-gateway ls -la /app

# Reiniciar o serviço
docker-compose restart api-gateway
```

## 🔍 Verificar saúde dos serviços

```bash
# Status de todos os containers
docker-compose ps

# Usar health checks
docker-compose ps db
docker-compose ps rabbitmq

# Verificar conectividade
docker-compose exec api-gateway ping -c 2 db
docker-compose exec api-gateway ping -c 2 rabbitmq
```

## 📊 Monitoramento

### RabbitMQ Management UI

Acesse http://localhost:15672
- Usuário: `admin`
- Senha: `admin`

Aqui você pode:
- Ver filas e mensagens
- Monitorar conexões
- Verificar exchanges

### PostgreSQL

Conecte usando qualquer cliente SQL:
- Host: `localhost`
- Port: `5432`
- Database: `challenge_db`
- User: `postgres`
- Password: `password`

## 🏗️ Arquitetura Docker

```
┌─────────────┐
│    web      │ :3000
│  (React)    │
└─────────────┘
       │
       ↓
┌─────────────┐     ┌──────────────┐
│ api-gateway │     │  rabbitmq    │
│   :3001     │────→│ :5672/:15672 │
└─────────────┘     └──────────────┘
       │                    ↑
       ↓                    │
┌─────────────┐            │
│     db      │            │
│ PostgreSQL  │            │
│   :5432     │            │
└─────────────┘            │
       ↑                    │
       │                    │
   ┌───┴────────────────────┴───┐
   │                            │
┌──┴──────────┐  ┌──────────────┴┐  ┌─────────────────┐
│auth-service │  │ tasks-service │  │notifications-   │
│   :3002     │  │    :3003      │  │   service :3004 │
└─────────────┘  └───────────────┘  └─────────────────┘
```

## 🔐 Segurança

⚠️ **IMPORTANTE**: Os valores padrão são apenas para desenvolvimento!

Para produção, você DEVE alterar:
- Senhas do banco de dados
- Credenciais do RabbitMQ
- JWT secrets
- Configurações de CORS

## 📝 Variáveis de Ambiente

Cada serviço possui um arquivo `.env.example` com todas as variáveis necessárias. Copie para `.env` e ajuste conforme necessário.

### Variáveis Compartilhadas

- `DATABASE_HOST`: Host do PostgreSQL
- `DATABASE_PORT`: Porta do PostgreSQL
- `DATABASE_USER`: Usuário do banco
- `DATABASE_PASSWORD`: Senha do banco
- `DATABASE_NAME`: Nome do banco
- `RABBITMQ_URL`: URL de conexão do RabbitMQ
- `NODE_ENV`: Ambiente (development/production)

## 🎯 Próximos Passos

1. Configure as variáveis de ambiente
2. Execute `docker-compose up --build`
3. Aguarde todos os serviços iniciarem
4. Acesse http://localhost:3000
5. Verifique o Swagger em http://localhost:3001/api/docs
