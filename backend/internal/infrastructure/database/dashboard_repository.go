package database

import (
	"context"
	"fmt"
	"math"
	"time"

	"gorm.io/gorm"

	"restaurant-menu-api/internal/domain/entities"
	"restaurant-menu-api/internal/domain/repositories"
	"restaurant-menu-api/pkg/logger"
)

type dashboardRepository struct {
	db     *gorm.DB
	logger *logger.Logger
}

// NewDashboardRepository creates a new dashboard repository instance
func NewDashboardRepository(db *gorm.DB, logger *logger.Logger) repositories.DashboardRepository {
	return &dashboardRepository{
		db:     db,
		logger: logger,
	}
}

func (r *dashboardRepository) GetDashboardStats(ctx context.Context, filter entities.DashboardFilter) (*entities.DashboardStats, error) {
	stats := &entities.DashboardStats{}
	
	// Get basic counts
	var totalCategories, totalSubCategories, totalItems, availableItems int64
	
	if err := r.db.WithContext(ctx).Model(&entities.Category{}).Count(&totalCategories).Error; err != nil {
		return nil, fmt.Errorf("failed to count categories: %w", err)
	}
	stats.TotalCategories = int(totalCategories)
	
	if err := r.db.WithContext(ctx).Model(&entities.SubCategory{}).Count(&totalSubCategories).Error; err != nil {
		return nil, fmt.Errorf("failed to count subcategories: %w", err)
	}
	stats.TotalSubCategories = int(totalSubCategories)
	
	if err := r.db.WithContext(ctx).Model(&entities.Item{}).Count(&totalItems).Error; err != nil {
		return nil, fmt.Errorf("failed to count items: %w", err)
	}
	stats.TotalItems = int(totalItems)
	
	// Get available items count
	if err := r.db.WithContext(ctx).Model(&entities.Item{}).Where("available = ?", true).Count(&availableItems).Error; err != nil {
		return nil, fmt.Errorf("failed to count available items: %w", err)
	}
	stats.AvailableItems = int(availableItems)
	stats.UnavailableItems = stats.TotalItems - stats.AvailableItems
	
	// Calculate average price
	var avgPrice *float64
	if err := r.db.WithContext(ctx).Model(&entities.Item{}).Select("AVG(price)").Where("price > 0").Scan(&avgPrice).Error; err != nil {
		return nil, fmt.Errorf("failed to calculate average price: %w", err)
	}
	if avgPrice != nil {
		stats.AveragePrice = math.Round(*avgPrice*100) / 100
	}
	
	// Get recent items count (last 7 days by default)
	days := filter.Days
	if days == 0 {
		days = 7
	}
	
	since := time.Now().AddDate(0, 0, -days)
	if filter.DateFrom != nil {
		since = *filter.DateFrom
	}
	
	var recentItemsCount, recentCategoriesCount int64
	if err := r.db.WithContext(ctx).Model(&entities.Item{}).Where("created_at >= ?", since).Count(&recentItemsCount).Error; err != nil {
		return nil, fmt.Errorf("failed to count recent items: %w", err)
	}
	stats.RecentItemsCount = int(recentItemsCount)
	
	if err := r.db.WithContext(ctx).Model(&entities.Category{}).Where("created_at >= ?", since).Count(&recentCategoriesCount).Error; err != nil {
		return nil, fmt.Errorf("failed to count recent categories: %w", err)
	}
	stats.RecentCategoriesCount = int(recentCategoriesCount)
	
	return stats, nil
}

func (r *dashboardRepository) GetRecentActivity(ctx context.Context, filter entities.DashboardFilter) ([]entities.RecentActivity, error) {
	var activities []entities.RecentActivity
	
	// Items activity
	var items []entities.Item
	query := r.db.WithContext(ctx).Model(&entities.Item{}).Select("id, name, created_at, updated_at").Order("created_at DESC").Limit(10)
	
	if filter.DateFrom != nil {
		query = query.Where("created_at >= ?", *filter.DateFrom)
	}
	
	if err := query.Find(&items).Error; err != nil {
		return nil, fmt.Errorf("failed to get recent items: %w", err)
	}
	
	for _, item := range items {
		activities = append(activities, entities.RecentActivity{
			ID:        item.ID,
			Type:      entities.ActivityTypeItem,
			Name:      item.Name,
			Action:    entities.ActionTypeCreated,
			CreatedAt: item.CreatedAt,
			UpdatedAt: item.UpdatedAt,
		})
	}
	
	// Categories activity
	var categories []entities.Category
	categoryQuery := r.db.WithContext(ctx).Model(&entities.Category{}).Select("id, name, created_at, updated_at").Order("created_at DESC").Limit(5)
	
	if filter.DateFrom != nil {
		categoryQuery = categoryQuery.Where("created_at >= ?", *filter.DateFrom)
	}
	
	if err := categoryQuery.Find(&categories).Error; err != nil {
		return nil, fmt.Errorf("failed to get recent categories: %w", err)
	}
	
	for _, category := range categories {
		activities = append(activities, entities.RecentActivity{
			ID:        category.ID,
			Type:      entities.ActivityTypeCategory,
			Name:      category.Name,
			Action:    entities.ActionTypeCreated,
			CreatedAt: category.CreatedAt,
			UpdatedAt: category.UpdatedAt,
		})
	}
	
	return activities, nil
}

