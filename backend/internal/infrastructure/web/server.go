package web

import (
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"

	"restaurant-menu-api/internal/config"
	"restaurant-menu-api/internal/database"
	"restaurant-menu-api/internal/domain/services"
	"restaurant-menu-api/internal/infrastructure/aws"
	databaseRepo "restaurant-menu-api/internal/infrastructure/database"
	"restaurant-menu-api/internal/infrastructure/redis"
	"restaurant-menu-api/internal/interfaces/handlers"
	"restaurant-menu-api/internal/interfaces/middleware"
	"restaurant-menu-api/pkg/logger"

	_ "restaurant-menu-api/docs" // Import generated docs
)

type ServerConfig struct {
	Config      *config.Config
	DB          *database.Database
	S3Client    *aws.S3Client
	RedisClient *redis.Client
	Logger      *logger.Logger
}

type Server struct {
	config      *config.Config
	router      *gin.Engine
	db          *database.Database
	s3Client    *aws.S3Client
	redisClient *redis.Client
	logger      *logger.Logger
}

func NewServer(cfg *ServerConfig) *Server {
	// Set Gin mode based on environment
	if cfg.Config.IsProduction() {
		gin.SetMode(gin.ReleaseMode)
	} else {
		gin.SetMode(gin.DebugMode)
	}

	server := &Server{
		config:      cfg.Config,
		db:          cfg.DB,
		s3Client:    cfg.S3Client,
		redisClient: cfg.RedisClient,
		logger:      cfg.Logger,
	}

	server.setupRouter()
	return server
}

func (s *Server) setupRouter() {
	s.router = gin.New()

	// Setup middleware
	s.setupMiddleware()

	// Setup routes
	s.setupRoutes()
}

