package utils

import (
	"errors"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"restaurant-menu-api/internal/domain/entities"
)

type JWTService struct {
	accessSecret      string
	refreshSecret     string
	accessExpiration  time.Duration
	refreshExpiration time.Duration
}

func NewJWTService(accessSecret, refreshSecret string, accessExpiration, refreshExpiration time.Duration) *JWTService {
	return &JWTService{
		accessSecret:      accessSecret,
		refreshSecret:     refreshSecret,
		accessExpiration:  accessExpiration,
		refreshExpiration: refreshExpiration,
	}
}

// GenerateTokenPair creates both access and refresh tokens for a user
func (j *JWTService) GenerateTokenPair(user *entities.User) (*entities.TokenPair, error) {
	if user == nil {
		return nil, errors.New("user cannot be nil")
	}

	now := time.Now()
	accessExpiry := now.Add(j.accessExpiration)
	refreshExpiry := now.Add(j.refreshExpiration)

	// Generate access token
	accessTokenID := uuid.New().String()
	accessClaims := &entities.JWTClaims{
		UserID:    user.ID,
		Email:     user.Email,
		Role:      user.Role,
		IsActive:  user.IsActive,
		Type:      "access",
		IssuedAt:  now.Unix(),
		ExpiresAt: accessExpiry.Unix(),
		TokenID:   accessTokenID,
	}

	accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id":   accessClaims.UserID,
		"email":     accessClaims.Email,
		"role":      accessClaims.Role,
		"is_active": accessClaims.IsActive,
		"type":      accessClaims.Type,
		"iat":       accessClaims.IssuedAt,
		"exp":       accessClaims.ExpiresAt,
		"jti":       accessClaims.TokenID,
	})

	accessTokenString, err := accessToken.SignedString([]byte(j.accessSecret))
	if err != nil {
		return nil, fmt.Errorf("failed to sign access token: %w", err)
	}

	// Generate refresh token
	refreshTokenID := uuid.New().String()
	refreshClaims := &entities.JWTClaims{
		UserID:    user.ID,
		Email:     user.Email,
		Role:      user.Role,
		IsActive:  user.IsActive,
		Type:      "refresh",
		IssuedAt:  now.Unix(),
		ExpiresAt: refreshExpiry.Unix(),
		TokenID:   refreshTokenID,
	}

	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id":   refreshClaims.UserID,
		"email":     refreshClaims.Email,
		"role":      refreshClaims.Role,
		"is_active": refreshClaims.IsActive,
		"type":      refreshClaims.Type,
		"iat":       refreshClaims.IssuedAt,
		"exp":       refreshClaims.ExpiresAt,
		"jti":       refreshClaims.TokenID,
	})

	refreshTokenString, err := refreshToken.SignedString([]byte(j.refreshSecret))
	if err != nil {
		return nil, fmt.Errorf("failed to sign refresh token: %w", err)
	}

	return &entities.TokenPair{
		AccessToken:  accessTokenString,
		RefreshToken: refreshTokenString,
		ExpiresAt:    accessExpiry,
	}, nil
}

// ValidateAccessToken validates and parses an access token
func (j *JWTService) ValidateAccessToken(tokenString string) (*entities.AuthContext, error) {
	return j.validateToken(tokenString, j.accessSecret, "access")
}

// ValidateRefreshToken validates and parses a refresh token
func (j *JWTService) ValidateRefreshToken(tokenString string) (*entities.AuthContext, error) {
	return j.validateToken(tokenString, j.refreshSecret, "refresh")
}

// validateToken is a helper function to validate tokens
func (j *JWTService) validateToken(tokenString, secret, expectedType string) (*entities.AuthContext, error) {
	if tokenString == "" {
		return nil, errors.New("token cannot be empty")
	}

	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(secret), nil
	})

	if err != nil {
		return nil, fmt.Errorf("failed to parse token: %w", err)
	}

	if !token.Valid {
		return nil, errors.New("invalid token")
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return nil, errors.New("invalid token claims")
	}

	// Validate token type
	tokenType, ok := claims["type"].(string)
	if !ok || tokenType != expectedType {
		return nil, fmt.Errorf("invalid token type: expected %s, got %s", expectedType, tokenType)
	}

	// Extract user information
	userID, ok := claims["user_id"].(float64)
	if !ok {
		return nil, errors.New("invalid user_id in token")
	}

	email, ok := claims["email"].(string)
	if !ok {
		return nil, errors.New("invalid email in token")
	}

	roleStr, ok := claims["role"].(string)
	if !ok {
		return nil, errors.New("invalid role in token")
	}

	isActive, ok := claims["is_active"].(bool)
	if !ok {
		return nil, errors.New("invalid is_active in token")
	}

	// Check if user is active
	if !isActive {
		return nil, errors.New("user account is inactive")
	}

	// Check expiration
	exp, ok := claims["exp"].(float64)
	if !ok {
		return nil, errors.New("invalid expiration in token")
	}

	if time.Now().Unix() > int64(exp) {
		return nil, errors.New("token has expired")
	}

	return &entities.AuthContext{
		UserID:   uint(userID),
		Email:    email,
		Role:     entities.UserRole(roleStr),
		IsActive: isActive,
	}, nil
}

// RefreshAccessToken generates a new access token from a valid refresh token
func (j *JWTService) RefreshAccessToken(refreshTokenString string, user *entities.User) (*entities.TokenPair, error) {
	// Validate the refresh token
	_, err := j.ValidateRefreshToken(refreshTokenString)
	if err != nil {
		return nil, fmt.Errorf("invalid refresh token: %w", err)
	}

	// Generate new token pair
	return j.GenerateTokenPair(user)
}

// ExtractTokenFromBearer extracts JWT token from Bearer authorization header
func ExtractTokenFromBearer(authHeader string) (string, error) {
	if authHeader == "" {
		return "", errors.New("authorization header is empty")
	}

	const bearerPrefix = "Bearer "
	if len(authHeader) < len(bearerPrefix) || authHeader[:len(bearerPrefix)] != bearerPrefix {
		return "", errors.New("invalid authorization header format")
	}

	token := authHeader[len(bearerPrefix):]
	if token == "" {
		return "", errors.New("token is empty")
	}

	return token, nil
}