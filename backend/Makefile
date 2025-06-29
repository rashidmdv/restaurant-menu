# Restaurant Menu API Makefile

# Variables
APP_NAME=restaurant-menu-api
BINARY_NAME=main
DOCKER_IMAGE=restaurant-menu-api
DOCKER_TAG=latest
GO_VERSION=1.21
MAIN_PATH=./cmd/server

# Go related variables
GOBASE=$(shell pwd)
GOBIN=$(GOBASE)/bin
GOFILES=$(wildcard *.go)

# Colors for output
GREEN=\033[0;32m
YELLOW=\033[0;33m
RED=\033[0;31m
NC=\033[0m # No Color

.PHONY: help
help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

.PHONY: deps
deps: ## Install dependencies
	@echo "$(GREEN)Installing dependencies...$(NC)"
	go mod download
	go mod tidy
	go mod verify

.PHONY: build
build: deps ## Build the application
	@echo "$(GREEN)Building $(APP_NAME)...$(NC)"
	@mkdir -p $(GOBIN)
	CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -ldflags '-extldflags "-static"' -o $(GOBIN)/$(BINARY_NAME) $(MAIN_PATH)
	@echo "$(GREEN)Build completed: $(GOBIN)/$(BINARY_NAME)$(NC)"

.PHONY: build-local
build-local: deps ## Build the application for local OS
	@echo "$(GREEN)Building $(APP_NAME) for local OS...$(NC)"
	@mkdir -p $(GOBIN)
	go build -o $(GOBIN)/$(BINARY_NAME) $(MAIN_PATH)
	@echo "$(GREEN)Local build completed: $(GOBIN)/$(BINARY_NAME)$(NC)"

.PHONY: run
run: build-local ## Build and run the application locally
	@echo "$(GREEN)Running $(APP_NAME)...$(NC)"
	$(GOBIN)/$(BINARY_NAME)

.PHONY: dev
dev: ## Run in development mode with hot reload (requires air)
	@echo "$(GREEN)Starting development server with hot reload...$(NC)"
	@if ! command -v air > /dev/null && ! test -f $(shell go env GOPATH)/bin/air; then \
		echo "$(YELLOW)Installing air for hot reload...$(NC)"; \
		go install github.com/air-verse/air@latest; \
	fi
	@if command -v air > /dev/null; then \
		air; \
	else \
		$(shell go env GOPATH)/bin/air; \
	fi

.PHONY: test
test: ## Run tests
	@echo "$(GREEN)Running tests...$(NC)"
	go test -v -race -coverprofile=coverage.out ./...
	@echo "$(GREEN)Tests completed$(NC)"

.PHONY: test-coverage
test-coverage: test ## Run tests with coverage report
	@echo "$(GREEN)Generating coverage report...$(NC)"
	go tool cover -html=coverage.out -o coverage.html
	@echo "$(GREEN)Coverage report generated: coverage.html$(NC)"

.PHONY: test-integration
test-integration: ## Run integration tests
	@echo "$(GREEN)Running integration tests...$(NC)"
	go test -v -tags=integration ./...

.PHONY: benchmark
benchmark: ## Run benchmarks
	@echo "$(GREEN)Running benchmarks...$(NC)"
	go test -bench=. -benchmem ./...

.PHONY: lint
lint: ## Run linter
	@echo "$(GREEN)Running linter...$(NC)"
	@if ! command -v golangci-lint > /dev/null; then \
		echo "$(YELLOW)Installing golangci-lint...$(NC)"; \
		curl -sSfL https://raw.githubusercontent.com/golangci/golangci-lint/master/install.sh | sh -s -- -b $(go env GOPATH)/bin v1.54.2; \
	fi
	golangci-lint run

.PHONY: fmt
fmt: ## Format code
	@echo "$(GREEN)Formatting code...$(NC)"
	go fmt ./...
	goimports -w .

.PHONY: vet
vet: ## Run go vet
	@echo "$(GREEN)Running go vet...$(NC)"
	go vet ./...

.PHONY: security
security: ## Run security checks
	@echo "$(GREEN)Running security checks...$(NC)"
	@if ! command -v gosec > /dev/null; then \
		echo "$(YELLOW)Installing gosec...$(NC)"; \
		go install github.com/securecodewarrior/gosec/v2/cmd/gosec@latest; \
	fi
	gosec ./...

.PHONY: mod-check
mod-check: ## Check go modules
	@echo "$(GREEN)Checking go modules...$(NC)"
	go mod verify
	go mod tidy
	git diff --exit-code go.mod go.sum

.PHONY: clean
clean: ## Clean build artifacts
	@echo "$(GREEN)Cleaning build artifacts...$(NC)"
	go clean
	rm -f $(GOBIN)/$(BINARY_NAME)
	rm -f coverage.out coverage.html
	rm -rf tmp/

.PHONY: docker-build
docker-build: ## Build Docker image
	@echo "$(GREEN)Building Docker image $(DOCKER_IMAGE):$(DOCKER_TAG)...$(NC)"
	docker build -t $(DOCKER_IMAGE):$(DOCKER_TAG) .
	@echo "$(GREEN)Docker image built successfully$(NC)"

.PHONY: docker-run
docker-run: ## Run Docker container
	@echo "$(GREEN)Running Docker container...$(NC)"
	docker run --rm -p 8000:8000 \
		-e DB_HOST=host.docker.internal \
		-e DB_PASSWORD=password \
		-e AWS_ACCESS_KEY_ID=test \
		-e AWS_SECRET_ACCESS_KEY=test \
		$(DOCKER_IMAGE):$(DOCKER_TAG)

.PHONY: docker-push
docker-push: docker-build ## Push Docker image to registry
	@echo "$(GREEN)Pushing Docker image...$(NC)"
	docker push $(DOCKER_IMAGE):$(DOCKER_TAG)

.PHONY: compose-up
compose-up: ## Start services with docker-compose
	@echo "$(GREEN)Starting services with docker-compose...$(NC)"
	docker-compose up -d

.PHONY: compose-down
compose-down: ## Stop services with docker-compose
	@echo "$(GREEN)Stopping services with docker-compose...$(NC)"
	docker-compose down

.PHONY: compose-logs
compose-logs: ## View docker-compose logs
	@echo "$(GREEN)Viewing docker-compose logs...$(NC)"
	docker-compose logs -f

.PHONY: compose-build
compose-build: ## Build and start services with docker-compose
	@echo "$(GREEN)Building and starting services...$(NC)"
	docker-compose up --build -d

.PHONY: db-migrate
db-migrate: ## Run database migrations
	@echo "$(GREEN)Running database migrations...$(NC)"
	go run ./cmd/migrate -command=up

.PHONY: db-migrate-down
db-migrate-down: ## Rollback all database migrations
	@echo "$(YELLOW)Rolling back database migrations...$(NC)"
	go run ./cmd/migrate -command=down

.PHONY: db-migrate-version
db-migrate-version: ## Show current migration version
	@echo "$(GREEN)Checking migration version...$(NC)"
	go run ./cmd/migrate -command=version

.PHONY: db-migrate-force
db-migrate-force: ## Force migration to specific version (requires VERSION=n)
	@echo "$(YELLOW)Forcing migration to version $(VERSION)...$(NC)"
	@if [ -z "$(VERSION)" ]; then echo "$(RED)VERSION must be specified: make db-migrate-force VERSION=1$(NC)"; exit 1; fi
	go run ./cmd/migrate -command=force -version=$(VERSION)

.PHONY: db-migrate-goto
db-migrate-goto: ## Migrate to specific version (requires VERSION=n)
	@echo "$(GREEN)Migrating to version $(VERSION)...$(NC)"
	@if [ -z "$(VERSION)" ]; then echo "$(RED)VERSION must be specified: make db-migrate-goto VERSION=1$(NC)"; exit 1; fi
	go run ./cmd/migrate -command=goto -version=$(VERSION)

.PHONY: db-migrate-steps
db-migrate-steps: ## Run n migration steps (requires STEPS=n, use negative for rollback)
	@echo "$(GREEN)Running $(STEPS) migration steps...$(NC)"
	@if [ -z "$(STEPS)" ]; then echo "$(RED)STEPS must be specified: make db-migrate-steps STEPS=1$(NC)"; exit 1; fi
	go run ./cmd/migrate -command=steps -steps=$(STEPS)

.PHONY: db-migrate-drop
db-migrate-drop: ## Drop all database tables (DANGEROUS)
	@echo "$(RED)Dropping all database tables...$(NC)"
	go run ./cmd/migrate -command=drop

.PHONY: db-migrate-create
db-migrate-create: ## Create a new migration file (requires NAME=migration_name)
	@echo "$(GREEN)Creating new migration: $(NAME)...$(NC)"
	@if [ -z "$(NAME)" ]; then echo "$(RED)NAME must be specified: make db-migrate-create NAME=add_user_table$(NC)"; exit 1; fi
	@TIMESTAMP=$$(date +%s); \
	PADDED_TIMESTAMP=$$(printf "%06d" $$TIMESTAMP); \
	UP_FILE="migrations/$${PADDED_TIMESTAMP}_$(NAME).up.sql"; \
	DOWN_FILE="migrations/$${PADDED_TIMESTAMP}_$(NAME).down.sql"; \
	echo "-- Migration: $(NAME)" > $$UP_FILE; \
	echo "-- Add your migration SQL here" >> $$UP_FILE; \
	echo "" >> $$UP_FILE; \
	echo "-- Rollback: $(NAME)" > $$DOWN_FILE; \
	echo "-- Add your rollback SQL here" >> $$DOWN_FILE; \
	echo "" >> $$DOWN_FILE; \
	echo "$(GREEN)Created migration files:$(NC)"; \
	echo "  $$UP_FILE"; \
	echo "  $$DOWN_FILE"

.PHONY: db-seed
db-seed: ## Seed database with sample data
	@echo "$(GREEN)Seeding database...$(NC)"
	go run $(MAIN_PATH) seed

.PHONY: db-reset
db-reset: ## Reset database (drop and recreate with migrations)
	@echo "$(YELLOW)Resetting database...$(NC)"
	@read -p "Are you sure you want to reset the database? This will drop all data! [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		echo "$(GREEN)Dropping all tables...$(NC)"; \
		go run ./cmd/migrate -command=drop; \
		echo "$(GREEN)Running migrations...$(NC)"; \
		go run ./cmd/migrate -command=up; \
		echo "$(GREEN)Database reset complete$(NC)"; \
	else \
		echo "$(RED)Database reset cancelled$(NC)"; \
	fi

.PHONY: tools
tools: ## Install development tools
	@echo "$(GREEN)Installing development tools...$(NC)"
	go install github.com/air-verse/air@latest
	go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest
	go install github.com/securecodewarrior/gosec/v2/cmd/gosec@latest
	go install golang.org/x/tools/cmd/goimports@latest
	go install github.com/swaggo/swag/cmd/swag@latest

.PHONY: swagger
swagger: ## Generate Swagger documentation
	@echo "$(GREEN)Generating Swagger documentation...$(NC)"
	@if [ ! -f "$$(go env GOPATH)/bin/swag" ]; then \
		echo "$(YELLOW)Installing swag...$(NC)"; \
		go install github.com/swaggo/swag/cmd/swag@latest; \
	fi
	@export PATH="$$PATH:$$(go env GOPATH)/bin" && swag init -g cmd/server/main.go -o ./docs --parseDependency --parseInternal
	@echo "$(GREEN)Swagger documentation generated in ./docs/$(NC)"

.PHONY: swagger-serve
swagger-serve: swagger ## Generate and serve Swagger UI
	@echo "$(GREEN)Serving Swagger UI at http://localhost:8080$(NC)"
	@if ! command -v swagger > /dev/null; then \
		echo "$(YELLOW)Please install swagger-ui-serve: npm install -g swagger-ui-serve$(NC)"; \
		exit 1; \
	fi
	swagger-ui-serve docs/swagger.json

.PHONY: health-check
health-check: ## Check if the application is healthy
	@echo "$(GREEN)Checking application health...$(NC)"
	@curl -f http://localhost:8000/health || (echo "$(RED)Health check failed$(NC)" && exit 1)
	@echo "$(GREEN)Application is healthy$(NC)"

.PHONY: load-test
load-test: ## Run load tests (requires hey)
	@echo "$(GREEN)Running load tests...$(NC)"
	@if ! command -v hey > /dev/null; then \
		echo "$(YELLOW)Installing hey for load testing...$(NC)"; \
		go install github.com/rakyll/hey@latest; \
	fi
	hey -n 1000 -c 10 http://localhost:8000/health

.PHONY: env-check
env-check: ## Check required environment variables
	@echo "$(GREEN)Checking environment variables...$(NC)"
	@if [ -z "$$DB_PASSWORD" ]; then echo "$(RED)DB_PASSWORD is not set$(NC)"; exit 1; fi
	@if [ -z "$$AWS_ACCESS_KEY_ID" ]; then echo "$(RED)AWS_ACCESS_KEY_ID is not set$(NC)"; exit 1; fi
	@if [ -z "$$AWS_SECRET_ACCESS_KEY" ]; then echo "$(RED)AWS_SECRET_ACCESS_KEY is not set$(NC)"; exit 1; fi
	@echo "$(GREEN)All required environment variables are set$(NC)"

.PHONY: setup
setup: deps tools ## Setup development environment
	@echo "$(GREEN)Setting up development environment...$(NC)"
	@if [ ! -f .env ]; then \
		echo "$(YELLOW)Creating .env file from .env.example...$(NC)"; \
		cp .env.example .env; \
		echo "$(YELLOW)Please update .env with your configuration$(NC)"; \
	fi
	@echo "$(GREEN)Development environment setup complete$(NC)"

.PHONY: ci
ci: deps fmt vet lint test security ## Run CI pipeline
	@echo "$(GREEN)Running CI pipeline...$(NC)"

.PHONY: release
release: ci build docker-build ## Prepare release
	@echo "$(GREEN)Release prepared$(NC)"

.PHONY: deploy-staging
deploy-staging: ## Deploy to staging environment
	@echo "$(GREEN)Deploying to staging...$(NC)"
	# Add your staging deployment commands here

.PHONY: deploy-production
deploy-production: ## Deploy to production environment
	@echo "$(YELLOW)Deploying to production...$(NC)"
	@read -p "Are you sure you want to deploy to production? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		echo "$(GREEN)Deploying to production...$(NC)"; \
		# Add your production deployment commands here \
	else \
		echo "$(RED)Deployment cancelled$(NC)"; \
	fi

.PHONY: backup-db
backup-db: ## Backup database
	@echo "$(GREEN)Creating database backup...$(NC)"
	# Add database backup commands here

.PHONY: restore-db
restore-db: ## Restore database from backup
	@echo "$(YELLOW)Restoring database from backup...$(NC)"
	# Add database restore commands here

.PHONY: monitor
monitor: ## Monitor application metrics
	@echo "$(GREEN)Monitoring application...$(NC)"
	@watch -n 5 'curl -s http://localhost:8000/v1/status | jq'

.PHONY: logs
logs: ## View application logs
	@echo "$(GREEN)Viewing application logs...$(NC)"
	tail -f /var/log/restaurant-menu-api.log 2>/dev/null || echo "$(YELLOW)Log file not found. Run with docker-compose to see logs.$(NC)"

# Default target
.DEFAULT_GOAL := help
