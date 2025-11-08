# Restaurant Menu Application

A full-stack web application for displaying and managing restaurant menus with a modern, responsive design.

## Tech Stack

- **Frontend (Customer-facing)**: Next.js 15.3.0 with React 19.0.0, TailwindCSS v4
- **Admin Panel**: React 19.1.0 with Vite, TanStack Router, shadcn/ui, TypeScript
- **Backend**: Go 1.23+ with Gin framework
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **Storage**: GCP Cloud Storage / AWS S3
- **Infrastructure**: Docker Compose

## Quick Start

### Prerequisites
- Node.js 18+ (for frontend and admin panel)
- Go 1.23+ (for backend)
- Docker and Docker Compose (recommended)
- PostgreSQL 15 (if running locally without Docker)
- pnpm (for admin panel: `npm install -g pnpm`)

### Option 1: Docker Compose (Recommended)

Start all services with a single command:

```bash
# From project root
docker-compose up -d
```

This will start:
- Backend API at `http://localhost:8000`
- Customer Frontend at `http://localhost:3000`
- Admin Panel at `http://localhost:4000`
- PostgreSQL at `localhost:5433`
- Redis at `localhost:6380`

View logs:
```bash
docker-compose logs -f
```

Stop services:
```bash
docker-compose down
```

### Option 2: Local Development

#### 1. Backend Setup
```bash
cd backend/

# Copy environment file and configure
cp .env.example .env
# Edit .env with your database credentials and cloud storage settings

# Install dependencies
go mod download

# Run database migrations
make db-migrate

# Seed database (optional)
make db-seed

# Start development server with hot reload
make dev
```

Backend API will be available at `http://127.0.0.1:8000`

API Documentation (Swagger): `http://127.0.0.1:8000/swagger/index.html`

#### 2. Frontend Setup
```bash
cd frontend/

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will be available at `http://localhost:3000`

#### 3. Admin Panel Setup
```bash
cd admin-panel/

# Install dependencies
pnpm install

# Start development server
pnpm run dev
```

Admin panel will be available at `http://localhost:5173`

## Features

- **Customer Frontend**:
  - Responsive design for mobile and desktop
  - Browse menu items by category and subcategory
  - View item details with images and descriptions
  - Modern UI with TailwindCSS

- **Admin Panel**:
  - Full CRUD operations for menu management
  - Categories, subcategories, and items management
  - Image upload to cloud storage
  - Light/dark mode support
  - Responsive sidebar navigation
  - Global search functionality
  - Form validation with zod

- **Backend API**:
  - RESTful API with Swagger documentation
  - Clean Architecture design pattern
  - PostgreSQL database with GORM ORM
  - Redis caching
  - Cloud storage integration (GCP/AWS)
  - Database migrations with golang-migrate
  - Health check endpoint

## API Endpoints

- `GET /health` - Health check
- `GET /v1/categories` - List all categories
- `GET /v1/categories/:id` - Get category details
- `GET /v1/subcategories` - List all subcategories
- `GET /v1/subcategories/:id` - Get subcategory details
- `GET /v1/items` - List all menu items (with pagination)
- `GET /v1/items/:id` - Get item details
- `POST /v1/upload` - Upload images to cloud storage
- `GET /swagger/index.html` - API documentation

## Development Commands

### Backend (Go)
```bash
make dev                    # Start development server with hot reload
make build                  # Build the application
make test                   # Run tests
make lint                   # Run linter
make swagger               # Generate Swagger documentation

# Database migrations
make db-migrate            # Run all pending migrations
make db-migrate-down       # Rollback all migrations
make db-migrate-create NAME=migration_name  # Create new migration
make db-seed               # Seed database with sample data
make db-reset              # Reset database (drop and recreate)
```

### Frontend (Next.js)
```bash
npm run dev                # Start development server
npm run build              # Build for production
npm run start              # Start production server
npm run lint               # Run ESLint
```

### Admin Panel (Vite + React)
```bash
pnpm run dev               # Start development server
pnpm run build             # Build for production
pnpm run preview           # Preview production build
pnpm run lint              # Run ESLint
pnpm run format            # Format code with Prettier
```

## Project Structure

```
.
├── backend/               # Go backend API
│   ├── cmd/              # Application entry points
│   ├── internal/         # Internal application code
│   │   ├── config/      # Configuration
│   │   ├── domain/      # Business logic and entities
│   │   ├── infrastructure/ # External dependencies
│   │   └── interfaces/  # HTTP handlers
│   ├── migrations/       # Database migrations
│   └── Makefile         # Build and development commands
├── frontend/             # Next.js customer frontend
│   └── src/
│       └── app/         # App router pages and components
├── admin-panel/          # React admin panel
│   └── src/
│       ├── components/  # Reusable UI components
│       ├── pages/       # Page components
│       └── lib/         # Utilities and helpers
└── docker-compose.yml    # Docker orchestration
```

## Environment Variables

See `.env.example` in the backend directory for required environment variables:

- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` - PostgreSQL configuration
- `REDIS_URL` - Redis connection string
- `STORAGE_PROVIDER` - Cloud storage provider (gcp or aws)
- `GCP_PROJECT_ID`, `GCP_BUCKET_NAME` - For GCP Cloud Storage
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` - For AWS S3
- `SERVER_PORT`, `SERVER_HOST` - Server configuration
- `CORS_ALLOWED_ORIGINS` - CORS configuration

## Database Schema

Hierarchical menu structure:
- **Restaurant** → **Category** → **SubCategory** → **Item**

Each item can have:
- Name, description, price
- Multiple images stored in cloud storage
- Availability status
- Dietary information

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
