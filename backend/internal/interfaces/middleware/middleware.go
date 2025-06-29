package middleware

import (
	"context"
	"fmt"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"restaurant-menu-api/pkg/logger"
	"restaurant-menu-api/pkg/response"
)

func RequestLogger(log *logger.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		path := c.Request.URL.Path
		method := c.Request.Method
		clientIP := c.ClientIP()
		userAgent := c.Request.UserAgent()

		// Process request
		c.Next()

		// Calculate processing time
		duration := time.Since(start).Milliseconds()
		statusCode := c.Writer.Status()

		// Get request ID from context
		requestID := c.GetString("request_id")

		// Create context with request ID for logging
		ctx := log.WithRequestID(context.Background(), requestID)

		// Log the request
		log.LogRequest(ctx, method, path, userAgent, clientIP, statusCode, float64(duration))
	}
}

func RequestID() gin.HandlerFunc {
	return func(c *gin.Context) {
		requestID := c.GetHeader("X-Request-ID")
		if requestID == "" {
			requestID = uuid.New().String()
		}

		c.Set("request_id", requestID)
		c.Header("X-Request-ID", requestID)

		c.Next()
	}
}

// RateLimiter is now implemented in rate_limiter.go
// This is kept for backward compatibility but should use the new Redis-based rate limiter

func Timeout(timeout time.Duration) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(c.Request.Context(), timeout)
		defer cancel()

		c.Request = c.Request.WithContext(ctx)

		finished := make(chan struct{})
		panicChan := make(chan interface{}, 1)

		go func() {
			defer func() {
				if p := recover(); p != nil {
					panicChan <- p
				}
			}()

			c.Next()
			finished <- struct{}{}
		}()

		select {
		case <-finished:
			return
		case p := <-panicChan:
			panic(p)
		case <-ctx.Done():
			c.Header("Connection", "close")
			response.InternalServerError(c, "Request timeout")
			c.Abort()
			return
		}
	}
}

func ErrorHandler() gin.HandlerFunc {
	return gin.CustomRecovery(func(c *gin.Context, recovered interface{}) {
		if err, ok := recovered.(string); ok {
			response.InternalServerError(c, fmt.Sprintf("Internal server error: %s", err))
		} else {
			response.InternalServerError(c, "Internal server error")
		}
		c.Abort()
	})
}

func CORS() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Credentials", "true")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Header("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE, PATCH")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}

func TimestampMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Set("timestamp", time.Now().UTC().Format(time.RFC3339))
		c.Next()
	}
}