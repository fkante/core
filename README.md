# Monorepo Boilerplate

A modern monorepo setup with Node.js, TypeScript, and PNPM workspaces.

## 📦 Structure

```
monorepo-boilerplate/
├── apps/
│   ├── backend/      # Express.js API server
│   ├── frontend/     # TanStack Start React app
│   └── gateway/      # API gateway (coming soon)
├── packages/
│   └── core/         # Shared utilities and types
└── scripts/          # Development scripts
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 24.2.0
- PNPM >= 10.11.0
- Docker & Docker Compose

### Installation

```bash
# Install dependencies
pnpm install
```

### Running with Docker

```bash
# Development mode (with hot-reloading)
pnpm start:dev

# Production mode (optimized builds)
pnpm start:prod

# Stop all services
pnpm stop

# View logs
pnpm logs
```

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

### Development (Local - without Docker)

```bash
# Backend server
cd apps/backend
pnpm dev

# Frontend app
cd apps/frontend
pnpm dev
```

## 🔧 Services

### Backend (Port 3000)

- Express.js with TypeScript
- REST API endpoints
- PostgreSQL database connection
- Health check: http://localhost:3000/health

### Frontend

- TanStack Start (React)
- TanStack Router, Query, Form
- API integration ready
- Development: Port 5173
- Production: Port 8080

### PostgreSQL (Port 5432)

- Database: postgres
- Username: postgres
- Password: postgres

## 📝 Available Scripts

### Root Scripts (package.json)

```bash
# Development mode with hot-reloading
pnpm start:dev

# Production mode with optimized builds
pnpm start:prod

# Stop all Docker services
pnpm stop

# View logs from services
pnpm logs
```

### Direct Docker Commands

```bash
# Development
docker compose -f compose.yml up -d --build
docker compose -f compose.yml logs -f
docker compose -f compose.yml down

# Production
docker compose -f compose.prod.yml up -d --build
docker compose -f compose.prod.yml logs -f
docker compose -f compose.prod.yml down

# Remove all containers and volumes
docker compose down -v
```

For more deployment options, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## 🛠 Tech Stack

- **Runtime:** Node.js 24.2.0
- **Package Manager:** PNPM 10.11.0
- **Language:** TypeScript 5.7+
- **Backend:** Express.js
- **Frontend:** React 19, TanStack ecosystem
- **Database:** PostgreSQL 16
- **Container:** Docker Compose
