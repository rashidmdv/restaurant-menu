package handlers

import (
	"github.com/gin-gonic/gin"

	"restaurant-menu-api/internal/domain/entities"
	"restaurant-menu-api/internal/domain/services"
	"restaurant-menu-api/internal/utils"
	appErrors "restaurant-menu-api/pkg/errors"
	"restaurant-menu-api/pkg/logger"
	"restaurant-menu-api/pkg/response"
)

type AuthHandler struct {
	authService services.AuthService
	jwtService  *utils.JWTService
	logger      *logger.Logger
}

func NewAuthHandler(authService services.AuthService, jwtService *utils.JWTService, logger *logger.Logger) *AuthHandler {
	return &AuthHandler{
		authService: authService,
		jwtService:  jwtService,
		logger:      logger,
	}
}

// Login godoc
// @Summary User login
// @Description Authenticate user with email and password
// @Tags Authentication
// @Accept json
// @Produce json
// @Param credentials body entities.LoginRequest true "Login credentials"
// @Success 200 {object} response.APIResponse{data=entities.LoginResponse}
// @Failure 400 {object} response.APIResponse{error=response.APIError}
// @Failure 401 {object} response.APIResponse{error=response.APIError}
// @Failure 500 {object} response.APIResponse{error=response.APIError}
// @Router /auth/login [post]
func (h *AuthHandler) Login(c *gin.Context) {
	var req entities.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, appErrors.WrapValidationError(err, "Invalid login data"))
		return
	}

	loginResponse, err := h.authService.Login(c.Request.Context(), &req)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Success(c, loginResponse)
}

// RefreshToken godoc
// @Summary Refresh access token
// @Description Get a new access token using a refresh token
// @Tags Authentication
// @Accept json
// @Produce json
// @Param refresh body entities.RefreshTokenRequest true "Refresh token request"
// @Success 200 {object} response.APIResponse{data=entities.RefreshTokenResponse}
// @Failure 400 {object} response.APIResponse{error=response.APIError}
// @Failure 401 {object} response.APIResponse{error=response.APIError}
// @Failure 500 {object} response.APIResponse{error=response.APIError}
// @Router /auth/refresh [post]
func (h *AuthHandler) RefreshToken(c *gin.Context) {
	var req entities.RefreshTokenRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, appErrors.WrapValidationError(err, "Invalid refresh token data"))
		return
	}

	refreshResponse, err := h.authService.RefreshToken(c.Request.Context(), &req, h.jwtService)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Success(c, refreshResponse)
}

// GetCurrentUser godoc
// @Summary Get current user
// @Description Get the current authenticated user's information
// @Tags Authentication
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.APIResponse{data=entities.UserResponse}
// @Failure 401 {object} response.APIResponse{error=response.APIError}
// @Failure 404 {object} response.APIResponse{error=response.APIError}
// @Failure 500 {object} response.APIResponse{error=response.APIError}
// @Router /auth/me [get]
func (h *AuthHandler) GetCurrentUser(c *gin.Context) {
	// Get user ID from auth context (set by JWT middleware)
	userID, exists := c.Get("user_id")
	if !exists {
		response.Error(c, appErrors.NewUnauthorizedError("User not authenticated"))
		return
	}

	userIDUint, ok := userID.(uint)
	if !ok {
		response.Error(c, appErrors.NewInternalError("Invalid user ID format", nil))
		return
	}

	user, err := h.authService.GetCurrentUser(c.Request.Context(), userIDUint)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Success(c, user)
}

// Logout godoc
// @Summary User logout
// @Description Logout the current user (invalidate tokens)
// @Tags Authentication
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.APIResponse
// @Failure 401 {object} response.APIResponse{error=response.APIError}
// @Failure 500 {object} response.APIResponse{error=response.APIError}
// @Router /auth/logout [post]
func (h *AuthHandler) Logout(c *gin.Context) {
	// Get user ID from auth context (set by JWT middleware)
	userID, exists := c.Get("user_id")
	if !exists {
		response.Error(c, appErrors.NewUnauthorizedError("User not authenticated"))
		return
	}

	userIDUint, ok := userID.(uint)
	if !ok {
		response.Error(c, appErrors.NewInternalError("Invalid user ID format", nil))
		return
	}

	if err := h.authService.Logout(c.Request.Context(), userIDUint); err != nil {
		response.Error(c, err)
		return
	}

	response.Success(c, gin.H{"message": "Logged out successfully"})
}