package config

import (
	"fmt"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
	AWS      AWSConfig
	GCP      GCPConfig
	Storage  StorageConfig
	Redis    RedisConfig
	Logger   LoggerConfig
	CORS     CORSConfig
	JWT      JWTConfig
}

type ServerConfig struct {
	Port         string
	Environment  string
	ReadTimeout  time.Duration
	WriteTimeout time.Duration
	Host         string
}

type DatabaseConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	DBName   string
	SSLMode  string
	MaxConns int
	MaxIdle  int
}

type AWSConfig struct {
	Region          string
	AccessKeyID     string
	SecretAccessKey string
	S3Bucket        string
	S3Region        string
}

type GCPConfig struct {
	ProjectID               string
	ServiceAccountKeyPath   string
	ServiceAccountKey       string // JSON key content
	Bucket                  string
	Region                  string
}

type StorageConfig struct {
	Provider string // "aws" or "gcp"
}

type RedisConfig struct {
	URL      string
	Password string
	DB       int
}

type LoggerConfig struct {
	Level  string
	Format string
}

type CORSConfig struct {
	AllowedOrigins []string
}

type JWTConfig struct {
	AccessSecret     string
	RefreshSecret    string
	AccessExpiration time.Duration
	RefreshExpiration time.Duration
}

func Load() (*Config, error) {
	if err := godotenv.Load(); err != nil {
		// .env file is optional in production
		fmt.Println("Warning: .env file not found, using environment variables")
	}

	cfg := &Config{
		Server: ServerConfig{
			Port:         getEnv("SERVER_PORT", "8000"),
			Environment:  getEnv("SERVER_ENVIRONMENT", "development"),
			Host:         getEnv("SERVER_HOST", "0.0.0.0"),
			ReadTimeout:  getDurationEnv("SERVER_READ_TIMEOUT", 15*time.Second),
			WriteTimeout: getDurationEnv("SERVER_WRITE_TIMEOUT", 15*time.Second),
		},
		Database: DatabaseConfig{
			Host:     getEnv("DB_HOST", "localhost"),
			Port:     getEnv("DB_PORT", "5432"),
			User:     getEnv("DB_USER", "postgres"),
			Password: getPasswordFromEnv(),
			DBName:   getEnv("DB_NAME", "restaurant_menu"),
			SSLMode:  getEnv("DB_SSL_MODE", "disable"),
			MaxConns: getIntEnv("DB_MAX_CONNS", 25),
			MaxIdle:  getIntEnv("DB_MAX_IDLE", 5),
		},
		AWS: AWSConfig{
			Region:          getEnv("AWS_REGION", "us-east-1"),
			AccessKeyID:     getEnv("AWS_ACCESS_KEY_ID", ""),
			SecretAccessKey: getEnv("AWS_SECRET_ACCESS_KEY", ""),
			S3Bucket:        getEnv("S3_BUCKET", "restaurant-menu-images"),
			S3Region:        getEnv("S3_REGION", "us-east-1"),
		},
		GCP: GCPConfig{
			ProjectID:               getEnv("GCP_PROJECT_ID", ""),
			ServiceAccountKeyPath:   getEnv("GCP_SERVICE_ACCOUNT_KEY_PATH", ""),
			ServiceAccountKey:       getEnv("GCP_SERVICE_ACCOUNT_KEY", ""),
			Bucket:                  getEnv("GCP_BUCKET", "restaurant-menu-images"),
			Region:                  getEnv("GCP_REGION", "us-central1"),
		},
		Storage: StorageConfig{
			Provider: getEnv("STORAGE_PROVIDER", "aws"),
		},
		Redis: RedisConfig{
			URL:      buildRedisURL(),
			Password: getRedisPasswordFromEnv(),
			DB:       getIntEnv("REDIS_DB", 0),
		},
		Logger: LoggerConfig{
			Level:  getEnv("LOG_LEVEL", "info"),
			Format: getEnv("LOG_FORMAT", "json"),
		},
		CORS: CORSConfig{
			AllowedOrigins: getStringSliceEnv("CORS_ALLOWED_ORIGINS", []string{
				"http://localhost:3000",
				"http://127.0.0.1:3000",
				"http://localhost:3002", 
				"http://127.0.0.1:3002",
				"http://localhost:4000",
				"http://127.0.0.1:4000",
				"http://localhost:5173",
				"http://127.0.0.1:5173",
				"http://localhost:5174",
				"http://127.0.0.1:5174",
			}),
		},
		JWT: JWTConfig{
			AccessSecret:      getEnv("JWT_ACCESS_SECRET", "your-super-secret-access-key-change-this-in-production"),
			RefreshSecret:     getEnv("JWT_REFRESH_SECRET", "your-super-secret-refresh-key-change-this-in-production"),
			AccessExpiration:  getDurationEnv("JWT_ACCESS_EXPIRATION", 15*time.Minute),
			RefreshExpiration: getDurationEnv("JWT_REFRESH_EXPIRATION", 7*24*time.Hour), // 7 days
		},
	}

	if err := cfg.Validate(); err != nil {
		return nil, fmt.Errorf("invalid configuration: %w", err)
	}

	return cfg, nil
}

