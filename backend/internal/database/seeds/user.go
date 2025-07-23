package seeds

import (
	"context"
	"fmt"

	"gorm.io/gorm"

	"restaurant-menu-api/internal/domain/entities"
	"restaurant-menu-api/internal/utils"
)

func (s *Seeder) seedUsers(ctx context.Context, tx *gorm.DB) error {
	// Check if any users already exist
	var count int64
	if err := tx.Model(&entities.User{}).Count(&count).Error; err != nil {
		return fmt.Errorf("failed to check existing users: %w", err)
	}

	if count > 0 {
		s.logger.Info("Users already exist, skipping user seeding")
		return nil
	}

	// Create default admin user
	adminPassword := "admin123!" // In production, this should be randomly generated
	hashedPassword, err := utils.HashPassword(adminPassword)
	if err != nil {
		return fmt.Errorf("failed to hash admin password: %w", err)
	}

	users := []entities.User{
		{
			Email:        "admin@restaurant.com",
			PasswordHash: hashedPassword,
			Name:         "Admin User",
			Role:         entities.UserRoleAdmin,
			IsActive:     true,
		},
		{
			Email:        "manager@restaurant.com",
			PasswordHash: hashedPassword, // Same password for demo
			Name:         "Manager User",
			Role:         entities.UserRoleModerator,
			IsActive:     true,
		},
		{
			Email:        "viewer@restaurant.com",
			PasswordHash: hashedPassword, // Same password for demo
			Name:         "Viewer User",
			Role:         entities.UserRoleViewer,
			IsActive:     true,
		},
	}

	for _, user := range users {
		if err := tx.Create(&user).Error; err != nil {
			return fmt.Errorf("failed to create user %s: %w", user.Email, err)
		}
		s.logger.WithField("email", user.Email).WithField("role", user.Role).Info("Created user")
	}

	s.logger.Info("User seeding completed successfully")
	s.logger.Warn("IMPORTANT: Default users created with password 'admin123!' - Change these passwords in production!")

	return nil
}