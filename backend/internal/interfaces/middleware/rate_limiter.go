package middleware

import (
	"context"
	"fmt"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"

	"restaurant-menu-api/internal/infrastructure/redis"
	"restaurant-menu-api/pkg/logger"
	"restaurant-menu-api/pkg/response"
)

type RateLimiter struct {
	redisClient *redis.Client
	logger      *logger.Logger
	config      RateLimiterConfig
}

type RateLimiterConfig struct {
	RequestsPerMinute int
	WindowSize        time.Duration
	KeyPrefix         string
}

func NewRateLimiter(redisClient *redis.Client, logger *logger.Logger, config RateLimiterConfig) *RateLimiter {
	if config.RequestsPerMinute == 0 {
		config.RequestsPerMinute = 100 // Default: 100 requests per minute
	}
	if config.WindowSize == 0 {
		config.WindowSize = time.Minute // Default: 1 minute window
	}
	if config.KeyPrefix == "" {
		config.KeyPrefix = "rate_limit"
	}

	return &RateLimiter{
		redisClient: redisClient,
		logger:      logger,
		config:      config,
	}
}

func (rl *RateLimiter) Middleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		// Get client identifier (IP address + User-Agent for more uniqueness)
		clientID := rl.getClientID(c)
		
		// Check rate limit
		allowed, remaining, resetTime, err := rl.checkRateLimit(ctx, clientID)
		if err != nil {
			rl.logger.LogError(ctx, err, "Rate limiter error", map[string]interface{}{
				"client_id": clientID,
			})
			// On error, allow the request but log the issue
			c.Next()
			return
		}

		// Set rate limit headers
		c.Header("X-RateLimit-Limit", strconv.Itoa(rl.config.RequestsPerMinute))
		c.Header("X-RateLimit-Remaining", strconv.Itoa(remaining))
		c.Header("X-RateLimit-Reset", strconv.FormatInt(resetTime.Unix(), 10))

		if !allowed {
			rl.logger.LogWarning(ctx, "Rate limit exceeded", map[string]interface{}{
				"client_id":  clientID,
				"path":       c.Request.URL.Path,
				"method":     c.Request.Method,
				"user_agent": c.Request.UserAgent(),
			})

			response.Error(c, fmt.Errorf("rate limit exceeded"))
			c.Abort()
			return
		}

		c.Next()
	}
}

func (rl *RateLimiter) checkRateLimit(ctx context.Context, clientID string) (allowed bool, remaining int, resetTime time.Time, err error) {
	key := fmt.Sprintf("%s:%s", rl.config.KeyPrefix, clientID)
	
	// Use sliding window approach
	now := time.Now()
	windowStart := now.Truncate(rl.config.WindowSize)
	resetTime = windowStart.Add(rl.config.WindowSize)

	// Get current count
	count, err := rl.redisClient.IncrementWithExpiry(ctx, key, rl.config.WindowSize)
	if err != nil {
		return false, 0, resetTime, err
	}

	remaining = rl.config.RequestsPerMinute - int(count)
	if remaining < 0 {
		remaining = 0
	}

	allowed = count <= int64(rl.config.RequestsPerMinute)

	return allowed, remaining, resetTime, nil
}

func (rl *RateLimiter) getClientID(c *gin.Context) string {
	// Try to get real IP from headers (for load balancers/proxies)
	ip := c.GetHeader("X-Forwarded-For")
	if ip == "" {
		ip = c.GetHeader("X-Real-IP")
	}
	if ip == "" {
		ip = c.ClientIP()
	}

	// Include user agent for additional uniqueness (truncated to avoid very long keys)
	userAgent := c.Request.UserAgent()
	if len(userAgent) > 50 {
		userAgent = userAgent[:50]
	}

	return fmt.Sprintf("%s:%s", ip, userAgent)
}

// Advanced rate limiter with different limits for different endpoints
type AdvancedRateLimiter struct {
	redisClient *redis.Client
	logger      *logger.Logger
	rules       map[string]RateLimiterConfig
	defaultRule RateLimiterConfig
}

func NewAdvancedRateLimiter(redisClient *redis.Client, logger *logger.Logger) *AdvancedRateLimiter {
	return &AdvancedRateLimiter{
		redisClient: redisClient,
		logger:      logger,
		rules: map[string]RateLimiterConfig{
			"/v1/upload":     {RequestsPerMinute: 10, WindowSize: time.Minute, KeyPrefix: "rate_limit_upload"},
			"/v1/search":     {RequestsPerMinute: 50, WindowSize: time.Minute, KeyPrefix: "rate_limit_search"},
			"/v1/menu":       {RequestsPerMinute: 200, WindowSize: time.Minute, KeyPrefix: "rate_limit_menu"},
			"POST:/v1/":      {RequestsPerMinute: 30, WindowSize: time.Minute, KeyPrefix: "rate_limit_post"},
			"PUT:/v1/":       {RequestsPerMinute: 30, WindowSize: time.Minute, KeyPrefix: "rate_limit_put"},
			"DELETE:/v1/":    {RequestsPerMinute: 20, WindowSize: time.Minute, KeyPrefix: "rate_limit_delete"},
		},
		defaultRule: RateLimiterConfig{
			RequestsPerMinute: 100,
			WindowSize:        time.Minute,
			KeyPrefix:         "rate_limit_default",
		},
	}
}

