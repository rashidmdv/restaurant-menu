// Restaurant Menu API
//
// This is a production-ready REST API for restaurant menu management system
// built with clean architecture principles.
//
// @title Restaurant Menu API
// @version 1.0
// @description A production-ready REST API for restaurant menu management
// @termsOfService http://swagger.io/terms/
// @contact.name API Support
// @contact.url http://www.restaurant-menu-api.com/support
// @contact.email support@restaurant-menu-api.com
// @license.name MIT
// @license.url https://opensource.org/licenses/MIT
// @host localhost:8000
// @BasePath /
// @schemes http https
package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"restaurant-menu-api/internal/config"
	"restaurant-menu-api/internal/database"
	"restaurant-menu-api/internal/infrastructure/redis"
	"restaurant-menu-api/internal/infrastructure/storage"
	"restaurant-menu-api/internal/infrastructure/web"
	"restaurant-menu-api/pkg/logger"
)

func main() {
	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	// Initialize logger
	appLogger := logger.New(cfg.Logger.Level, cfg.Logger.Format)
	appLogger.Info("Starting restaurant menu API server...")

	// Initialize database
	db, err := database.New(cfg)
	if err != nil {
		appLogger.WithError(err).Fatal("Failed to connect to database")
	}
	defer db.Close()

	// Initialize storage client using factory
	ctx := context.Background()
	storageFactory := storage.NewStorageFactory(cfg)
	storageClient, err := storageFactory.CreateStorageClient(ctx)
	if err != nil {
		appLogger.WithError(err).Fatal("Failed to initialize storage client")
	}
	appLogger.WithField("provider", cfg.Storage.Provider).Info("Storage client initialized successfully")

	// Initialize Redis client (optional)
	var redisClient *redis.Client
	redisClient, err = redis.NewClient(&cfg.Redis, appLogger)
	if err != nil {
		appLogger.WithError(err).Warn("Failed to initialize Redis client, continuing without caching")
		redisClient = nil
	} else {
		appLogger.Info("Redis client initialized successfully")
	}

	// Initialize web server
	server := web.NewServer(&web.ServerConfig{
		Config:        cfg,
		DB:            db,
		StorageClient: storageClient,
		RedisClient:   redisClient,
		Logger:        appLogger,
	})

	// Create HTTP server
	httpServer := &http.Server{
		Addr:         fmt.Sprintf("%s:%s", cfg.Server.Host, cfg.Server.Port),
		Handler:      server.GetRouter(),
		ReadTimeout:  cfg.Server.ReadTimeout,
		WriteTimeout: cfg.Server.WriteTimeout,
	}

	// Start server in a goroutine
	go func() {
		appLogger.WithField("port", cfg.Server.Port).Info("Starting HTTP server")
		if err := httpServer.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			appLogger.WithError(err).Fatal("Failed to start HTTP server")
		}
	}()

	// Wait for interrupt signal to gracefully shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	appLogger.Info("Shutting down server...")

	// Create a deadline for shutdown
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// Shutdown server
	if err := httpServer.Shutdown(ctx); err != nil {
		appLogger.WithError(err).Error("Server forced to shutdown")
	} else {
		appLogger.Info("Server shutdown complete")
	}
}
