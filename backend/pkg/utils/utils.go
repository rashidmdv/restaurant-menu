package utils

import (
	"regexp"
	"strconv"
	"strings"
)

// GenerateSlug creates a URL-friendly slug from a string
func GenerateSlug(s string) string {
	// Convert to lowercase
	slug := strings.ToLower(s)
	
	// Replace spaces and special characters with hyphens
	reg := regexp.MustCompile(`[^a-z0-9]+`)
	slug = reg.ReplaceAllString(slug, "-")
	
	// Remove leading and trailing hyphens
	slug = strings.Trim(slug, "-")
	
	return slug
}

// BoolPtr returns a pointer to a bool value
func BoolPtr(b bool) *bool {
	return &b
}

// StringPtr returns a pointer to a string value
func StringPtr(s string) *string {
	if s == "" {
		return nil
	}
	return &s
}

// IntPtr returns a pointer to an int value
func IntPtr(i int) *int {
	return &i
}

// ParseBool parses a string to bool with default value
func ParseBool(s string, defaultValue bool) bool {
	if s == "" {
		return defaultValue
	}
	
	b, err := strconv.ParseBool(s)
	if err != nil {
		return defaultValue
	}
	
	return b
}

// ParseBoolPtr parses a string to *bool, returns nil if empty
func ParseBoolPtr(s string) *bool {
	if s == "" {
		return nil
	}
	
	b, err := strconv.ParseBool(s)
	if err != nil {
		return nil
	}
	
	return &b
}

// ParseStringPtr returns pointer to string if not empty, nil otherwise
func ParseStringPtr(s string) *string {
	if s == "" {
		return nil
	}
	return &s
}

// ParseIntPtr parses string to *int, returns nil if empty or invalid
func ParseIntPtr(s string) *int {
	if s == "" {
		return nil
	}
	
	i, err := strconv.Atoi(s)
	if err != nil {
		return nil
	}
	
	return &i
}

// ParseInt parses string to int with default value
func ParseInt(s string, defaultValue int) int {
	if s == "" {
		return defaultValue
	}
	
	i, err := strconv.Atoi(s)
	if err != nil {
		return defaultValue
	}
	
	return i
}

// ParseFloat64 parses string to float64 with default value
func ParseFloat64(s string, defaultValue float64) float64 {
	if s == "" {
		return defaultValue
	}
	
	f, err := strconv.ParseFloat(s, 64)
	if err != nil {
		return defaultValue
	}
	
	return f
}

// Contains checks if a slice contains a specific string
func Contains(slice []string, item string) bool {
	for _, s := range slice {
		if s == item {
			return true
		}
	}
	return false
}

// MaxInt returns the maximum of two integers
func MaxInt(a, b int) int {
	if a > b {
		return a
	}
	return b
}

// MinInt returns the minimum of two integers
func MinInt(a, b int) int {
	if a < b {
		return a
	}
	return b
}

// TruncateString truncates a string to a maximum length
func TruncateString(s string, maxLength int) string {
	if len(s) <= maxLength {
		return s
	}
	return s[:maxLength-3] + "..."
}