package web

import (
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"

	"restaurant-menu-api/internal/config"
	"restaurant-menu-api/internal/database"
	"restaurant-menu-api/internal/domain/interfaces"
	"restaurant-menu-api/internal/domain/services"
	databaseRepo "restaurant-menu-api/internal/infrastructure/database"
	"restaurant-menu-api/internal/infrastructure/redis"
	"restaurant-menu-api/internal/interfaces/handlers"
	"restaurant-menu-api/internal/interfaces/middleware"
	"restaurant-menu-api/internal/utils"
	"restaurant-menu-api/pkg/logger"

	_ "restaurant-menu-api/docs" // Import generated docs
)

type ServerConfig struct {
	Config        *config.Config
	DB            *database.Database
	StorageClient interfaces.StorageInterface
	RedisClient   *redis.Client
	Logger        *logger.Logger
}

type Server struct {
	config        *config.Config
	router        *gin.Engine
	db            *database.Database
	storageClient interfaces.StorageInterface
	redisClient   *redis.Client
	logger        *logger.Logger
}

func NewServer(cfg *ServerConfig) *Server {
	// Set Gin mode based on environment
	if cfg.Config.IsProduction() {
		gin.SetMode(gin.ReleaseMode)
	} else {
		gin.SetMode(gin.DebugMode)
	}

	server := &Server{
		config:        cfg.Config,
		db:            cfg.DB,
		storageClient: cfg.StorageClient,
		redisClient:   cfg.RedisClient,
		logger:        cfg.Logger,
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
	// CORS configuration - handle wildcard properly
	corsConfig := cors.Config{
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization", "X-Requested-With"},
		ExposeHeaders:    []string{"Content-Length", "X-Request-ID"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}
	
	// Check if wildcard is used
	if len(s.config.CORS.AllowedOrigins) == 1 && s.config.CORS.AllowedOrigins[0] == "*" {
		corsConfig.AllowAllOrigins = true
		corsConfig.AllowCredentials = false // Cannot use credentials with wildcard
	} else {
		corsConfig.AllowOrigins = s.config.CORS.AllowedOrigins
	}
	
	s.router.Use(cors.New(corsConfig))

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
	dashboardRepo := databaseRepo.NewDashboardRepository(s.db.DB, s.logger)
	userRepo := databaseRepo.NewUserRepository(s.db.DB)

	// Initialize JWT service
	jwtService := utils.NewJWTService(
		s.config.JWT.AccessSecret,
		s.config.JWT.RefreshSecret,
		s.config.JWT.AccessExpiration,
		s.config.JWT.RefreshExpiration,
	)

	// Initialize services
	categoryService := services.NewCategoryService(categoryRepo, s.logger)
	subCategoryService := services.NewSubCategoryService(subCategoryRepo, s.logger)
	itemService := services.NewItemService(itemRepo, s.logger)
	restaurantService := services.NewRestaurantService(restaurantRepo, s.logger)
	contentService := services.NewContentService(contentRepo, s.logger)
	menuService := services.NewMenuService(categoryRepo, subCategoryRepo, itemRepo, s.logger)
	dashboardService := services.NewDashboardService(dashboardRepo, s.logger)
	userService := services.NewUserService(userRepo, s.logger)
	authService := services.NewAuthService(userRepo, jwtService, s.logger)

	// Initialize handlers
	healthHandler := handlers.NewHealthHandler(s.db, s.logger)
	categoryHandler := handlers.NewCategoryHandler(categoryService, s.logger)
	subCategoryHandler := handlers.NewSubCategoryHandler(subCategoryService, categoryService, s.logger)
	itemHandler := handlers.NewItemHandler(itemService, subCategoryService, s.logger)
	restaurantHandler := handlers.NewRestaurantHandler(restaurantService, s.logger)
	contentHandler := handlers.NewContentHandler(contentService, s.logger)
	menuHandler := handlers.NewMenuHandler(menuService, s.logger)
	uploadHandler := handlers.NewUploadHandler(s.storageClient, s.logger)
	dashboardHandler := handlers.NewDashboardHandler(dashboardService, s.logger)
	userHandler := handlers.NewUserHandler(userService, s.logger)
	authHandler := handlers.NewAuthHandler(authService, jwtService, s.logger)

	// Health check routes (ROOT level - industry standard)
	s.router.GET("/health", healthHandler.Health)
	s.router.GET("/ready", healthHandler.Ready)
	s.router.GET("/live", healthHandler.Live)
	s.router.GET("/status", healthHandler.Status)

	// Swagger documentation route
	if s.config.IsDevelopment() || s.config.Server.Environment == "staging" {
		// Configure Swagger with default settings
		s.router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
	}

	// Create JWT middleware
	jwtMiddleware := middleware.JWTAuth(jwtService, s.logger)

	// API v1 routes
	v1 := s.router.Group("/api/v1")
	{
		// Status endpoint
		v1.GET("/status", healthHandler.Status)

		// Authentication routes (public)
		auth := v1.Group("/auth")
		{
			auth.POST("/login", authHandler.Login)
			auth.POST("/refresh", authHandler.RefreshToken)
			
			// Protected auth routes
			authProtected := auth.Group("", jwtMiddleware)
			{
				authProtected.GET("/me", authHandler.GetCurrentUser)
				authProtected.POST("/logout", authHandler.Logout)
			}
		}

		// User management routes (admin only)
		users := v1.Group("/users", jwtMiddleware, middleware.RequireAdmin())
		{
			users.GET("", userHandler.GetAllUsers)
			users.POST("", userHandler.CreateUser)
			users.GET("/:id", userHandler.GetUserByID)
			users.PUT("/:id", userHandler.UpdateUser)
			users.DELETE("/:id", userHandler.DeleteUser)
			users.PATCH("/:id/status", userHandler.ToggleUserActive)
		}

		// Change password route (authenticated users can change their own password)
		v1.POST("/users/change-password", jwtMiddleware, userHandler.ChangePassword)

		// Menu endpoints (public - for customer website)
		menu := v1.Group("/menu")
		{
			menu.GET("", menuHandler.GetCompleteMenu)
		}

		// Category endpoints
		categories := v1.Group("/categories")
		{
			// Public endpoints (for customer website)
			categories.GET("", categoryHandler.GetAll)
			categories.GET("/:id", categoryHandler.GetByID)
			
			// Admin endpoints (require authentication and admin/moderator role)
			categoriesAdmin := categories.Group("", jwtMiddleware, middleware.RequireAdminOrModerator())
			{
				categoriesAdmin.POST("", categoryHandler.Create)
				categoriesAdmin.PUT("/:id", categoryHandler.Update)
				categoriesAdmin.DELETE("/:id", categoryHandler.Delete)
				categoriesAdmin.PATCH("/:id/toggle", categoryHandler.ToggleActive)
				categoriesAdmin.PATCH("/:id/order", categoryHandler.UpdateDisplayOrder)
			}
		}

		// SubCategory endpoints
		subcategories := v1.Group("/subcategories")
		{
			// Public endpoints (for customer website)
			subcategories.GET("", subCategoryHandler.GetAll)
			subcategories.GET("/:id", subCategoryHandler.GetByID)
			
			// Admin endpoints (require authentication and admin/moderator role)
			subcategoriesAdmin := subcategories.Group("", jwtMiddleware, middleware.RequireAdminOrModerator())
			{
				subcategoriesAdmin.POST("", subCategoryHandler.Create)
				subcategoriesAdmin.PUT("/:id", subCategoryHandler.Update)
				subcategoriesAdmin.DELETE("/:id", subCategoryHandler.Delete)
				subcategoriesAdmin.PATCH("/:id/toggle", subCategoryHandler.ToggleActive)
				subcategoriesAdmin.PATCH("/:id/order", subCategoryHandler.UpdateDisplayOrder)
			}
		}

		// Item endpoints
		items := v1.Group("/items")
		{
			// Public endpoints (for customer website)
			items.GET("", itemHandler.GetAll)
			items.GET("/:id", itemHandler.GetByID)
			items.GET("/search", itemHandler.Search)
			items.GET("/featured", itemHandler.GetFeatured)
			
			// Admin endpoints (require authentication and admin/moderator role)
			itemsAdmin := items.Group("", jwtMiddleware, middleware.RequireAdminOrModerator())
			{
				itemsAdmin.POST("", itemHandler.Create)
				itemsAdmin.PUT("/:id", itemHandler.Update)
				itemsAdmin.DELETE("/:id", itemHandler.Delete)
				itemsAdmin.PATCH("/:id/toggle", itemHandler.ToggleAvailable)
				itemsAdmin.PATCH("/:id/order", itemHandler.UpdateDisplayOrder)
				itemsAdmin.PATCH("/:id/price", itemHandler.UpdatePrice)
			}
		}

		// Restaurant endpoints
		restaurants := v1.Group("/restaurants")
		{
			// Public endpoints (for customer website)
			restaurants.GET("/info", restaurantHandler.GetInfo)
			restaurants.GET("/hours", restaurantHandler.GetOperatingHours)
			
			// Admin endpoints (require authentication and admin/moderator role)
			restaurantsAdmin := restaurants.Group("", jwtMiddleware, middleware.RequireAdminOrModerator())
			{
				restaurantsAdmin.POST("/info", restaurantHandler.CreateInfo)
				restaurantsAdmin.PUT("/info", restaurantHandler.UpdateInfo)
				restaurantsAdmin.DELETE("/info", restaurantHandler.Delete)
			}
		}

		// Content endpoints
		content := v1.Group("/content")
		{
			// Public endpoints (for customer website)
			content.GET("", contentHandler.GetAll)
			content.GET("/:id", contentHandler.GetByID)
			content.GET("/by-key/:key", contentHandler.GetByKey)
			
			// Admin endpoints (require authentication and admin/moderator role)
			contentAdmin := content.Group("", jwtMiddleware, middleware.RequireAdminOrModerator())
			{
				contentAdmin.POST("", contentHandler.Create)
				contentAdmin.PUT("/:id", contentHandler.Update)
				contentAdmin.DELETE("/:id", contentHandler.Delete)
			}
		}

		// Upload endpoints (admin only)
		upload := v1.Group("/upload", jwtMiddleware, middleware.RequireAdminOrModerator())
		{
			upload.POST("/image", uploadHandler.UploadImage)
			upload.DELETE("/image/:key", uploadHandler.DeleteImage)
			upload.POST("/presigned-url", uploadHandler.GetPresignedURL)
			upload.GET("/image/:key/info", uploadHandler.GetImageInfo)
		}

		// Dashboard endpoints (require authentication, all roles can view)
		dashboard := v1.Group("/dashboard", jwtMiddleware)
		{
			dashboard.GET("", dashboardHandler.GetCompleteDashboardData)
			dashboard.GET("/stats", dashboardHandler.GetDashboardStats)
			dashboard.GET("/activity", dashboardHandler.GetRecentActivity)
			dashboard.GET("/categories", dashboardHandler.GetCategoryStats)
			dashboard.GET("/price-distribution", dashboardHandler.GetPriceDistribution)
			dashboard.GET("/weekly-items", dashboardHandler.GetWeeklyItemsData)
			dashboard.GET("/health", dashboardHandler.GetMenuHealthMetrics)
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
