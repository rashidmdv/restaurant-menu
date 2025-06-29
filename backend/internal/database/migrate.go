package database

import (
	"database/sql"
	"errors"
	"fmt"
	"os"
	"path/filepath"

	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	_ "github.com/lib/pq"

	"restaurant-menu-api/internal/config"
)

// MigrationRunner handles database migrations
type MigrationRunner struct {
	migrate *migrate.Migrate
	config  *config.Config
}

// NewMigrationRunner creates a new migration runner
func NewMigrationRunner(cfg *config.Config) (*MigrationRunner, error) {
	// Open database connection
	db, err := sql.Open("postgres", cfg.GetDSN())
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	// Create postgres driver instance
	driver, err := postgres.WithInstance(db, &postgres.Config{})
	if err != nil {
		return nil, fmt.Errorf("failed to create postgres driver: %w", err)
	}

	// Get absolute path to migrations directory
	wd, err := os.Getwd()
	if err != nil {
		return nil, fmt.Errorf("failed to get working directory: %w", err)
	}
	
	migrationsDir := filepath.Join(wd, "migrations")
	if _, err := os.Stat(migrationsDir); os.IsNotExist(err) {
		// Try parent directory (when running from cmd/migrate)
		migrationsDir = filepath.Join(filepath.Dir(wd), "migrations")
		if _, err := os.Stat(migrationsDir); os.IsNotExist(err) {
			return nil, fmt.Errorf("migrations directory not found in %s or %s", 
				filepath.Join(wd, "migrations"), migrationsDir)
		}
	}
	
	migrationsPath := "file://" + migrationsDir
	
	// Create migrate instance
	m, err := migrate.NewWithDatabaseInstance(
		migrationsPath,
		"postgres",
		driver,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create migrate instance: %w", err)
	}

	return &MigrationRunner{
		migrate: m,
		config:  cfg,
	}, nil
}

// Up runs all available migrations
func (mr *MigrationRunner) Up() error {
	err := mr.migrate.Up()
	if err != nil && !errors.Is(err, migrate.ErrNoChange) {
		return fmt.Errorf("failed to run migrations: %w", err)
	}
	return nil
}

// Down rolls back all migrations
func (mr *MigrationRunner) Down() error {
	err := mr.migrate.Down()
	if err != nil && !errors.Is(err, migrate.ErrNoChange) {
		return fmt.Errorf("failed to rollback migrations: %w", err)
	}
	return nil
}

// Steps runs n migrations. Use negative number to rollback
func (mr *MigrationRunner) Steps(n int) error {
	err := mr.migrate.Steps(n)
	if err != nil && !errors.Is(err, migrate.ErrNoChange) {
		return fmt.Errorf("failed to run %d migration steps: %w", n, err)
	}
	return nil
}

// Goto migrates to a specific version
func (mr *MigrationRunner) Goto(version uint) error {
	err := mr.migrate.Migrate(version)
	if err != nil && !errors.Is(err, migrate.ErrNoChange) {
		return fmt.Errorf("failed to migrate to version %d: %w", version, err)
	}
	return nil
}

// Version returns the current migration version
func (mr *MigrationRunner) Version() (uint, bool, error) {
	version, dirty, err := mr.migrate.Version()
	if err != nil && !errors.Is(err, migrate.ErrNilVersion) {
		return 0, false, fmt.Errorf("failed to get migration version: %w", err)
	}
	if errors.Is(err, migrate.ErrNilVersion) {
		return 0, false, nil
	}
	return version, dirty, nil
}

// Force sets the current version without running migrations
func (mr *MigrationRunner) Force(version int) error {
	err := mr.migrate.Force(version)
	if err != nil {
		return fmt.Errorf("failed to force migration to version %d: %w", version, err)
	}
	return nil
}

// Drop drops everything inside the database
func (mr *MigrationRunner) Drop() error {
	err := mr.migrate.Drop()
	if err != nil {
		return fmt.Errorf("failed to drop database: %w", err)
	}
	return nil
}

// Close closes the migration runner
func (mr *MigrationRunner) Close() (error, error) {
	return mr.migrate.Close()
}