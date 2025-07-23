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

type AuthService interface {
	Login(ctx context.Context, req *entities.LoginRequest) (*entities.LoginResponse, error)
	RefreshToken(ctx context.Context, req *entities.RefreshTokenRequest, jwtService *utils.JWTService) (*entities.RefreshTokenResponse, error)
	GetCurrentUser(ctx context.Context, userID uint) (*entities.UserResponse, error)
	Logout(ctx context.Context, userID uint) error
}

type authService struct {
	userRepo   repositories.UserRepository
	jwtService *utils.JWTService
	logger     *logger.Logger
}

func NewAuthService(userRepo repositories.UserRepository, jwtService *utils.JWTService, logger *logger.Logger) AuthService {
	return &authService{
		userRepo:   userRepo,
		jwtService: jwtService,
		logger:     logger,
	}
}

func (s *authService) Login(ctx context.Context, req *entities.LoginRequest) (*entities.LoginResponse, error) {
	// Get user by email
	user, err := s.userRepo.GetByEmail(ctx, strings.ToLower(req.Email))
	if err != nil {
		s.logger.LogError(ctx, err, "Failed to get user by email", map[string]interface{}{
			"email": req.Email,
		})
		return nil, appErrors.WrapInternalError(err, "Authentication failed")
	}

	if user == nil {
		s.logger.LogWarning(ctx, "Login attempt with non-existent email", map[string]interface{}{
			"email": req.Email,
		})
		return nil, appErrors.NewUnauthorizedError("Invalid email or password")
	}

	// Check if user is active
	if !user.IsActive {
		s.logger.LogWarning(ctx, "Login attempt with inactive user", map[string]interface{}{
			"user_id": user.ID,
			"email":   user.Email,
		})
		return nil, appErrors.NewUnauthorizedError("Account is inactive")
	}

	// Verify password
	if !utils.VerifyPassword(req.Password, user.PasswordHash) {
		s.logger.LogWarning(ctx, "Login attempt with wrong password", map[string]interface{}{
			"user_id": user.ID,
			"email":   user.Email,
		})
		return nil, appErrors.NewUnauthorizedError("Invalid email or password")
	}

	// Generate token pair
	tokenPair, err := s.jwtService.GenerateTokenPair(user)
	if err != nil {
		s.logger.LogError(ctx, err, "Failed to generate tokens", map[string]interface{}{
			"user_id": user.ID,
			"email":   user.Email,
		})
		return nil, appErrors.WrapInternalError(err, "Authentication failed")
	}

	// Update last login time
	if err := s.userRepo.UpdateLastLogin(ctx, user.ID); err != nil {
		s.logger.LogError(ctx, err, "Failed to update last login", map[string]interface{}{
			"user_id": user.ID,
		})
		// Don't fail the login for this error, just log it
	}

	s.logger.LogInfo(ctx, "User logged in successfully", map[string]interface{}{
		"user_id": user.ID,
		"email":   user.Email,
		"role":    user.Role,
	})

	return &entities.LoginResponse{
		AccessToken:  tokenPair.AccessToken,
		RefreshToken: tokenPair.RefreshToken,
		ExpiresAt:    tokenPair.ExpiresAt,
		User:         *user.ToResponse(),
	}, nil
}

func (s *authService) RefreshToken(ctx context.Context, req *entities.RefreshTokenRequest, jwtService *utils.JWTService) (*entities.RefreshTokenResponse, error) {
	// Validate refresh token
	authContext, err := jwtService.ValidateRefreshToken(req.RefreshToken)
	if err != nil {
		s.logger.LogWarning(ctx, "Invalid refresh token", map[string]interface{}{
			"error": err.Error(),
		})
		return nil, appErrors.NewUnauthorizedError("Invalid refresh token")
	}

	// Get current user to ensure they still exist and are active
	user, err := s.userRepo.GetByID(ctx, authContext.UserID)
	if err != nil {
		s.logger.LogError(ctx, err, "Failed to get user for token refresh", map[string]interface{}{
			"user_id": authContext.UserID,
		})
		return nil, appErrors.WrapInternalError(err, "Token refresh failed")
	}

	if user == nil {
		s.logger.LogWarning(ctx, "Token refresh attempt for non-existent user", map[string]interface{}{
			"user_id": authContext.UserID,
		})
		return nil, appErrors.NewUnauthorizedError("User not found")
	}

	if !user.IsActive {
		s.logger.LogWarning(ctx, "Token refresh attempt for inactive user", map[string]interface{}{
			"user_id": user.ID,
		})
		return nil, appErrors.NewUnauthorizedError("Account is inactive")
	}

	// Generate new token pair
	tokenPair, err := jwtService.GenerateTokenPair(user)
	if err != nil {
		s.logger.LogError(ctx, err, "Failed to generate new tokens", map[string]interface{}{
			"user_id": user.ID,
		})
		return nil, appErrors.WrapInternalError(err, "Token refresh failed")
	}

	s.logger.LogInfo(ctx, "Token refreshed successfully", map[string]interface{}{
		"user_id": user.ID,
		"email":   user.Email,
	})

	return &entities.RefreshTokenResponse{
		AccessToken:  tokenPair.AccessToken,
		RefreshToken: tokenPair.RefreshToken,
		ExpiresAt:    tokenPair.ExpiresAt,
	}, nil
}

func (s *authService) GetCurrentUser(ctx context.Context, userID uint) (*entities.UserResponse, error) {
	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		s.logger.LogError(ctx, err, "Failed to get current user", map[string]interface{}{
			"user_id": userID,
		})
		return nil, appErrors.WrapInternalError(err, "Failed to get user")
	}

	if user == nil {
		return nil, appErrors.NewNotFoundError("User")
	}

	if !user.IsActive {
		return nil, appErrors.NewUnauthorizedError("Account is inactive")
	}

	return user.ToResponse(), nil
}

func (s *authService) Logout(ctx context.Context, userID uint) error {
	// For now, we'll just log the logout event
	// In a more sophisticated implementation, you might want to:
	// - Add tokens to a blacklist/blocklist
	// - Store revoked tokens in Redis with their expiration times
	// - Or use a different token revocation strategy

	s.logger.LogInfo(ctx, "User logged out", map[string]interface{}{
		"user_id": userID,
	})

	return nil
}