func (r *dashboardRepository) GetCategoryStats(ctx context.Context, filter entities.DashboardFilter) ([]entities.CategoryStats, error) {
	var stats []entities.CategoryStats
	
	query := `
		SELECT 
			c.id,
			c.name,
			COALESCE(item_stats.item_count, 0) as item_count,
			COALESCE(item_stats.available_items, 0) as available_items,
			COALESCE(item_stats.average_price, 0) as average_price
		FROM categories c
		LEFT JOIN (
			SELECT 
				sc.category_id,
				COUNT(i.id) as item_count,
				COUNT(CASE WHEN i.available = true THEN 1 END) as available_items,
				COALESCE(AVG(CASE WHEN i.price > 0 THEN i.price END), 0) as average_price
			FROM sub_categories sc
			LEFT JOIN items i ON i.sub_category_id = sc.id
			WHERE sc.deleted_at IS NULL AND (i.deleted_at IS NULL OR i.deleted_at IS NOT NULL)
			GROUP BY sc.category_id
		) item_stats ON item_stats.category_id = c.id
		WHERE c.deleted_at IS NULL
		ORDER BY item_count DESC
	`
	
	if err := r.db.WithContext(ctx).Raw(query).Scan(&stats).Error; err != nil {
		return nil, fmt.Errorf("failed to get category stats: %w", err)
	}
	
	// Round average prices
	for i := range stats {
		stats[i].AveragePrice = math.Round(stats[i].AveragePrice*100) / 100
	}
	
	return stats, nil
}

func (r *dashboardRepository) GetPriceDistribution(ctx context.Context, filter entities.DashboardFilter) ([]entities.PriceDistribution, error) {
	// Define price ranges
	ranges := []entities.PriceRange{
		{Min: 0, Max: 25, Label: "0-25 AED"},
		{Min: 25, Max: 50, Label: "25-50 AED"},
		{Min: 50, Max: 100, Label: "50-100 AED"},
		{Min: 100, Max: 200, Label: "100-200 AED"},
		{Min: 200, Max: math.Inf(1), Label: "200+ AED"},
	}
	
	var totalItems int64
	if err := r.db.WithContext(ctx).Model(&entities.Item{}).Where("price > 0").Count(&totalItems).Error; err != nil {
		return nil, fmt.Errorf("failed to count total items: %w", err)
	}
	
	if totalItems == 0 {
		return []entities.PriceDistribution{}, nil
	}
	
	var distribution []entities.PriceDistribution
	
	for _, priceRange := range ranges {
		var count int64
		query := r.db.WithContext(ctx).Model(&entities.Item{}).Where("price >= ? AND price > 0", priceRange.Min)
		
		if !math.IsInf(priceRange.Max, 1) {
			query = query.Where("price < ?", priceRange.Max)
		}
		
		if err := query.Count(&count).Error; err != nil {
			return nil, fmt.Errorf("failed to count items in price range %s: %w", priceRange.Label, err)
		}
		
		if count > 0 {
			percentage := math.Round(float64(count)/float64(totalItems)*100*100) / 100
			distribution = append(distribution, entities.PriceDistribution{
				Range:      priceRange.Label,
				Count:      int(count),
				Percentage: percentage,
			})
		}
	}
	
	return distribution, nil
}

func (r *dashboardRepository) GetWeeklyItemsData(ctx context.Context, filter entities.DashboardFilter) ([]entities.WeeklyItemsData, error) {
	days := filter.Days
	if days == 0 {
		days = 7
	}
	
	var weeklyData []entities.WeeklyItemsData
	
	// Generate date range
	today := time.Now()
	for i := days - 1; i >= 0; i-- {
		date := today.AddDate(0, 0, -i)
		dayStart := time.Date(date.Year(), date.Month(), date.Day(), 0, 0, 0, 0, date.Location())
		dayEnd := dayStart.Add(24 * time.Hour)
		
		var count int64
		if err := r.db.WithContext(ctx).Model(&entities.Item{}).Where("created_at >= ? AND created_at < ?", dayStart, dayEnd).Count(&count).Error; err != nil {
			return nil, fmt.Errorf("failed to count items for date %s: %w", date.Format("2006-01-02"), err)
		}
		
		weeklyData = append(weeklyData, entities.WeeklyItemsData{
			Date:  dayStart,
			Day:   date.Format("Mon"),
			Count: int(count),
		})
	}
	
	return weeklyData, nil
}

