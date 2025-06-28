package main

import (
	"flag"
	"fmt"
	"log"
	"os"

	"restaurant-menu-api/internal/config"
	"restaurant-menu-api/internal/database"
)

func main() {
	var (
		command = flag.String("command", "up", "Migration command: up, down, goto, force, drop, version, steps")
		version = flag.Int("version", 0, "Target version for goto command")
		steps   = flag.Int("steps", 0, "Number of steps for steps command")
	)
	flag.Parse()

	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	// Create migration runner
	runner, err := database.NewMigrationRunner(cfg)
	if err != nil {
		log.Fatalf("Failed to create migration runner: %v", err)
	}
	defer runner.Close()

	switch *command {
	case "up":
		if err := runner.Up(); err != nil {
			log.Fatalf("Failed to run migrations: %v", err)
		}
		fmt.Println("Migrations completed successfully")

	case "down":
		if err := runner.Down(); err != nil {
			log.Fatalf("Failed to rollback migrations: %v", err)
		}
		fmt.Println("Rollback completed successfully")

	case "goto":
		if *version == 0 {
			log.Fatal("Version must be specified for goto command")
		}
		if err := runner.Goto(uint(*version)); err != nil {
			log.Fatalf("Failed to migrate to version %d: %v", *version, err)
		}
		fmt.Printf("Migrated to version %d successfully\n", *version)

	case "force":
		if *version == 0 {
			log.Fatal("Version must be specified for force command")
		}
		if err := runner.Force(*version); err != nil {
			log.Fatalf("Failed to force migration to version %d: %v", *version, err)
		}
		fmt.Printf("Forced migration to version %d successfully\n", *version)

	case "drop":
		fmt.Print("Are you sure you want to drop all tables? This action cannot be undone. (y/N): ")
		var response string
		fmt.Scanln(&response)
		if response != "y" && response != "Y" {
			fmt.Println("Operation cancelled")
			os.Exit(0)
		}
		if err := runner.Drop(); err != nil {
			log.Fatalf("Failed to drop database: %v", err)
		}
		fmt.Println("Database dropped successfully")

	case "version":
		version, dirty, err := runner.Version()
		if err != nil {
			log.Fatalf("Failed to get migration version: %v", err)
		}
		if dirty {
			fmt.Printf("Current version: %d (dirty)\n", version)
		} else {
			fmt.Printf("Current version: %d\n", version)
		}

	case "steps":
		if *steps == 0 {
			log.Fatal("Steps must be specified for steps command")
		}
		if err := runner.Steps(*steps); err != nil {
			log.Fatalf("Failed to run %d migration steps: %v", *steps, err)
		}
		fmt.Printf("Ran %d migration steps successfully\n", *steps)

	default:
		fmt.Printf("Unknown command: %s\n", *command)
		fmt.Println("Available commands: up, down, goto, force, drop, version, steps")
		os.Exit(1)
	}
}

func init() {
	flag.Usage = func() {
		fmt.Fprintf(os.Stderr, "Usage: %s [options]\n\n", os.Args[0])
		fmt.Fprintf(os.Stderr, "Migration utility for restaurant-menu-api\n\n")
		fmt.Fprintf(os.Stderr, "Commands:\n")
		fmt.Fprintf(os.Stderr, "  up      - Run all available migrations\n")
		fmt.Fprintf(os.Stderr, "  down    - Rollback all migrations\n")
		fmt.Fprintf(os.Stderr, "  goto    - Migrate to a specific version\n")
		fmt.Fprintf(os.Stderr, "  force   - Force set version without running migration\n")
		fmt.Fprintf(os.Stderr, "  drop    - Drop all tables (DANGEROUS)\n")
		fmt.Fprintf(os.Stderr, "  version - Show current migration version\n")
		fmt.Fprintf(os.Stderr, "  steps   - Run n migration steps (use negative for rollback)\n\n")
		fmt.Fprintf(os.Stderr, "Examples:\n")
		fmt.Fprintf(os.Stderr, "  %s -command=up\n", os.Args[0])
		fmt.Fprintf(os.Stderr, "  %s -command=goto -version=1\n", os.Args[0])
		fmt.Fprintf(os.Stderr, "  %s -command=steps -steps=2\n", os.Args[0])
		fmt.Fprintf(os.Stderr, "  %s -command=steps -steps=-1\n\n", os.Args[0])
		fmt.Fprintf(os.Stderr, "Options:\n")
		flag.PrintDefaults()
	}
}