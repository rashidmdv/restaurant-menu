package utils

import (
	"errors"
	"golang.org/x/crypto/bcrypt"
)

const (
	// DefaultCost is the default cost for bcrypt hashing
	DefaultCost = 12
)

// HashPassword takes a plain text password and returns a bcrypt hash
func HashPassword(password string) (string, error) {
	if len(password) == 0 {
		return "", errors.New("password cannot be empty")
	}
	
	if len(password) > 72 {
		return "", errors.New("password too long (max 72 characters)")
	}

	hashedBytes, err := bcrypt.GenerateFromPassword([]byte(password), DefaultCost)
	if err != nil {
		return "", err
	}

	return string(hashedBytes), nil
}

// VerifyPassword compares a plain text password with a hash
func VerifyPassword(password, hashedPassword string) bool {
	if len(password) == 0 || len(hashedPassword) == 0 {
		return false
	}

	err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
	return err == nil
}

// IsValidPasswordLength checks if password meets length requirements
func IsValidPasswordLength(password string) bool {
	return len(password) >= 8 && len(password) <= 72
}