func (s *Server) setupMiddleware() {
	// Recovery middleware
	s.router.Use(gin.Recovery())

	// CORS middleware
	s.router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5174", "http://127.0.0.1:5174", "http://localhost:5173", "http://127.0.0.1:5173"}, // Add your frontend URLs
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization", "X-Requested-With"},
		ExposeHeaders:    []string{"Content-Length", "X-Request-ID"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Custom middleware
	s.router.Use(middleware.RequestLogger(s.logger))
	s.router.Use(middleware.RequestID())
	s.router.Use(middleware.TimestampMiddleware())

	// Rate limiting - use Redis-based if available, fallback to simple limiter
	if s.redisClient != nil {
		advancedRateLimiter := middleware.NewAdvancedRateLimiter(s.redisClient, s.logger)
		s.router.Use(advancedRateLimiter.Middleware())
	} else {
		simpleRateLimiter := middleware.NewSimpleRateLimiter(100, time.Minute)
		s.router.Use(simpleRateLimiter.Middleware())
	}

	s.router.Use(middleware.Timeout(30 * time.Second))
}

func (s *Server) setupRoutes() {
	// Initialize repositories
	categoryRepo := databaseRepo.NewCategoryRepository(s.db.DB)
	subCategoryRepo := databaseRepo.NewSubCategoryRepository(s.db.DB)
	itemRepo := databaseRepo.NewItemRepository(s.db.DB)
	restaurantRepo := databaseRepo.NewRestaurantRepository(s.db.DB)
	contentRepo := databaseRepo.NewContentRepository(s.db.DB)

	// Initialize services
	categoryService := services.NewCategoryService(categoryRepo, s.logger)
	subCategoryService := services.NewSubCategoryService(subCategoryRepo, s.logger)
	itemService := services.NewItemService(itemRepo, s.logger)
	restaurantService := services.NewRestaurantService(restaurantRepo, s.logger)
	contentService := services.NewContentService(contentRepo, s.logger)
	menuService := services.NewMenuService(categoryRepo, subCategoryRepo, itemRepo, s.logger)

	// Initialize handlers
	healthHandler := handlers.NewHealthHandler(s.db, s.logger)
	categoryHandler := handlers.NewCategoryHandler(categoryService, s.logger)
	subCategoryHandler := handlers.NewSubCategoryHandler(subCategoryService, categoryService, s.logger)
	itemHandler := handlers.NewItemHandler(itemService, subCategoryService, s.logger)
	restaurantHandler := handlers.NewRestaurantHandler(restaurantService, s.logger)
	contentHandler := handlers.NewContentHandler(contentService, s.logger)
	menuHandler := handlers.NewMenuHandler(menuService, s.logger)
	uploadHandler := handlers.NewUploadHandler(s.s3Client, s.logger)

	// Health check routes (ROOT level - industry standard)
	s.router.GET("/health", healthHandler.Health)
	s.router.GET("/ready", healthHandler.Ready)
	s.router.GET("/live", healthHandler.Live)
	s.router.GET("/status", healthHandler.Status)

	// Swagger documentation route
	if s.config.IsDevelopment() || s.config.Server.Environment == "staging" {
		s.router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
	}

	// API v1 routes
	v1 := s.router.Group("/api/v1")
	{
		// Status endpoint
		v1.GET("/status", healthHandler.Status)

		// Menu endpoints
		menu := v1.Group("/menu")
		{
			menu.GET("", menuHandler.GetCompleteMenu)
		}

		// Category endpoints
		categories := v1.Group("/categories")
		{
			categories.GET("", categoryHandler.GetAll)
			categories.POST("", categoryHandler.Create)
			categories.GET("/:id", categoryHandler.GetByID)
			categories.PUT("/:id", categoryHandler.Update)
			categories.DELETE("/:id", categoryHandler.Delete)
			categories.PATCH("/:id/toggle", categoryHandler.ToggleActive)
			categories.PATCH("/:id/order", categoryHandler.UpdateDisplayOrder)
		}

		// SubCategory endpoints
		subcategories := v1.Group("/subcategories")
		{
			subcategories.GET("", subCategoryHandler.GetAll)
			subcategories.POST("", subCategoryHandler.Create)
			subcategories.GET("/:id", subCategoryHandler.GetByID)
			subcategories.PUT("/:id", subCategoryHandler.Update)
			subcategories.DELETE("/:id", subCategoryHandler.Delete)
			subcategories.PATCH("/:id/toggle", subCategoryHandler.ToggleActive)
			subcategories.PATCH("/:id/order", subCategoryHandler.UpdateDisplayOrder)
		}

		// Item endpoints
		items := v1.Group("/items")
		{
			items.GET("", itemHandler.GetAll)
			items.POST("", itemHandler.Create)
			items.GET("/:id", itemHandler.GetByID)
			items.PUT("/:id", itemHandler.Update)
			items.DELETE("/:id", itemHandler.Delete)
			items.PATCH("/:id/toggle", itemHandler.ToggleAvailable)
			items.PATCH("/:id/order", itemHandler.UpdateDisplayOrder)
			items.PATCH("/:id/price", itemHandler.UpdatePrice)
			items.GET("/search", itemHandler.Search)
			items.GET("/featured", itemHandler.GetFeatured)
		}

		// Restaurant endpoints
		restaurants := v1.Group("/restaurants")
		{
			restaurants.GET("/info", restaurantHandler.GetInfo)
			restaurants.POST("/info", restaurantHandler.CreateInfo)
			restaurants.PUT("/info", restaurantHandler.UpdateInfo)
			restaurants.GET("/hours", restaurantHandler.GetOperatingHours)
			restaurants.DELETE("/info", restaurantHandler.Delete)
		}

		// Content endpoints
		content := v1.Group("/content")
		{
			content.GET("", contentHandler.GetAll)
			content.POST("", contentHandler.Create)
			content.GET("/:id", contentHandler.GetByID)
			content.PUT("/:id", contentHandler.Update)
			content.DELETE("/:id", contentHandler.Delete)
			content.GET("/by-key/:key", contentHandler.GetByKey)
		}

		// Upload endpoints
		upload := v1.Group("/upload")
		{
			upload.POST("/image", uploadHandler.UploadImage)
			upload.DELETE("/image/:key", uploadHandler.DeleteImage)
			upload.GET("/presigned-url", uploadHandler.GetPresignedURL)
			upload.GET("/image/:key", uploadHandler.GetImageInfo)
		}
	}

	// Serve uploaded files in development
	if s.config.IsDevelopment() {
		s.router.Static("/uploads", "./uploads")
	}
}

func (s *Server) GetRouter() *gin.Engine {
	return s.router
}

func (s *Server) Start(address string) error {
	s.logger.WithField("address", address).Info("Starting server")
	return s.router.Run(address)
}