func (arl *AdvancedRateLimiter) Middleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		// Get client identifier
		clientID := arl.getClientID(c)
		
		// Determine which rule to apply
		rule := arl.getRuleForRequest(c)
		
		// Create rate limiter for this rule
		rl := NewRateLimiter(arl.redisClient, arl.logger, rule)
		
		// Check rate limit
		allowed, remaining, resetTime, err := rl.checkRateLimit(ctx, clientID)
		if err != nil {
			arl.logger.LogError(ctx, err, "Advanced rate limiter error", map[string]interface{}{
				"client_id": clientID,
				"rule":      rule.KeyPrefix,
			})
			// On error, allow the request but log the issue
			c.Next()
			return
		}

		// Set rate limit headers
		c.Header("X-RateLimit-Limit", strconv.Itoa(rule.RequestsPerMinute))
		c.Header("X-RateLimit-Remaining", strconv.Itoa(remaining))
		c.Header("X-RateLimit-Reset", strconv.FormatInt(resetTime.Unix(), 10))
		c.Header("X-RateLimit-Policy", rule.KeyPrefix)

		if !allowed {
			arl.logger.LogWarning(ctx, "Rate limit exceeded", map[string]interface{}{
				"client_id":  clientID,
				"path":       c.Request.URL.Path,
				"method":     c.Request.Method,
				"user_agent": c.Request.UserAgent(),
				"rule":       rule.KeyPrefix,
				"limit":      rule.RequestsPerMinute,
			})

			response.Error(c, fmt.Errorf("rate limit exceeded for this endpoint"))
			c.Abort()
			return
		}

		c.Next()
	}
}

func (arl *AdvancedRateLimiter) getRuleForRequest(c *gin.Context) RateLimiterConfig {
	path := c.Request.URL.Path
	method := c.Request.Method

	// Check for method-specific rules first
	methodPath := fmt.Sprintf("%s:%s", method, path)
	if rule, exists := arl.rules[methodPath]; exists {
		return rule
	}

	// Check for method-prefix rules
	for prefix, rule := range arl.rules {
		if method+":" == prefix[:len(method)+1] && 
		   len(prefix) > len(method)+1 && 
		   path[:len(prefix)-len(method)-1] == prefix[len(method)+1:] {
			return rule
		}
	}

	// Check for path-specific rules
	if rule, exists := arl.rules[path]; exists {
		return rule
	}

	// Check for path prefix rules
	for prefix, rule := range arl.rules {
		if len(prefix) > 0 && prefix[len(prefix)-1:] != ":" && 
		   len(path) >= len(prefix) && 
		   path[:len(prefix)] == prefix {
			return rule
		}
	}

	// Return default rule
	return arl.defaultRule
}

func (arl *AdvancedRateLimiter) getClientID(c *gin.Context) string {
	// Try to get real IP from headers (for load balancers/proxies)
	ip := c.GetHeader("X-Forwarded-For")
	if ip == "" {
		ip = c.GetHeader("X-Real-IP")
	}
	if ip == "" {
		ip = c.ClientIP()
	}

	// Include user agent for additional uniqueness (truncated to avoid very long keys)
	userAgent := c.Request.UserAgent()
	if len(userAgent) > 50 {
		userAgent = userAgent[:50]
	}

	return fmt.Sprintf("%s:%s", ip, userAgent)
}

// IP-based simple rate limiter (fallback when Redis is not available)
type SimpleRateLimiter struct {
	requests map[string][]time.Time
	limit    int
	window   time.Duration
}

func NewSimpleRateLimiter(limit int, window time.Duration) *SimpleRateLimiter {
	return &SimpleRateLimiter{
		requests: make(map[string][]time.Time),
		limit:    limit,
		window:   window,
	}
}

func (srl *SimpleRateLimiter) Middleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		ip := c.ClientIP()
		now := time.Now()

		// Clean old entries
		srl.cleanup(ip, now)

		// Check current requests
		if len(srl.requests[ip]) >= srl.limit {
			response.Error(c, fmt.Errorf("rate limit exceeded"))
			c.Abort()
			return
		}

		// Add current request
		srl.requests[ip] = append(srl.requests[ip], now)

		c.Next()
	}
}

func (srl *SimpleRateLimiter) cleanup(ip string, now time.Time) {
	cutoff := now.Add(-srl.window)
	requests := srl.requests[ip]
	
	var validRequests []time.Time
	for _, req := range requests {
		if req.After(cutoff) {
			validRequests = append(validRequests, req)
		}
	}
	
	if len(validRequests) == 0 {
		delete(srl.requests, ip)
	} else {
		srl.requests[ip] = validRequests
	}
}