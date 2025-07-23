package services

import (
	"context"
	"strings"

	"restaurant-menu-api/internal/domain/entities"
	"restaurant-menu-api/internal/domain/repositories"
	"restaurant-menu-api/internal/utils"
	"restaurant-menu-api/pkg/logger"
	appErrors "restaurant-menu-api/pkg/errors"
)

type UserService interface {
	Create(ctx context.Context, req *entities.CreateUserRequest) (*entities.User, error)
	GetByID(ctx context.Context, id uint) (*entities.User, error)
	GetByEmail(ctx context.Context, email string) (*entities.User, error)
	GetAll(ctx context.Context, filter entities.UserFilter) ([]*entities.User, *entities.Pagination, error)
	Update(ctx context.Context, id uint, req *entities.UpdateUserRequest) (*entities.User, error)
	Delete(ctx context.Context, id uint) error
	ToggleActive(ctx context.Context, id uint) (*entities.User, error)
	ChangePassword(ctx context.Context, userID uint, currentPassword, newPassword string) error
}

type userService struct {
	userRepo repositories.UserRepository
	logger   *logger.Logger
}

func NewUserService(userRepo repositories.UserRepository, logger *logger.Logger) UserService {
	return &userService{
		userRepo: userRepo,
		logger:   logger,
	}
}

func (s *userService) Create(ctx context.Context, req *entities.CreateUserRequest) (*entities.User, error) {
	// Validate password length
	if !utils.IsValidPasswordLength(req.Password) {
		return nil, appErrors.NewValidationError("Password must be between 8 and 72 characters", "")
	}

	// Check if user with same email already exists
	exists, err := s.userRepo.ExistsByEmail(ctx, strings.ToLower(req.Email))
	if err != nil {
		s.logger.LogError(ctx, err, "Failed to check existing user", map[string]interface{}{
			"email": req.Email,
		})
		return nil, appErrors.WrapInternalError(err, "Failed to validate user")
	}

	if exists {
		return nil, appErrors.NewConflictError("User with this email already exists")
	}

	// Hash password
	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		s.logger.LogError(ctx, err, "Failed to hash password", map[string]interface{}{
			"email": req.Email,
		})
		return nil, appErrors.WrapInternalError(err, "Failed to create user")
	}

	// Create user entity
	user := &entities.User{
		Email:        strings.ToLower(req.Email),
		PasswordHash: hashedPassword,
		Name:         req.Name,
		Role:         req.Role,
		IsActive:     true,
	}

	if err := s.userRepo.Create(ctx, user); err != nil {
		s.logger.LogError(ctx, err, "Failed to create user", map[string]interface{}{
			"email": req.Email,
			"name":  req.Name,
			"role":  req.Role,
		})
		return nil, appErrors.WrapInternalError(err, "Failed to create user")
	}

	s.logger.LogInfo(ctx, "User created successfully", map[string]interface{}{
		"user_id": user.ID,
		"email":   user.Email,
		"name":    user.Name,
		"role":    user.Role,
	})

	return user, nil
}

func (s *userService) GetByID(ctx context.Context, id uint) (*entities.User, error) {
	user, err := s.userRepo.GetByID(ctx, id)
	if err != nil {
		s.logger.LogError(ctx, err, "Failed to get user", map[string]interface{}{
			"user_id": id,
		})
		return nil, appErrors.WrapInternalError(err, "Failed to get user")
	}

	if user == nil {
		return nil, appErrors.NewNotFoundError("User")
	}

	return user, nil
}

func (s *userService) GetByEmail(ctx context.Context, email string) (*entities.User, error) {
	user, err := s.userRepo.GetByEmail(ctx, strings.ToLower(email))
	if err != nil {
		s.logger.LogError(ctx, err, "Failed to get user by email", map[string]interface{}{
			"email": email,
		})
		return nil, appErrors.WrapInternalError(err, "Failed to get user")
	}

	if user == nil {
		return nil, appErrors.NewNotFoundError("User")
	}

	return user, nil
}

