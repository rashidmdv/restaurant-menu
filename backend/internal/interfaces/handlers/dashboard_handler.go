package handlers

import (
	"strconv"
	"time"

	"github.com/gin-gonic/gin"

	"restaurant-menu-api/internal/domain/entities"
	"restaurant-menu-api/internal/domain/services"
	"restaurant-menu-api/pkg/errors"
	"restaurant-menu-api/pkg/logger"
	"restaurant-menu-api/pkg/response"
)

// DashboardHandler handles dashboard-related HTTP requests
type DashboardHandler struct {
	service services.DashboardService
	logger  *logger.Logger
}

// NewDashboardHandler creates a new dashboard handler instance
func NewDashboardHandler(service services.DashboardService, logger *logger.Logger) *DashboardHandler {
	return &DashboardHandler{
		service: service,
		logger:  logger,
	}
}

// GetDashboardStats retrieves overall dashboard statistics
// @Summary Get dashboard statistics
// @Description Get overall dashboard statistics including items, categories, and activity counts
// @Tags dashboard
// @Accept json
// @Produce json
// @Param days query int false "Number of days for recent activity (default: 7)"
// @Param date_from query string false "Start date for filtering (YYYY-MM-DD)"
// @Param date_to query string false "End date for filtering (YYYY-MM-DD)"
// @Param category_id query int false "Filter by category ID"
// @Param active query bool false "Filter by active status"
// @Success 200 {object} response.APIResponse{data=entities.DashboardStats}
// @Failure 400 {object} response.APIResponse
// @Failure 500 {object} response.APIResponse
// @Router /api/v1/dashboard/stats [get]
func (h *DashboardHandler) GetDashboardStats(c *gin.Context) {
	ctx := c.Request.Context()
	
	filter, err := h.parseFilter(c)
	if err != nil {
		h.logger.LogError(ctx, err, "Failed to parse dashboard filter", nil)
		response.ValidationError(c, "Invalid filter parameters", err.Error())
		return
	}
	
	stats, err := h.service.GetDashboardStats(ctx, filter)
	if err != nil {
		h.logger.LogError(ctx, err, "Failed to get dashboard stats", map[string]interface{}{
			"filter": filter,
		})
		response.Error(c, errors.WrapInternalError(err, "Failed to retrieve dashboard statistics"))
		return
	}
	
	response.Success(c, stats)
}

// GetRecentActivity retrieves recent activities in the system
// @Summary Get recent activity
// @Description Get recent activities like item creation, category updates, etc.
// @Tags dashboard
// @Accept json
// @Produce json
// @Param days query int false "Number of days for recent activity (default: 7)"
// @Param date_from query string false "Start date for filtering (YYYY-MM-DD)"
// @Param date_to query string false "End date for filtering (YYYY-MM-DD)"
// @Success 200 {object} response.APIResponse{data=[]entities.RecentActivity}
// @Failure 400 {object} response.APIResponse
// @Failure 500 {object} response.APIResponse
// @Router /api/v1/dashboard/activity [get]
func (h *DashboardHandler) GetRecentActivity(c *gin.Context) {
	ctx := c.Request.Context()
	
	filter, err := h.parseFilter(c)
	if err != nil {
		h.logger.LogError(ctx, err, "Failed to parse dashboard filter", nil)
		response.ValidationError(c, "Invalid filter parameters", err.Error())
		return
	}
	
	activity, err := h.service.GetRecentActivity(ctx, filter)
	if err != nil {
		h.logger.LogError(ctx, err, "Failed to get recent activity", map[string]interface{}{
			"filter": filter,
		})
		response.Error(c, errors.WrapInternalError(err, "Failed to retrieve recent activity"))
		return
	}
	
	response.Success(c, activity)
}

