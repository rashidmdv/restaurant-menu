# API Documentation Generation

This guide explains how to generate and serve Swagger/OpenAPI documentation for the Restaurant Menu API.

## Quick Start

### Using Makefile (Recommended)

```bash
# Navigate to backend directory
cd backend/

# Generate Swagger documentation
make swagger

# Generate and serve documentation at http://localhost:8080
make swagger-serve
```

### Manual Generation

```bash
# Install swag tool
go install github.com/swaggo/swag/cmd/swag@latest

# Generate docs
swag init -g cmd/server/main.go -o ./docs

# Install swagger-ui-serve (for serving)
npm install -g swagger-ui-serve

# Serve the documentation
swagger-ui-serve docs/swagger.json
```

## Generated Files

After running `make swagger`, you'll find these files in the `docs/` directory:

- `docs.go` - Generated Go documentation
- `swagger.json` - OpenAPI 3.0 specification in JSON
- `swagger.yaml` - OpenAPI 3.0 specification in YAML

## Accessing Documentation

### Local Development
- **Swagger UI**: http://localhost:8080 (when using `make swagger-serve`)
- **JSON Spec**: http://localhost:8000/swagger/doc.json (if integrated)
- **YAML Spec**: Available in `docs/swagger.yaml`

### Integration with Your API

To serve Swagger UI directly from your API server, add this to your `server.go`:

```go
import "github.com/swaggo/gin-swagger"
import "github.com/swaggo/files"
import _ "restaurant-menu-api/docs" // Import generated docs

// Add this route in setupRoutes()
s.router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
```

Then access at: http://localhost:8000/swagger/index.html

## Swagger Annotations

The documentation is generated from Go comments using Swagger annotations. Here are examples:

### General API Info (in main.go)
```go
// @title Restaurant Menu API
// @version 1.0
// @description A production-ready REST API for restaurant menu management
// @host localhost:8000
// @BasePath /
```

### Handler Annotations
```go
// GetAllCategories godoc
// @Summary List all categories
// @Description Get all categories with optional filtering and pagination
// @Tags Categories
// @Accept json
// @Produce json
// @Param active query boolean false "Filter by active status"
// @Param search query string false "Search term"
// @Success 200 {array} entities.Category
// @Failure 500 {object} response.APIResponse
// @Router /v1/categories [get]
func (h *CategoryHandler) GetAll(c *gin.Context) {
    // Implementation
}
```

### Common Annotations

| Annotation | Description | Example |
|------------|-------------|---------|
| `@Summary` | Brief description | `@Summary Get all categories` |
| `@Description` | Detailed description | `@Description Retrieve all menu categories` |
| `@Tags` | Group endpoints | `@Tags Categories` |
| `@Accept` | Input format | `@Accept json` |
| `@Produce` | Output format | `@Produce json` |
| `@Param` | Parameter definition | `@Param id path int true "Category ID"` |
| `@Success` | Success response | `@Success 200 {object} Category` |
| `@Failure` | Error response | `@Failure 404 {object} APIResponse` |
| `@Router` | Route definition | `@Router /v1/categories [get]` |

### Parameter Types

- `path` - URL path parameter
- `query` - URL query parameter
- `body` - Request body
- `header` - HTTP header
- `formData` - Form data

## Complete API Endpoints

The generated documentation will include all these endpoints:

### Health & Status
- `GET /health` - Basic health check
- `GET /health/ready` - Readiness probe
- `GET /health/live` - Liveness probe
- `GET /v1/status` - Detailed status

### Menu
- `GET /v1/menu` - Complete hierarchical menu

### Categories
- `GET /v1/categories` - List categories
- `POST /v1/categories` - Create category
- `GET /v1/categories/{id}` - Get category
- `PUT /v1/categories/{id}` - Update category
- `DELETE /v1/categories/{id}` - Delete category
- `PATCH /v1/categories/{id}/toggle` - Toggle active
- `PATCH /v1/categories/{id}/order` - Update order

### SubCategories
- `GET /v1/subcategories` - List subcategories
- `POST /v1/subcategories` - Create subcategory
- `GET /v1/subcategories/{id}` - Get subcategory
- `PUT /v1/subcategories/{id}` - Update subcategory
- `DELETE /v1/subcategories/{id}` - Delete subcategory
- `PATCH /v1/subcategories/{id}/toggle` - Toggle active
- `PATCH /v1/subcategories/{id}/order` - Update order

### Items
- `GET /v1/items` - List items
- `POST /v1/items` - Create item
- `GET /v1/items/{id}` - Get item
- `PUT /v1/items/{id}` - Update item
- `DELETE /v1/items/{id}` - Delete item
- `PATCH /v1/items/{id}/toggle` - Toggle available
- `PATCH /v1/items/{id}/order` - Update order
- `PATCH /v1/items/{id}/price` - Update price
- `GET /v1/items/search` - Search items
- `GET /v1/items/featured` - Get featured items

### Upload
- `POST /v1/upload/image` - Upload image
- `DELETE /v1/upload/image/{key}` - Delete image
- `GET /v1/upload/presigned-url` - Get presigned URL

## Customization

### Adding More Annotations

To add documentation for more endpoints, add Swagger comments above your handler functions:

```go
// HandlerName godoc
// @Summary Brief description
// @Description Longer description
// @Tags GroupName
// @Accept json
// @Produce json
// @Param paramName paramType dataType required "Description"
// @Success 200 {object} ResponseType
// @Failure 400 {object} response.APIResponse
// @Router /v1/endpoint [method]
func (h *Handler) HandlerName(c *gin.Context) {
    // Implementation
}
```

### Response Models

Ensure your response models have proper JSON tags:

```go
type Category struct {
    ID          uint   `json:"id"`
    Name        string `json:"name"`
    Description string `json:"description"`
    Active      bool   `json:"active"`
}
```

## Troubleshooting

### Common Issues

1. **"swag: command not found"**
   ```bash
   go install github.com/swaggo/swag/cmd/swag@latest
   ```

2. **"No API Definition"**
   - Ensure annotations are in `cmd/server/main.go`
   - Check annotation syntax

3. **Missing Endpoints**
   - Add annotations to handler functions
   - Ensure proper `@Router` paths

4. **Type Not Found**
   - Import the package containing the type
   - Use fully qualified type names if needed

### Regenerating Documentation

Whenever you modify API endpoints or annotations:

```bash
make swagger
```

The documentation will be automatically updated.

## CI/CD Integration

Add to your CI pipeline:

```yaml
- name: Generate API Documentation
  run: |
    cd backend
    make swagger
    
- name: Upload Documentation
  # Upload docs/ directory to your documentation hosting
```

## Additional Resources

- [Swag Documentation](https://github.com/swaggo/swag)
- [OpenAPI Specification](https://swagger.io/specification/)
- [Swagger UI](https://swagger.io/tools/swagger-ui/)