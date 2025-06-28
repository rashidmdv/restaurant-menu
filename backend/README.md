# Restaurant Menu API

A production-ready Go REST API backend for restaurant menu management system built with clean architecture principles.

## Features

- **Clean Architecture**: Domain-driven design with clear separation of concerns
- **Database**: PostgreSQL with GORM ORM
- **File Storage**: AWS S3 integration for image uploads
- **API Versioning**: RESTful API with v1 prefix
- **Docker Support**: Multi-stage builds for development and production
- **Comprehensive Logging**: Structured logging with request correlation
- **Error Handling**: Standardized error responses and proper HTTP status codes
- **Health Checks**: Multiple health check endpoints for monitoring
- **CORS Support**: Configurable CORS for frontend integration
- **Rate Limiting**: Built-in rate limiting middleware
- **Request Validation**: Input validation with proper error messages

## Tech Stack

- **Language**: Go 1.21+
- **Framework**: Gin Gonic
- **Database**: PostgreSQL with GORM ORM
- **File Storage**: AWS S3
- **Containerization**: Docker & Docker Compose
- **Environment**: Docker support with multi-stage builds

## Project Structure

```
backend/
├── cmd/
│   └── server/
│       └── main.go                 # Application entry point
├── internal/
│   ├── config/
│   │   └── config.go              # Configuration management
│   ├── database/
│   │   ├── connection.go          # Database connection setup
│   │   └── migrations/
│   │       └── seeds.go           # Database seeding
│   ├── domain/
│   │   ├── entities/              # Domain entities/models
│   │   ├── repositories/          # Repository interfaces
│   │   └── services/              # Business logic services
│   ├── infrastructure/
│   │   ├── aws/
│   │   │   └── s3.go             # S3 client implementation
│   │   ├── database/
│   │   │   └── *_repository.go   # Repository implementations
│   │   └── web/
│   │       └── server.go         # HTTP server setup
│   └── interfaces/
│       ├── handlers/              # HTTP handlers
│       ├── middleware/            # HTTP middleware
│       └── validators/            # Request validators
├── pkg/
│   ├── logger/                    # Logging utilities
│   ├── errors/                    # Error handling
│   └── response/                  # Response utilities
├── deployments/
│   └── docker/                    # Docker configurations
├── scripts/                       # Utility scripts
├── uploads/                       # Local file uploads (development)
├── docker-compose.yml
├── Dockerfile
└── README.md
```

## Database Schema

The API uses a hierarchical menu structure:

**Category → SubCategory → Item**

### Tables

1. **categories** - Main menu categories
2. **sub_categories** - Subcategories within categories
3. **items** - Individual menu items
4. **restaurant_info** - Restaurant information
5. **operating_hours** - Restaurant operating hours
6. **content_sections** - CMS content sections

## API Endpoints

### Health & Status
- `GET /health` - Basic health check
- `GET /health/ready` - Readiness check with dependencies
- `GET /health/live` - Liveness check
- `GET /v1/status` - Detailed API status

### Menu Management
- `GET /v1/menu` - Complete hierarchical menu
- `GET /v1/categories` - List categories
- `POST /v1/categories` - Create category
- `GET /v1/categories/{id}` - Get category
- `PUT /v1/categories/{id}` - Update category
- `DELETE /v1/categories/{id}` - Delete category
- `PATCH /v1/categories/{id}/toggle` - Toggle category active status
- `PATCH /v1/categories/{id}/order` - Update display order

### File Management
- `POST /v1/upload/image` - Upload image to S3
- `DELETE /v1/upload/image/{key}` - Delete image from S3
- `GET /v1/upload/presigned-url` - Get presigned URL for direct upload

## Quick Start

### Prerequisites

- Go 1.21+
- Docker & Docker Compose
- PostgreSQL (if running locally)
- AWS Account with S3 access

### Environment Setup

1. Copy the environment file:
```bash
cp .env.example .env
```

2. Update the `.env` file with your configurations:
```env
# Database
DB_PASSWORD=your_secure_password

# AWS S3
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET=your-bucket-name
```

