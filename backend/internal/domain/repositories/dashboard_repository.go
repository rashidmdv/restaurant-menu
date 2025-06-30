package repositories

import (
	"context"

	"restaurant-menu-api/internal/domain/entities"
)

// DashboardRepository defines the interface for dashboard data access
type DashboardRepository interface {
	// GetDashboardStats retrieves overall dashboard statistics
	GetDashboardStats(ctx context.Context, filter entities.DashboardFilter) (*entities.DashboardStats, error)
	
	// GetRecentActivity retrieves recent activities in the system
	GetRecentActivity(ctx context.Context, filter entities.DashboardFilter) ([]entities.RecentActivity, error)
	
	// GetCategoryStats retrieves statistics for all categories
	GetCategoryStats(ctx context.Context, filter entities.DashboardFilter) ([]entities.CategoryStats, error)
	
	// GetPriceDistribution retrieves price distribution data
	GetPriceDistribution(ctx context.Context, filter entities.DashboardFilter) ([]entities.PriceDistribution, error)
	
	// GetWeeklyItemsData retrieves daily items added over a specified period
	GetWeeklyItemsData(ctx context.Context, filter entities.DashboardFilter) ([]entities.WeeklyItemsData, error)
	
	// GetMenuHealthMetrics retrieves menu health and quality metrics
	GetMenuHealthMetrics(ctx context.Context, filter entities.DashboardFilter) (*entities.MenuHealthMetrics, error)
	
	// GetCompleteDashboardData retrieves all dashboard data in one call for efficiency
	GetCompleteDashboardData(ctx context.Context, filter entities.DashboardFilter) (*entities.DashboardResponse, error)
}