# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture Overview

This is a full-stack restaurant menu application with separate frontend and backend:

- **Frontend**: Next.js 15.3.0 with React 19.0.0, TailwindCSS v4, App Router
- **Backend**: Go 1.21 with Gin framework, PostgreSQL database, Clean Architecture
- **Communication**: REST API with CORS enabled for cross-origin requests
- **Infrastructure**: Docker, AWS S3 for file storage, Redis for caching, Swagger documentation

## Development Commands

### Frontend (Next.js)
```bash
cd frontend/
npm run dev          # Start development server with Turbopack
npm run build        # Build for production  
npm run start        # Start production server
npm run lint         # Run ESLint
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
- Uses Next.js App Router with `src/app/` directory
- Components in `src/app/components/` for reusable UI elements
- Constants in `src/app/constants/` for configuration
- Route-based pages: `/` (homepage), `/items` (menu display)

### Key Files
- `frontend/src/app/page.js` - Homepage with hero, story, people, location sections
- `frontend/src/app/items/page.js` - Menu items display with category navigation
- `backend/cmd/server/main.go` - Application entry point and server initialization
- `backend/internal/domain/entities/` - Domain models (Category, SubCategory, Item, etc.)
- `backend/internal/interfaces/handlers/` - HTTP handlers for API endpoints
- `backend/internal/infrastructure/database/` - Repository implementations
- `backend/internal/domain/services/` - Business logic services
- `backend/internal/config/config.go` - Application configuration

### Styling System
- TailwindCSS v4 with custom configuration
- Montserrat font family configured in tailwind.config.js
- Responsive design patterns throughout components

## Development Environment

### Default Ports
- Frontend: `localhost:3000`
- Backend: `127.0.0.1:8000`
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`
- pgAdmin: `localhost:5050` (when running with Docker Compose)

### Testing
- Go: Uses built-in testing framework with `make test`
- Supports unit tests, integration tests, and benchmarks
- ESLint provides code quality checks for frontend

### Media Handling
- Images uploaded to AWS S3 bucket
- File upload endpoint at `/v1/upload`
- Environment variables for AWS configuration required