func (c *Config) Validate() error {
	if c.Database.Password == "" {
		return fmt.Errorf("database password is required")
	}

	// Validate storage provider configuration
	switch c.Storage.Provider {
	case "aws":
		if c.AWS.AccessKeyID == "" || c.AWS.SecretAccessKey == "" {
			return fmt.Errorf("AWS credentials are required when using AWS storage provider")
		}
	case "gcp":
		if c.GCP.ProjectID == "" {
			return fmt.Errorf("GCP project ID is required when using GCP storage provider")
		}
		if c.GCP.ServiceAccountKeyPath == "" && c.GCP.ServiceAccountKey == "" {
			return fmt.Errorf("GCP service account key (path or content) is required when using GCP storage provider")
		}
	default:
		return fmt.Errorf("invalid storage provider: %s. Supported providers: aws, gcp", c.Storage.Provider)
	}

	validEnvs := map[string]bool{
		"development": true,
		"staging":     true,
		"production":  true,
		"test":        true,
	}

	if !validEnvs[c.Server.Environment] {
		return fmt.Errorf("invalid environment: %s", c.Server.Environment)
	}

	// Validate JWT configuration
	if len(c.JWT.AccessSecret) < 32 {
		return fmt.Errorf("JWT access secret must be at least 32 characters long")
	}
	if len(c.JWT.RefreshSecret) < 32 {
		return fmt.Errorf("JWT refresh secret must be at least 32 characters long")
	}
	if c.JWT.AccessSecret == c.JWT.RefreshSecret {
		return fmt.Errorf("JWT access secret and refresh secret must be different")
	}
	if c.JWT.AccessExpiration <= 0 {
		return fmt.Errorf("JWT access token expiration must be positive")
	}
	if c.JWT.RefreshExpiration <= 0 {
		return fmt.Errorf("JWT refresh token expiration must be positive")
	}
	if c.JWT.AccessExpiration >= c.JWT.RefreshExpiration {
		return fmt.Errorf("JWT refresh token expiration must be longer than access token expiration")
	}

	return nil
}

func (c *Config) IsDevelopment() bool {
	return c.Server.Environment == "development"
}

func (c *Config) IsProduction() bool {
	return c.Server.Environment == "production"
}

func (c *Config) GetDSN() string {
	return fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		c.Database.Host,
		c.Database.Port,
		c.Database.User,
		c.Database.Password,
		c.Database.DBName,
		c.Database.SSLMode,
	)
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getIntEnv(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intVal, err := strconv.Atoi(value); err == nil {
			return intVal
		}
	}
	return defaultValue
}

func getDurationEnv(key string, defaultValue time.Duration) time.Duration {
	if value := os.Getenv(key); value != "" {
		if duration, err := time.ParseDuration(value); err == nil {
			return duration
		}
	}
	return defaultValue
}

func getStringSliceEnv(key string, defaultValue []string) []string {
	if value := os.Getenv(key); value != "" {
		parts := strings.Split(value, ",")
		for i := range parts {
			parts[i] = strings.TrimSpace(parts[i])
		}
		return parts
	}
	return defaultValue
}

func getPasswordFromEnv() string {
	// First try DB_PASSWORD
	if password := os.Getenv("DB_PASSWORD"); password != "" {
		return password
	}
	
	// Then try DB_PASSWORD_FILE
	if passwordFile := os.Getenv("DB_PASSWORD_FILE"); passwordFile != "" {
		if content, err := os.ReadFile(passwordFile); err == nil {
			return strings.TrimSpace(string(content))
		}
	}
	
	return ""
}

func getRedisPasswordFromEnv() string {
	// First try REDIS_PASSWORD
	if password := os.Getenv("REDIS_PASSWORD"); password != "" {
		return password
	}
	
	// Then try REDIS_PASSWORD_FILE
	if passwordFile := os.Getenv("REDIS_PASSWORD_FILE"); passwordFile != "" {
		if content, err := os.ReadFile(passwordFile); err == nil {
			return strings.TrimSpace(string(content))
		}
	}
	
	return ""
}

func buildRedisURL() string {
	// If REDIS_URL is set, use it directly
	if url := os.Getenv("REDIS_URL"); url != "" {
		return url
	}
	
	// Otherwise build from components
	host := getEnv("REDIS_HOST", "localhost")
	port := getEnv("REDIS_PORT", "6379")
	password := getRedisPasswordFromEnv()
	
	if password != "" {
		return fmt.Sprintf("redis://:%s@%s:%s", password, host, port)
	}
	return fmt.Sprintf("redis://%s:%s", host, port)
}