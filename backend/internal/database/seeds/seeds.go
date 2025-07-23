package seeds

import (
	"context"
	"fmt"

	"restaurant-menu-api/pkg/logger"
	"gorm.io/gorm"
)

type Seeder struct {
	db     *gorm.DB
	logger logger.Logger
}

func NewSeeder(db *gorm.DB, logger logger.Logger) *Seeder {
	return &Seeder{
		db:     db,
		logger: logger,
	}
}

// SeedAll runs all seeding operations in the correct order
func (s *Seeder) SeedAll(ctx context.Context) error {
	s.logger.Info("Starting complete database seeding process")

	// Start transaction for data integrity
	tx := s.db.Begin()
	if tx.Error != nil {
		return fmt.Errorf("failed to start transaction: %w", tx.Error)
	}

	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
			s.logger.WithField("error", r).Error("Transaction rolled back due to panic")
		}
	}()

	// Seed in order of dependencies
	seeders := []struct {
		name string
		fn   func(context.Context, *gorm.DB) error
	}{
		{"Users", s.seedUsers},
		{"Restaurant Info", s.seedRestaurantInfo},
		{"Operating Hours", s.seedOperatingHours},
		{"Content Sections", s.seedContentSections},
		{"Categories", s.seedCategories},
		{"SubCategories", s.seedSubCategories},
		{"Items", s.seedItems},
	}

	for _, seeder := range seeders {
		s.logger.WithField("seeder", seeder.name).Info("Running seeder")
		
		if err := seeder.fn(ctx, tx); err != nil {
			tx.Rollback()
			return fmt.Errorf("failed to seed %s: %w", seeder.name, err)
		}
		
		s.logger.WithField("seeder", seeder.name).Info("Seeder completed successfully")
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	s.logger.Info("All seeding operations completed successfully")
	return nil
}

// ClearAll removes all seeded data in reverse order
func (s *Seeder) ClearAll(ctx context.Context) error {
	s.logger.Info("Starting to clear all seeded data")

	// Start transaction
	tx := s.db.Begin()
	if tx.Error != nil {
		return fmt.Errorf("failed to start transaction: %w", tx.Error)
	}

	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
			s.logger.WithField("error", r).Error("Transaction rolled back due to panic")
		}
	}()

	// Clear in reverse order to maintain referential integrity
	tables := []string{
		"items",
		"sub_categories", 
		"categories",
		"content_sections",
		"operating_hours",
		"restaurant_infos",
		"users",
	}

	for _, table := range tables {
		s.logger.WithField("table", table).Info("Clearing table")
		
		if err := tx.Exec(fmt.Sprintf("DELETE FROM %s", table)).Error; err != nil {
			tx.Rollback()
			return fmt.Errorf("failed to clear table %s: %w", table, err)
		}
		
		// Reset auto-increment counters
		if err := tx.Exec(fmt.Sprintf("ALTER SEQUENCE %s_id_seq RESTART WITH 1", table)).Error; err != nil {
			s.logger.WithField("table", table).Warn("Failed to reset sequence, continuing...")
		}
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	s.logger.Info("All seeded data cleared successfully")
	return nil
}