func (r *dashboardRepository) GetMenuHealthMetrics(ctx context.Context, filter entities.DashboardFilter) (*entities.MenuHealthMetrics, error) {
	metrics := &entities.MenuHealthMetrics{}
	
	// Categories without items
	var categoriesWithoutItems int64
	query := `
		SELECT COUNT(DISTINCT c.id)
		FROM categories c
		LEFT JOIN sub_categories sc ON sc.category_id = c.id AND sc.deleted_at IS NULL
		LEFT JOIN items i ON i.sub_category_id = sc.id AND i.deleted_at IS NULL
		WHERE c.deleted_at IS NULL AND i.id IS NULL
	`
	if err := r.db.WithContext(ctx).Raw(query).Scan(&categoriesWithoutItems).Error; err != nil {
		return nil, fmt.Errorf("failed to count categories without items: %w", err)
	}
	metrics.CategoriesWithoutItems = int(categoriesWithoutItems)
	
	// Subcategories without items
	var subcategoriesWithoutItems int64
	subQuery := `
		SELECT COUNT(sc.id)
		FROM sub_categories sc
		LEFT JOIN items i ON i.sub_category_id = sc.id AND i.deleted_at IS NULL
		WHERE sc.deleted_at IS NULL AND i.id IS NULL
	`
	if err := r.db.WithContext(ctx).Raw(subQuery).Scan(&subcategoriesWithoutItems).Error; err != nil {
		return nil, fmt.Errorf("failed to count subcategories without items: %w", err)
	}
	metrics.SubCategoriesWithoutItems = int(subcategoriesWithoutItems)
	
	// Items without images
	var itemsWithoutImages int64
	if err := r.db.WithContext(ctx).Model(&entities.Item{}).Where("(image_url = '' OR image_url IS NULL)").Count(&itemsWithoutImages).Error; err != nil {
		return nil, fmt.Errorf("failed to count items without images: %w", err)
	}
	metrics.ItemsWithoutImages = int(itemsWithoutImages)
	
	// Items without description
	var itemsWithoutDescription int64
	if err := r.db.WithContext(ctx).Model(&entities.Item{}).Where("(description = '' OR description IS NULL)").Count(&itemsWithoutDescription).Error; err != nil {
		return nil, fmt.Errorf("failed to count items without description: %w", err)
	}
	metrics.ItemsWithoutDescription = int(itemsWithoutDescription)
	
	// Availability stats
	var totalItems, availableItems int64
	if err := r.db.WithContext(ctx).Model(&entities.Item{}).Count(&totalItems).Error; err != nil {
		return nil, fmt.Errorf("failed to count total items: %w", err)
	}
	
	if err := r.db.WithContext(ctx).Model(&entities.Item{}).Where("available = ?", true).Count(&availableItems).Error; err != nil {
		return nil, fmt.Errorf("failed to count available items: %w", err)
	}
	
	metrics.AvailabilityStats = entities.AvailabilityStats{
		TotalItems:       int(totalItems),
		AvailableItems:   int(availableItems),
		UnavailableItems: int(totalItems - availableItems),
	}
	
	if totalItems > 0 {
		metrics.AvailabilityStats.AvailabilityRate = math.Round(float64(availableItems)/float64(totalItems)*100*100) / 100
	}
	
	// Get price distribution for health metrics
	priceDistribution, err := r.GetPriceDistribution(ctx, filter)
	if err != nil {
		return nil, fmt.Errorf("failed to get price distribution: %w", err)
	}
	metrics.PriceRangeStats = priceDistribution
	
	return metrics, nil
}

func (r *dashboardRepository) GetCompleteDashboardData(ctx context.Context, filter entities.DashboardFilter) (*entities.DashboardResponse, error) {
	response := &entities.DashboardResponse{}
	
	// Get all dashboard data concurrently for better performance
	type result struct {
		stats            *entities.DashboardStats
		recentActivity   []entities.RecentActivity
		categoryStats    []entities.CategoryStats
		priceDistribution []entities.PriceDistribution
		weeklyData       []entities.WeeklyItemsData
		menuHealth       *entities.MenuHealthMetrics
		err              error
	}
	
	resultChan := make(chan result, 1)
	
	go func() {
		var res result
		
		// Get stats
		res.stats, res.err = r.GetDashboardStats(ctx, filter)
		if res.err != nil {
			resultChan <- res
			return
		}
		
		// Get recent activity
		res.recentActivity, res.err = r.GetRecentActivity(ctx, filter)
		if res.err != nil {
			resultChan <- res
			return
		}
		
		// Get category stats
		res.categoryStats, res.err = r.GetCategoryStats(ctx, filter)
		if res.err != nil {
			resultChan <- res
			return
		}
		
		// Get price distribution
		res.priceDistribution, res.err = r.GetPriceDistribution(ctx, filter)
		if res.err != nil {
			resultChan <- res
			return
		}
		
		// Get weekly data
		res.weeklyData, res.err = r.GetWeeklyItemsData(ctx, filter)
		if res.err != nil {
			resultChan <- res
			return
		}
		
		// Get menu health
		res.menuHealth, res.err = r.GetMenuHealthMetrics(ctx, filter)
		if res.err != nil {
			resultChan <- res
			return
		}
		
		resultChan <- res
	}()
	
	res := <-resultChan
	if res.err != nil {
		return nil, res.err
	}
	
	response.Stats = *res.stats
	response.RecentActivity = res.recentActivity
	response.CategoryStats = res.categoryStats
	response.PriceDistribution = res.priceDistribution
	response.WeeklyData = res.weeklyData
	response.MenuHealth = *res.menuHealth
	
	return response, nil
}