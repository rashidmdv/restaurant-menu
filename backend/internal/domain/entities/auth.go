package entities

import (
	"time"
)

type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

type LoginResponse struct {
	AccessToken  string      `json:"access_token"`
	RefreshToken string      `json:"refresh_token"`
	ExpiresAt    time.Time   `json:"expires_at"`
	User         UserResponse `json:"user"`
}

type RefreshTokenRequest struct {
	RefreshToken string `json:"refresh_token" validate:"required"`
}

type RefreshTokenResponse struct {
	AccessToken  string    `json:"access_token"`
	RefreshToken string    `json:"refresh_token"`
	ExpiresAt    time.Time `json:"expires_at"`
}

type JWTClaims struct {
	UserID   uint     `json:"user_id"`
	Email    string   `json:"email"`
	Role     UserRole `json:"role"`
	IsActive bool     `json:"is_active"`
	Type     string   `json:"type"` // "access" or "refresh"
	IssuedAt int64    `json:"iat"`
	ExpiresAt int64   `json:"exp"`
	TokenID  string   `json:"jti"` // JWT ID for token revocation
}

type TokenPair struct {
	AccessToken  string
	RefreshToken string
	ExpiresAt    time.Time
}

// AuthContext holds the authenticated user information
type AuthContext struct {
	UserID   uint
	Email    string
	Role     UserRole
	IsActive bool
}

func (a *AuthContext) IsAdmin() bool {
	return a.Role == UserRoleAdmin
}

func (a *AuthContext) CanManageUsers() bool {
	return a.Role == UserRoleAdmin
}

func (a *AuthContext) CanManageContent() bool {
	return a.Role == UserRoleAdmin || a.Role == UserRoleModerator
}

func (a *AuthContext) CanViewDashboard() bool {
	return a.Role == UserRoleAdmin || a.Role == UserRoleModerator || a.Role == UserRoleViewer
}