// GetCategoryStats retrieves statistics for all categories
// @Summary Get category statistics
// @Description Get statistics for all categories including item counts and average prices
// @Tags dashboard
// @Accept json
// @Produce json
// @Param category_id query int false "Filter by category ID"
// @Param active query bool false "Filter by active status"
// @Success 200 {object} response.APIResponse{data=[]entities.CategoryStats}
// @Failure 400 {object} response.APIResponse
// @Failure 500 {object} response.APIResponse
// @Router /api/v1/dashboard/categories [get]
func (h *DashboardHandler) GetCategoryStats(c *gin.Context) {
	ctx := c.Request.Context()
	
	filter, err := h.parseFilter(c)
	if err != nil {
		h.logger.LogError(ctx, err, "Failed to parse dashboard filter", nil)
		response.ValidationError(c, "Invalid filter parameters", err.Error())
		return
	}
	
	stats, err := h.service.GetCategoryStats(ctx, filter)
	if err != nil {
		h.logger.LogError(ctx, err, "Failed to get category stats", map[string]interface{}{
			"filter": filter,
		})
		response.Error(c, errors.WrapInternalError(err, "Failed to retrieve category statistics"))
		return
	}
	
	response.Success(c, stats)
}

// GetPriceDistribution retrieves price distribution data
// @Summary Get price distribution
// @Description Get price distribution data showing item counts across different price ranges
// @Tags dashboard
// @Accept json
// @Produce json
// @Param active query bool false "Filter by active status"
// @Success 200 {object} response.APIResponse{data=[]entities.PriceDistribution}
// @Failure 400 {object} response.APIResponse
// @Failure 500 {object} response.APIResponse
// @Router /api/v1/dashboard/price-distribution [get]
func (h *DashboardHandler) GetPriceDistribution(c *gin.Context) {
	ctx := c.Request.Context()
	
	filter, err := h.parseFilter(c)
	if err != nil {
		h.logger.LogError(ctx, err, "Failed to parse dashboard filter", nil)
		response.ValidationError(c, "Invalid filter parameters", err.Error())
		return
	}
	
	distribution, err := h.service.GetPriceDistribution(ctx, filter)
	if err != nil {
		h.logger.LogError(ctx, err, "Failed to get price distribution", map[string]interface{}{
			"filter": filter,
		})
		response.Error(c, errors.WrapInternalError(err, "Failed to retrieve price distribution"))
		return
	}
	
	response.Success(c, distribution)
}

// GetWeeklyItemsData retrieves daily items added over a specified period
// @Summary Get weekly items data
// @Description Get daily breakdown of items added over the specified time period
// @Tags dashboard
// @Accept json
// @Produce json
// @Param days query int false "Number of days to include (default: 7)"
// @Success 200 {object} response.APIResponse{data=[]entities.WeeklyItemsData}
// @Failure 400 {object} response.APIResponse
// @Failure 500 {object} response.APIResponse
// @Router /api/v1/dashboard/weekly-items [get]
func (h *DashboardHandler) GetWeeklyItemsData(c *gin.Context) {
	ctx := c.Request.Context()
	
	filter, err := h.parseFilter(c)
	if err != nil {
		h.logger.LogError(ctx, err, "Failed to parse dashboard filter", nil)
		response.ValidationError(c, "Invalid filter parameters", err.Error())
		return
	}
	
	weeklyData, err := h.service.GetWeeklyItemsData(ctx, filter)
	if err != nil {
		h.logger.LogError(ctx, err, "Failed to get weekly items data", map[string]interface{}{
			"filter": filter,
		})
		response.Error(c, errors.WrapInternalError(err, "Failed to retrieve weekly items data"))
		return
	}
	
	response.Success(c, weeklyData)
}

