package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"os"

	"restaurant-menu-api/internal/config"
	"restaurant-menu-api/internal/database"
	"restaurant-menu-api/internal/database/seeds"
	"restaurant-menu-api/pkg/logger"
)

func main() {
	var (
		action = flag.String("action", "run", "Action to perform: run, clear")
		help   = flag.Bool("help", false, "Show help message")
	)
	flag.Parse()

	if *help {
		showHelp()
		return
	}

	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	// Initialize logger
	appLogger := logger.New(cfg.Logger.Level, cfg.Logger.Format)
	appLogger.Info("Starting database seeding process...")

	// Initialize database
	db, err := database.New(cfg)
	if err != nil {
		appLogger.WithError(err).Fatal("Failed to connect to database")
	}
	defer db.Close()

	// Create seeder instance
	seeder := seeds.NewSeeder(db.DB, *appLogger)

	ctx := context.Background()

	switch *action {
	case "run":
		appLogger.Info("Running database seed...")
		if err := seeder.SeedAll(ctx); err != nil {
			appLogger.WithError(err).Fatal("Failed to seed database")
		}
		appLogger.Info("Database seeding completed successfully!")

	case "clear":
		appLogger.Info("Clearing seeded data...")
		if err := seeder.ClearAll(ctx); err != nil {
			appLogger.WithError(err).Fatal("Failed to clear seeded data")
		}
		appLogger.Info("Seeded data cleared successfully!")

	default:
		appLogger.WithField("action", *action).Error("Unknown action")
		showHelp()
		os.Exit(1)
	}
}

func showHelp() {
	fmt.Println("Database Seeding Tool")
	fmt.Println("Usage: go run ./cmd/seed [options]")
	fmt.Println("")
	fmt.Println("Options:")
	fmt.Println("  -action string")
	fmt.Println("        Action to perform: run, clear (default \"run\")")
	fmt.Println("  -help")
	fmt.Println("        Show this help message")
	fmt.Println("")
	fmt.Println("Examples:")
	fmt.Println("  go run ./cmd/seed                    # Run seeding")
	fmt.Println("  go run ./cmd/seed -action=run        # Run seeding (explicit)")
	fmt.Println("  go run ./cmd/seed -action=clear      # Clear seeded data")
	fmt.Println("  make db-seed                         # Run via Makefile")
}