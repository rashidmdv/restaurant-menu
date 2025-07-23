package middleware

import (
	"github.com/gin-gonic/gin"

	"restaurant-menu-api/internal/domain/entities"
	"restaurant-menu-api/internal/utils"
	appErrors "restaurant-menu-api/pkg/errors"
	"restaurant-menu-api/pkg/logger"
	"restaurant-menu-api/pkg/response"
)

// JWTAuth creates JWT authentication middleware
func JWTAuth(jwtService *utils.JWTService, logger *logger.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			logger.LogWarning(c.Request.Context(), "Missing authorization header", nil)
			response.Error(c, appErrors.NewUnauthorizedError("Authorization header is required"))
			c.Abort()
			return
		}

		// Extract token from Bearer header
		token, err := utils.ExtractTokenFromBearer(authHeader)
		if err != nil {
			logger.LogWarning(c.Request.Context(), "Invalid authorization header format", map[string]interface{}{
				"header": authHeader,
				"error":  err.Error(),
			})
			response.Error(c, appErrors.NewUnauthorizedError("Invalid authorization header format"))
			c.Abort()
			return
		}

		// Validate access token
		authContext, err := jwtService.ValidateAccessToken(token)
		if err != nil {
			logger.LogWarning(c.Request.Context(), "Invalid access token", map[string]interface{}{
				"error": err.Error(),
			})
			response.Error(c, appErrors.NewUnauthorizedError("Invalid or expired token"))
			c.Abort()
			return
		}

		// Set auth context in gin context
		c.Set("user_id", authContext.UserID)
		c.Set("user_email", authContext.Email)
		c.Set("user_role", string(authContext.Role))
		c.Set("user_is_active", authContext.IsActive)
		c.Set("auth_context", authContext)

		logger.LogDebug(c.Request.Context(), "User authenticated successfully", map[string]interface{}{
			"user_id": authContext.UserID,
			"email":   authContext.Email,
			"role":    authContext.Role,
		})

		c.Next()
	}
}

// RequireRole creates middleware that requires specific user role
func RequireRole(requiredRoles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		userRole, exists := c.Get("user_role")
		if !exists {
			response.Error(c, appErrors.NewUnauthorizedError("User not authenticated"))
			c.Abort()
			return
		}

		userRoleStr, ok := userRole.(string)
		if !ok {
			response.Error(c, appErrors.NewInternalError("Invalid user role format", nil))
			c.Abort()
			return
		}

		// Check if user has any of the required roles
		hasRequiredRole := false
		for _, role := range requiredRoles {
			if userRoleStr == role {
				hasRequiredRole = true
				break
			}
		}

		if !hasRequiredRole {
			response.Error(c, appErrors.NewForbiddenError("Insufficient permissions"))
			c.Abort()
			return
		}

		c.Next()
	}
}

// RequireAdmin is a convenience middleware that requires admin role
func RequireAdmin() gin.HandlerFunc {
	return RequireRole("admin")
}

// RequireAdminOrModerator is a convenience middleware that requires admin or moderator role
func RequireAdminOrModerator() gin.HandlerFunc {
	return RequireRole("admin", "moderator")
}

// RequireActiveUser ensures the user account is active
func RequireActiveUser() gin.HandlerFunc {
	return func(c *gin.Context) {
		userIsActive, exists := c.Get("user_is_active")
		if !exists {
			response.Error(c, appErrors.NewUnauthorizedError("User not authenticated"))
			c.Abort()
			return
		}

		isActive, ok := userIsActive.(bool)
		if !ok {
			response.Error(c, appErrors.NewInternalError("Invalid user status format", nil))
			c.Abort()
			return
		}

		if !isActive {
			response.Error(c, appErrors.NewUnauthorizedError("Account is inactive"))
			c.Abort()
			return
		}

		c.Next()
	}
}

// OptionalAuth creates optional JWT authentication middleware
// If token is provided, it validates it, but doesn't fail if missing
func OptionalAuth(jwtService *utils.JWTService, logger *logger.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			// No auth header, continue without authentication
			c.Next()
			return
		}

		// Extract token from Bearer header
		token, err := utils.ExtractTokenFromBearer(authHeader)
		if err != nil {
			// Invalid header format, continue without authentication
			c.Next()
			return
		}

		// Validate access token
		authContext, err := jwtService.ValidateAccessToken(token)
		if err != nil {
			// Invalid token, continue without authentication
			c.Next()
			return
		}

		// Set auth context in gin context
		c.Set("user_id", authContext.UserID)
		c.Set("user_email", authContext.Email)
		c.Set("user_role", string(authContext.Role))
		c.Set("user_is_active", authContext.IsActive)
		c.Set("auth_context", authContext)

		c.Next()
	}
}

// GetAuthContext retrieves the authentication context from gin context
func GetAuthContext(c *gin.Context) (*entities.AuthContext, bool) {
	authContext, exists := c.Get("auth_context")
	if !exists {
		return nil, false
	}

	auth, ok := authContext.(*entities.AuthContext)
	return auth, ok
}

// GetCurrentUserID retrieves the current user ID from gin context
func GetCurrentUserID(c *gin.Context) (uint, bool) {
	userID, exists := c.Get("user_id")
	if !exists {
		return 0, false
	}

	userIDUint, ok := userID.(uint)
	return userIDUint, ok
}

// IsCurrentUser checks if the provided user ID matches the authenticated user
func IsCurrentUser(c *gin.Context, userID uint) bool {
	currentUserID, exists := GetCurrentUserID(c)
	if !exists {
		return false
	}
	return currentUserID == userID
}

// CanManageUser checks if the authenticated user can manage the specified user
func CanManageUser(c *gin.Context, targetUserID uint) bool {
	authContext, exists := GetAuthContext(c)
	if !exists {
		return false
	}

	// Admin can manage any user
	if authContext.IsAdmin() {
		return true
	}

	// Users can manage themselves
	return authContext.UserID == targetUserID
}