func (s *userService) GetAll(ctx context.Context, filter entities.UserFilter) ([]*entities.User, *entities.Pagination, error) {
	users, pagination, err := s.userRepo.GetAll(ctx, filter)
	if err != nil {
		s.logger.LogError(ctx, err, "Failed to get users", nil)
		return nil, nil, appErrors.WrapInternalError(err, "Failed to get users")
	}

	return users, pagination, nil
}

func (s *userService) Update(ctx context.Context, id uint, req *entities.UpdateUserRequest) (*entities.User, error) {
	// Get existing user
	user, err := s.userRepo.GetByID(ctx, id)
	if err != nil {
		s.logger.LogError(ctx, err, "Failed to get user for update", map[string]interface{}{
			"user_id": id,
		})
		return nil, appErrors.WrapInternalError(err, "Failed to get user")
	}

	if user == nil {
		return nil, appErrors.NewNotFoundError("User")
	}

	// Check if another user with same email exists (excluding current user)
	if req.Email != nil && strings.ToLower(*req.Email) != user.Email {
		exists, err := s.userRepo.ExistsByEmail(ctx, strings.ToLower(*req.Email))
		if err != nil {
			s.logger.LogError(ctx, err, "Failed to check existing user", map[string]interface{}{
				"email": *req.Email,
			})
			return nil, appErrors.WrapInternalError(err, "Failed to validate user")
		}

		if exists {
			return nil, appErrors.NewConflictError("User with this email already exists")
		}
	}

	// Update fields
	if req.Email != nil {
		user.Email = strings.ToLower(*req.Email)
	}
	if req.Name != nil {
		user.Name = *req.Name
	}
	if req.Role != nil {
		user.Role = *req.Role
	}
	if req.IsActive != nil {
		user.IsActive = *req.IsActive
	}

	// Handle password update
	if req.Password != nil {
		if !utils.IsValidPasswordLength(*req.Password) {
			return nil, appErrors.NewValidationError("Password must be between 8 and 72 characters", "")
		}

		hashedPassword, err := utils.HashPassword(*req.Password)
		if err != nil {
			s.logger.LogError(ctx, err, "Failed to hash password", map[string]interface{}{
				"user_id": id,
			})
			return nil, appErrors.WrapInternalError(err, "Failed to update user")
		}
		user.PasswordHash = hashedPassword
	}

	if err := s.userRepo.Update(ctx, user); err != nil {
		s.logger.LogError(ctx, err, "Failed to update user", map[string]interface{}{
			"user_id": id,
		})
		return nil, appErrors.WrapInternalError(err, "Failed to update user")
	}

	s.logger.LogInfo(ctx, "User updated successfully", map[string]interface{}{
		"user_id": user.ID,
		"email":   user.Email,
		"name":    user.Name,
		"role":    user.Role,
	})

	return user, nil
}

func (s *userService) Delete(ctx context.Context, id uint) error {
	// Check if user exists
	user, err := s.userRepo.GetByID(ctx, id)
	if err != nil {
		s.logger.LogError(ctx, err, "Failed to get user for deletion", map[string]interface{}{
			"user_id": id,
		})
		return appErrors.WrapInternalError(err, "Failed to get user")
	}

	if user == nil {
		return appErrors.NewNotFoundError("User")
	}

	// Check if this is the last admin user
	if user.Role == entities.UserRoleAdmin {
		adminRole := entities.UserRoleAdmin
		adminFilter := entities.UserFilter{
			Role:     &adminRole,
			IsActive: boolPtr(true),
		}
		admins, _, err := s.userRepo.GetAll(ctx, adminFilter)
		if err != nil {
			s.logger.LogError(ctx, err, "Failed to check admin users", map[string]interface{}{
				"user_id": id,
			})
			return appErrors.WrapInternalError(err, "Failed to validate user deletion")
		}

		if len(admins) <= 1 {
			return appErrors.NewConflictError("Cannot delete the last admin user")
		}
	}

	if err := s.userRepo.Delete(ctx, id); err != nil {
		s.logger.LogError(ctx, err, "Failed to delete user", map[string]interface{}{
			"user_id": id,
		})
		return appErrors.WrapInternalError(err, "Failed to delete user")
	}

	s.logger.LogInfo(ctx, "User deleted successfully", map[string]interface{}{
		"user_id": id,
		"email":   user.Email,
		"name":    user.Name,
	})

	return nil
}

