package services

import (
	"context"

	"restaurant-menu-api/internal/domain/entities"
	"restaurant-menu-api/internal/domain/repositories"
	"restaurant-menu-api/pkg/logger"
)

// DashboardService defines the interface for dashboard business logic
type DashboardService interface {
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

// dashboardService implements DashboardService interface
type dashboardService struct {
	dashboardRepo repositories.DashboardRepository
	logger        *logger.Logger
}

// NewDashboardService creates a new dashboard service instance
func NewDashboardService(dashboardRepo repositories.DashboardRepository, logger *logger.Logger) DashboardService {
	return &dashboardService{
		dashboardRepo: dashboardRepo,
		logger:        logger,
	}
}

func (s *dashboardService) GetDashboardStats(ctx context.Context, filter entities.DashboardFilter) (*entities.DashboardStats, error) {
	s.logger.LogInfo(ctx, "Getting dashboard stats", map[string]interface{}{
		"filter": filter,
	})
	
	// Apply default filter values
	if filter.Days == 0 {
		filter.Days = 7
	}
	
	stats, err := s.dashboardRepo.GetDashboardStats(ctx, filter)
	if err != nil {
		s.logger.LogError(ctx, err, "Failed to get dashboard stats", map[string]interface{}{
			"filter": filter,
		})
		return nil, err
	}
	
	return stats, nil
}

func (s *dashboardService) GetRecentActivity(ctx context.Context, filter entities.DashboardFilter) ([]entities.RecentActivity, error) {
	s.logger.LogInfo(ctx, "Getting recent activity", map[string]interface{}{
		"filter": filter,
	})
	
	activity, err := s.dashboardRepo.GetRecentActivity(ctx, filter)
	if err != nil {
		s.logger.LogError(ctx, err, "Failed to get recent activity", map[string]interface{}{
			"filter": filter,
		})
		return nil, err
	}
	
	return activity, nil
}

func (s *dashboardService) GetCategoryStats(ctx context.Context, filter entities.DashboardFilter) ([]entities.CategoryStats, error) {
	s.logger.LogInfo(ctx, "Getting category stats", map[string]interface{}{
		"filter": filter,
	})
	
	stats, err := s.dashboardRepo.GetCategoryStats(ctx, filter)
	if err != nil {
		s.logger.LogError(ctx, err, "Failed to get category stats", map[string]interface{}{
			"filter": filter,
		})
		return nil, err
	}
	
	return stats, nil
}

func (s *dashboardService) GetPriceDistribution(ctx context.Context, filter entities.DashboardFilter) ([]entities.PriceDistribution, error) {
	s.logger.LogInfo(ctx, "Getting price distribution", map[string]interface{}{
		"filter": filter,
	})
	
	distribution, err := s.dashboardRepo.GetPriceDistribution(ctx, filter)
	if err != nil {
		s.logger.LogError(ctx, err, "Failed to get price distribution", map[string]interface{}{
			"filter": filter,
		})
		return nil, err
	}
	
	return distribution, nil
}

func (s *dashboardService) GetWeeklyItemsData(ctx context.Context, filter entities.DashboardFilter) ([]entities.WeeklyItemsData, error) {
	s.logger.LogInfo(ctx, "Getting weekly items data", map[string]interface{}{
		"filter": filter,
	})
	
	// Apply default filter values
	if filter.Days == 0 {
		filter.Days = 7
	}
	
	weeklyData, err := s.dashboardRepo.GetWeeklyItemsData(ctx, filter)
	if err != nil {
		s.logger.LogError(ctx, err, "Failed to get weekly items data", map[string]interface{}{
			"filter": filter,
		})
		return nil, err
	}
	
	return weeklyData, nil
}

func (s *dashboardService) GetMenuHealthMetrics(ctx context.Context, filter entities.DashboardFilter) (*entities.MenuHealthMetrics, error) {
	s.logger.LogInfo(ctx, "Getting menu health metrics", map[string]interface{}{
		"filter": filter,
	})
	
	metrics, err := s.dashboardRepo.GetMenuHealthMetrics(ctx, filter)
	if err != nil {
		s.logger.LogError(ctx, err, "Failed to get menu health metrics", map[string]interface{}{
			"filter": filter,
		})
		return nil, err
	}
	
	return metrics, nil
}

func (s *dashboardService) GetCompleteDashboardData(ctx context.Context, filter entities.DashboardFilter) (*entities.DashboardResponse, error) {
	s.logger.LogInfo(ctx, "Getting complete dashboard data", map[string]interface{}{
		"filter": filter,
	})
	
	// Apply default filter values
	if filter.Days == 0 {
		filter.Days = 7
	}
	
	response, err := s.dashboardRepo.GetCompleteDashboardData(ctx, filter)
	if err != nil {
		s.logger.LogError(ctx, err, "Failed to get complete dashboard data", map[string]interface{}{
			"filter": filter,
		})
		return nil, err
	}
	
	return response, nil
}