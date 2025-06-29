package handlers

import (
	"context"
	"time"

	"github.com/gin-gonic/gin"

	"restaurant-menu-api/internal/database"
	"restaurant-menu-api/pkg/logger"
	"restaurant-menu-api/pkg/response"
)

type HealthHandler struct {
	db     *database.Database
	logger *logger.Logger
}

type HealthResponse struct {
	Status    string                 `json:"status"`
	Timestamp string                 `json:"timestamp"`
	Version   string                 `json:"version"`
	Uptime    string                 `json:"uptime"`
	Checks    map[string]interface{} `json:"checks,omitempty"`
}

var startTime = time.Now()

func NewHealthHandler(db *database.Database, logger *logger.Logger) *HealthHandler {
	return &HealthHandler{
		db:     db,
		logger: logger,
	}
}

// Health godoc
// @Summary Health check
// @Description Basic health check endpoint
// @Tags Health
// @Accept json
// @Produce json
// @Success 200 {object} HealthResponse
// @Router /v1/health [get]
func (h *HealthHandler) Health(c *gin.Context) {
	response.Success(c, HealthResponse{
		Status:    "healthy",
		Timestamp: time.Now().UTC().Format(time.RFC3339),
		Version:   "1.0.0",
		Uptime:    time.Since(startTime).String(),
	})
}

// Ready godoc
// @Summary Readiness check
// @Description Check if the application is ready to serve requests
// @Tags Health
// @Accept json
// @Produce json
// @Success 200 {object} HealthResponse
// @Failure 500 {object} HealthResponse
// @Router /ready [get]
func (h *HealthHandler) Ready(c *gin.Context) {
	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
	defer cancel()

	checks := make(map[string]interface{})
	allHealthy := true

	// Check database connection
	if err := h.db.HealthCheck(); err != nil {
		checks["database"] = map[string]interface{}{
			"status": "unhealthy",
			"error":  err.Error(),
		}
		allHealthy = false
		h.logger.WithContext(ctx).WithError(err).Error("Database health check failed")
	} else {
		checks["database"] = map[string]interface{}{
			"status": "healthy",
		}
	}

	status := "ready"
	if !allHealthy {
		status = "not ready"
	}

	healthResponse := HealthResponse{
		Status:    status,
		Timestamp: time.Now().UTC().Format(time.RFC3339),
		Version:   "1.0.0",
		Uptime:    time.Since(startTime).String(),
		Checks:    checks,
	}

	if allHealthy {
		response.Success(c, healthResponse)
	} else {
		response.Error(c, nil) // This will return 500 with the health data
	}
}

// Live godoc
// @Summary Liveness check
// @Description Check if the application is alive
// @Tags Health
// @Accept json
// @Produce json
// @Success 200 {object} HealthResponse
// @Router /live [get]
func (h *HealthHandler) Live(c *gin.Context) {
	response.Success(c, HealthResponse{
		Status:    "alive",
		Timestamp: time.Now().UTC().Format(time.RFC3339),
		Version:   "1.0.0",
		Uptime:    time.Since(startTime).String(),
	})
}

// Status godoc
// @Summary Application status
// @Description Get detailed application status with health checks
// @Tags Health
// @Accept json
// @Produce json
// @Success 200 {object} HealthResponse
// @Router /status [get]
func (h *HealthHandler) Status(c *gin.Context) {
	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
	defer cancel()
	_ = ctx // Use ctx to avoid unused variable error

	checks := make(map[string]interface{})

	// Database status
	if err := h.db.HealthCheck(); err != nil {
		checks["database"] = map[string]interface{}{
			"status": "unhealthy",
			"error":  err.Error(),
		}
	} else {
		dbStats := h.db.GetStats()
		checks["database"] = map[string]interface{}{
			"status": "healthy",
			"stats":  dbStats,
		}
	}

	// API status
	checks["api"] = map[string]interface{}{
		"status":     "healthy",
		"version":    "1.0.0",
		"uptime":     time.Since(startTime).String(),
		"start_time": startTime.Format(time.RFC3339),
	}

	response.Success(c, HealthResponse{
		Status:    "operational",
		Timestamp: time.Now().UTC().Format(time.RFC3339),
		Version:   "1.0.0",
		Uptime:    time.Since(startTime).String(),
		Checks:    checks,
	})
}