func (s *userService) ToggleActive(ctx context.Context, id uint) (*entities.User, error) {
	// Check if user exists
	user, err := s.userRepo.GetByID(ctx, id)
	if err != nil {
		s.logger.LogError(ctx, err, "Failed to get user", map[string]interface{}{
			"user_id": id,
		})
		return nil, appErrors.WrapInternalError(err, "Failed to get user")
	}

	if user == nil {
		return nil, appErrors.NewNotFoundError("User")
	}

	// If deactivating an admin, check if there are other active admins
	if user.IsActive && user.Role == entities.UserRoleAdmin {
		adminRole := entities.UserRoleAdmin
		adminFilter := entities.UserFilter{
			Role:     &adminRole,
			IsActive: boolPtr(true),
		}
		admins, _, err := s.userRepo.GetAll(ctx, adminFilter)
		if err != nil {
			s.logger.LogError(ctx, err, "Failed to check admin users", map[string]interface{}{
				"user_id": id,
			})
			return nil, appErrors.WrapInternalError(err, "Failed to validate user status change")
		}

		if len(admins) <= 1 {
			return nil, appErrors.NewConflictError("Cannot deactivate the last admin user")
		}
	}

	if err := s.userRepo.ToggleActive(ctx, id); err != nil {
		s.logger.LogError(ctx, err, "Failed to toggle user active status", map[string]interface{}{
			"user_id": id,
		})
		return nil, appErrors.WrapInternalError(err, "Failed to toggle user active status")
	}

	// Get updated user
	updatedUser, err := s.userRepo.GetByID(ctx, id)
	if err != nil {
		s.logger.LogError(ctx, err, "Failed to get updated user", map[string]interface{}{
			"user_id": id,
		})
		return nil, appErrors.WrapInternalError(err, "Failed to get updated user")
	}

	s.logger.LogInfo(ctx, "User active status toggled successfully", map[string]interface{}{
		"user_id":    id,
		"new_status": updatedUser.IsActive,
	})

	return updatedUser, nil
}

func (s *userService) ChangePassword(ctx context.Context, userID uint, currentPassword, newPassword string) error {
	// Get user
	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		s.logger.LogError(ctx, err, "Failed to get user for password change", map[string]interface{}{
			"user_id": userID,
		})
		return appErrors.WrapInternalError(err, "Failed to get user")
	}

	if user == nil {
		return appErrors.NewNotFoundError("User")
	}

	// Verify current password
	if !utils.VerifyPassword(currentPassword, user.PasswordHash) {
		return appErrors.NewUnauthorizedError("Current password is incorrect")
	}

	// Validate new password
	if !utils.IsValidPasswordLength(newPassword) {
		return appErrors.NewValidationError("New password must be between 8 and 72 characters", "")
	}

	// Hash new password
	hashedPassword, err := utils.HashPassword(newPassword)
	if err != nil {
		s.logger.LogError(ctx, err, "Failed to hash new password", map[string]interface{}{
			"user_id": userID,
		})
		return appErrors.WrapInternalError(err, "Failed to change password")
	}

	// Update password
	user.PasswordHash = hashedPassword
	if err := s.userRepo.Update(ctx, user); err != nil {
		s.logger.LogError(ctx, err, "Failed to update user password", map[string]interface{}{
			"user_id": userID,
		})
		return appErrors.WrapInternalError(err, "Failed to change password")
	}

	s.logger.LogInfo(ctx, "User password changed successfully", map[string]interface{}{
		"user_id": userID,
	})

	return nil
}