### Running with Docker Compose (Recommended)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop services
docker-compose down
```

This will start:
- PostgreSQL database (port 5432)
- Redis (port 6379)
- API server (port 8000)
- pgAdmin (port 5050) - optional

### Running Locally

1. Install dependencies:
```bash
go mod download
```

2. Start PostgreSQL and Redis (or use Docker):
```bash
docker-compose up -d postgres redis
```

3. Run the application:
```bash
go run cmd/server/main.go
```

### Development Tools

Start pgAdmin for database management:
```bash
docker-compose --profile tools up -d pgadmin
```

Access pgAdmin at http://localhost:5050:
- Email: admin@restaurant.com
- Password: admin

## API Usage Examples

### Get Complete Menu
```bash
curl http://localhost:8000/v1/menu
```

### Create a Category
```bash
curl -X POST http://localhost:8000/v1/categories \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Appetizers",
    "description": "Start your meal with our delicious appetizers",
    "display_order": 1,
    "active": true
  }'
```

### Upload an Image
```bash
curl -X POST http://localhost:8000/v1/upload/image \
  -F "image=@/path/to/your/image.jpg" \
  -F "folder=items"
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SERVER_PORT` | Server port | `8000` |
| `SERVER_ENVIRONMENT` | Environment (development/production) | `development` |
| `DB_HOST` | Database host | `localhost` |
| `DB_PORT` | Database port | `5432` |
| `DB_USER` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | **Required** |
| `DB_NAME` | Database name | `restaurant_menu` |
| `AWS_ACCESS_KEY_ID` | AWS access key | **Required** |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | **Required** |
| `S3_BUCKET` | S3 bucket name | **Required** |
| `LOG_LEVEL` | Log level (debug/info/warn/error) | `info` |

### AWS S3 Setup

1. Create an S3 bucket for image storage
2. Create an IAM user with S3 permissions
3. Generate access keys for the IAM user
4. Update the environment variables

Required S3 permissions:
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::your-bucket-name",
                "arn:aws:s3:::your-bucket-name/*"
            ]
        }
    ]
}
```

## Development

### Building

```bash
# Build for current platform
go build -o bin/server cmd/server/main.go

# Build for Linux (production)
GOOS=linux GOARCH=amd64 go build -o bin/server-linux cmd/server/main.go
```

### Testing

```bash
# Run tests
go test ./...

# Run tests with coverage
go test -cover ./...

# Run tests with verbose output
go test -v ./...
```

### Database Migrations

The application uses GORM's AutoMigrate feature. Migrations run automatically on startup.

To manually seed the database with sample data:
```bash
# This happens automatically in development mode
# For production, implement a separate seeding strategy
```

## Production Deployment

### Docker Production Build

```bash
# Build production image
docker build -t restaurant-menu-api:latest .

# Run production container
docker run -p 8000:8000 \
  -e DB_HOST=your-db-host \
  -e DB_PASSWORD=your-password \
  -e AWS_ACCESS_KEY_ID=your-key \
  -e AWS_SECRET_ACCESS_KEY=your-secret \
  restaurant-menu-api:latest
```

### Kubernetes Deployment

Example Kubernetes manifests are available in the `deployments/k8s/` directory.

### Environment Considerations

For production deployment:

1. **Security**:
   - Use strong database passwords
   - Rotate AWS keys regularly
   - Enable SSL/TLS
   - Configure proper CORS origins

2. **Performance**:
   - Use Redis for caching
   - Configure proper database connection pooling
   - Set up CDN for static assets

3. **Monitoring**:
   - Configure log aggregation
   - Set up health check monitoring
   - Implement metrics collection

## Monitoring

### Health Checks

- `/health` - Basic health check
- `/health/ready` - Checks database connectivity
- `/health/live` - Liveness probe for Kubernetes

### Logging

The application uses structured JSON logging with:
- Request correlation IDs
- Performance metrics
- Error tracking
- Audit trails

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.