# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture Overview

This is a full-stack restaurant menu application with three main components:

- **Frontend (Customer-facing)**: Next.js 15.3.0 with React 19.0.0, TailwindCSS v4, App Router
- **Admin Panel**: React 19.1.0 with Vite 6.2.6, TanStack Router, shadcn/ui, TypeScript
- **Backend**: Go 1.23+ with Gin framework, PostgreSQL database, Clean Architecture
- **Communication**: REST API with CORS enabled for cross-origin requests
- **Infrastructure**: Docker Compose orchestration, GCP/AWS S3 for file storage, Redis for caching, Swagger documentation

## Development Commands

### Frontend (Next.js)
```bash
cd frontend/
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Admin Panel (Vite + React)
```bash
cd admin-panel/
pnpm install         # Install dependencies (uses pnpm)
pnpm run dev         # Start development server (Vite)
pnpm run build       # Build for production
pnpm run preview     # Preview production build
pnpm run lint        # Run ESLint
pnpm run format      # Format code with Prettier
```

### Backend (Go)
```bash
cd backend/
make dev                    # Start development server with hot reload
make run                    # Build and run the application
make build                  # Build the application
make test                   # Run tests
make lint                   # Run linter
make swagger               # Generate Swagger documentation
make compose-up            # Start all services with Docker Compose

# Database Migration Commands
make db-migrate            # Run all pending migrations
make db-migrate-down       # Rollback all migrations
make db-migrate-version    # Show current migration version
make db-migrate-create NAME=migration_name  # Create new migration files
make db-migrate-goto VERSION=1             # Migrate to specific version
make db-migrate-steps STEPS=1              # Run n migration steps
make db-migrate-force VERSION=1            # Force migration to version
make db-migrate-drop       # Drop all tables (DANGEROUS)
make db-reset              # Drop and recreate database with migrations
make db-seed               # Seed database with sample data
make db-seed-clear         # Clear seeded data from database
```

### Docker Compose (Full Stack)
```bash
# From project root
docker-compose up -d              # Start all services (backend, frontend, admin, postgres, redis)
docker-compose down               # Stop all services
docker-compose logs -f            # View logs from all services
docker-compose logs -f backend    # View logs from specific service

# Database operations in Docker
make docker-migrate               # Run migrations in Docker container
make docker-migrate-down          # Rollback migrations in Docker
make docker-seed                  # Seed database in Docker
make docker-seed-clear            # Clear seeded data in Docker
```

## Key Architecture Patterns

### Database Schema
Hierarchical menu structure: **Restaurant → Category → SubCategory → Item**
- PostgreSQL database with GORM ORM
- Categories contain multiple subcategories
- Subcategories contain multiple items with images, prices, descriptions
- Clean architecture with domain entities, repositories, and services

### Database Migrations
- Uses `golang-migrate` for production-ready migrations
- Migration files located in `migrations/` directory
- Auto-migration is disabled in production mode
- Versioned migrations with up/down SQL files
- Supports rollback, goto specific version, and force operations

### API Structure
- Base API URL: `http://127.0.0.1:8000/`
- Health check: `/health`
- Menu endpoints: `/v1/categories`, `/v1/subcategories`, `/v1/items`
- File upload: `/v1/upload`
- Swagger documentation: `/swagger/index.html`
- Media files stored in AWS S3

### Frontend Structure
- **Customer Frontend** (`frontend/`): Next.js App Router with `src/app/` directory
  - Components in `src/app/components/` for reusable UI elements
  - Constants in `src/app/constants/` for configuration
  - Route-based pages: `/` (homepage), `/items` (menu display)
- **Admin Panel** (`admin-panel/`): React SPA with TanStack Router
  - Uses shadcn/ui component library built on RadixUI and TailwindCSS
  - File-based routing with TanStack Router
  - Global state management with Zustand
  - Forms with react-hook-form and zod validation
  - API communication with Axios and TanStack Query
  - Features: light/dark mode, responsive sidebar, global search command

### Backend Clean Architecture
The Go backend follows Clean Architecture principles with clear separation of concerns:
- **`cmd/`** - Application entry points
  - `cmd/server/` - Main API server
  - `cmd/migrate/` - Database migration CLI
  - `cmd/seed/` - Database seeding CLI
- **`internal/domain/`** - Business logic layer (no external dependencies)
  - `entities/` - Domain models (Category, SubCategory, Item, User, etc.)
  - `services/` - Business logic services
- **`internal/infrastructure/`** - External dependencies and implementations
  - `database/` - Repository implementations (PostgreSQL with GORM)
  - Storage implementations (AWS S3, GCP Cloud Storage)
- **`internal/interfaces/`** - Interface adapters
  - `handlers/` - HTTP handlers for API endpoints (Gin framework)
- **`internal/config/`** - Configuration management
- **`migrations/`** - Versioned SQL migration files (up/down)

### Styling System
- **Customer Frontend**: TailwindCSS v4 with Montserrat font family
- **Admin Panel**: TailwindCSS v4 with shadcn/ui components (RadixUI primitives)
- Both use responsive design patterns and support light/dark modes

## Development Environment

### Default Ports
- **Customer Frontend**: `localhost:3000`
- **Admin Panel**: `localhost:4000` (Docker) or `localhost:5173` (local dev)
- **Backend API**: `127.0.0.1:8000`
- **PostgreSQL**: `localhost:5433` (Docker) or `localhost:5432` (local)
- **Redis**: `localhost:6380` (Docker) or `localhost:6379` (local)

### Testing
- Go: Uses built-in testing framework with `make test`
- Supports unit tests, integration tests, and benchmarks
- ESLint provides code quality checks for frontend

### Media Handling
- Images uploaded to cloud storage (GCP Cloud Storage or AWS S3)
- File upload endpoint at `/v1/upload`
- Storage provider configurable via `STORAGE_PROVIDER` environment variable (gcp/aws)
- Environment variables required for cloud storage configuration

### Environment Configuration
- Backend uses `.env` file for configuration
- Key environment variables:
  - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` - PostgreSQL configuration
  - `REDIS_URL` - Redis connection string
  - `STORAGE_PROVIDER` - Cloud storage provider (gcp/aws)
  - `GCP_PROJECT_ID`, `GCP_BUCKET_NAME` - For GCP Cloud Storage
  - `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` - For AWS S3
  - `SERVER_PORT`, `SERVER_HOST`, `SERVER_ENVIRONMENT`
  - `RUN_SEED` - Set to "true" to automatically seed database on startup (Docker)
- See `.env.example` files for complete list of required variables