// GetMenuHealthMetrics retrieves menu health and quality metrics
// @Summary Get menu health metrics
// @Description Get menu health metrics including categories without items, items without images, etc.
// @Tags dashboard
// @Accept json
// @Produce json
// @Success 200 {object} response.APIResponse{data=entities.MenuHealthMetrics}
// @Failure 500 {object} response.APIResponse
// @Router /api/v1/dashboard/health [get]
func (h *DashboardHandler) GetMenuHealthMetrics(c *gin.Context) {
	ctx := c.Request.Context()
	
	filter, err := h.parseFilter(c)
	if err != nil {
		h.logger.LogError(ctx, err, "Failed to parse dashboard filter", nil)
		response.ValidationError(c, "Invalid filter parameters", err.Error())
		return
	}
	
	metrics, err := h.service.GetMenuHealthMetrics(ctx, filter)
	if err != nil {
		h.logger.LogError(ctx, err, "Failed to get menu health metrics", map[string]interface{}{
			"filter": filter,
		})
		response.Error(c, errors.WrapInternalError(err, "Failed to retrieve menu health metrics"))
		return
	}
	
	response.Success(c, metrics)
}

// GetCompleteDashboardData retrieves all dashboard data in one call
// @Summary Get complete dashboard data
// @Description Get all dashboard data including stats, activity, category stats, price distribution, weekly data, and health metrics
// @Tags dashboard
// @Accept json
// @Produce json
// @Param days query int false "Number of days for time-based data (default: 7)"
// @Param date_from query string false "Start date for filtering (YYYY-MM-DD)"
// @Param date_to query string false "End date for filtering (YYYY-MM-DD)"
// @Param category_id query int false "Filter by category ID"
// @Param active query bool false "Filter by active status"
// @Success 200 {object} response.APIResponse{data=entities.DashboardResponse}
// @Failure 400 {object} response.APIResponse
// @Failure 500 {object} response.APIResponse
// @Router /api/v1/dashboard [get]
func (h *DashboardHandler) GetCompleteDashboardData(c *gin.Context) {
	ctx := c.Request.Context()
	
	filter, err := h.parseFilter(c)
	if err != nil {
		h.logger.LogError(ctx, err, "Failed to parse dashboard filter", nil)
		response.ValidationError(c, "Invalid filter parameters", err.Error())
		return
	}
	
	dashboardData, err := h.service.GetCompleteDashboardData(ctx, filter)
	if err != nil {
		h.logger.LogError(ctx, err, "Failed to get complete dashboard data", map[string]interface{}{
			"filter": filter,
		})
		response.Error(c, errors.WrapInternalError(err, "Failed to retrieve dashboard data"))
		return
	}
	
	response.Success(c, dashboardData)
}

// parseFilter parses query parameters into a DashboardFilter
func (h *DashboardHandler) parseFilter(c *gin.Context) (entities.DashboardFilter, error) {
	filter := entities.DashboardFilter{}
	
	// Parse days
	if daysStr := c.Query("days"); daysStr != "" {
		days, err := strconv.Atoi(daysStr)
		if err != nil {
			return filter, err
		}
		filter.Days = days
	}
	
	// Parse date_from
	if dateFromStr := c.Query("date_from"); dateFromStr != "" {
		dateFrom, err := time.Parse("2006-01-02", dateFromStr)
		if err != nil {
			return filter, err
		}
		filter.DateFrom = &dateFrom
	}
	
	// Parse date_to
	if dateToStr := c.Query("date_to"); dateToStr != "" {
		dateTo, err := time.Parse("2006-01-02", dateToStr)
		if err != nil {
			return filter, err
		}
		filter.DateTo = &dateTo
	}
	
	// Parse category_id
	if categoryIDStr := c.Query("category_id"); categoryIDStr != "" {
		categoryID, err := strconv.ParseUint(categoryIDStr, 10, 32)
		if err != nil {
			return filter, err
		}
		categoryIDUint := uint(categoryID)
		filter.CategoryID = &categoryIDUint
	}
	
	// Parse active
	if activeStr := c.Query("active"); activeStr != "" {
		active, err := strconv.ParseBool(activeStr)
		if err != nil {
			return filter, err
		}
		filter.Active = &active
	}
	
	return filter, nil
}