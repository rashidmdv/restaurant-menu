package services

import (
	"context"

	"restaurant-menu-api/internal/domain/entities"
	"restaurant-menu-api/internal/domain/repositories"
	"restaurant-menu-api/pkg/logger"
	appErrors "restaurant-menu-api/pkg/errors"
)

type MenuService interface {
	GetCompleteMenu(ctx context.Context) (*MenuResponse, error)
	GetMenuByCategory(ctx context.Context, categoryID uint) (*MenuCategoryResponse, error)
	SearchMenuItems(ctx context.Context, query string, filters SearchFilters) (*SearchResponse, error)
	GetFeaturedItems(ctx context.Context, limit int) ([]*entities.Item, error)
}

type menuService struct {
	categoryRepo    repositories.CategoryRepository
	subCategoryRepo repositories.SubCategoryRepository
	itemRepo        repositories.ItemRepository
	logger          *logger.Logger
}

type MenuResponse struct {
	Categories []*MenuCategory `json:"categories"`
	Stats      MenuStats       `json:"stats"`
}

type MenuCategory struct {
	*entities.Category
	SubCategories []*MenuSubCategory `json:"sub_categories"`
}

type MenuSubCategory struct {
	*entities.SubCategory
	Items []*entities.Item `json:"items"`
}

type MenuCategoryResponse struct {
	Category      *entities.Category    `json:"category"`
	SubCategories []*MenuSubCategory    `json:"sub_categories"`
	Stats         MenuCategoryStats     `json:"stats"`
}

type SearchResponse struct {
	Items      []*entities.Item      `json:"items"`
	Pagination *entities.Pagination  `json:"pagination,omitempty"`
	Stats      SearchStats           `json:"stats"`
}

type SearchFilters struct {
	CategoryID    *uint    `json:"category_id"`
	SubCategoryID *uint    `json:"sub_category_id"`
	MinPrice      *float64 `json:"min_price"`
	MaxPrice      *float64 `json:"max_price"`
	Available     *bool    `json:"available"`
	Limit         int      `json:"limit"`
	Offset        int      `json:"offset"`
}

type MenuStats struct {
	TotalCategories    int `json:"total_categories"`
	TotalSubCategories int `json:"total_sub_categories"`
	TotalItems         int `json:"total_items"`
	AvailableItems     int `json:"available_items"`
}

type MenuCategoryStats struct {
	TotalSubCategories int `json:"total_sub_categories"`
	TotalItems         int `json:"total_items"`
	AvailableItems     int `json:"available_items"`
}

type SearchStats struct {
	TotalResults int `json:"total_results"`
	SearchQuery  string `json:"search_query"`
}

func NewMenuService(
	categoryRepo repositories.CategoryRepository,
	subCategoryRepo repositories.SubCategoryRepository,
	itemRepo repositories.ItemRepository,
	logger *logger.Logger,
) MenuService {
	return &menuService{
		categoryRepo:    categoryRepo,
		subCategoryRepo: subCategoryRepo,
		itemRepo:        itemRepo,
		logger:          logger,
	}
}

func (s *menuService) GetCompleteMenu(ctx context.Context) (*MenuResponse, error) {
	// Get all active categories with subcategories
	categoryFilter := entities.CategoryFilter{
		Active:   boolPtr(true),
		OrderBy:  "display_order",
		OrderDir: "ASC",
	}

	categories, err := s.categoryRepo.GetAllWithSubCategories(ctx, categoryFilter)
	if err != nil {
		s.logger.LogError(ctx, err, "Failed to get categories for complete menu", nil)
		return nil, appErrors.WrapInternalError(err, "Failed to get menu categories")
	}

	menuCategories := make([]*MenuCategory, 0, len(categories))
	totalSubCategories := 0
	totalItems := 0
	availableItems := 0

	for _, category := range categories {
		menuCategory := &MenuCategory{
			Category:      category,
			SubCategories: make([]*MenuSubCategory, 0, len(category.SubCategories)),
		}

		totalSubCategories += len(category.SubCategories)

		for _, subCategory := range category.SubCategories {
			// Get items for this subcategory
			itemFilter := entities.ItemFilter{
				Available: boolPtr(true),
				OrderBy:   "display_order",
				OrderDir:  "ASC",
			}

			items, err := s.itemRepo.GetBySubCategoryID(ctx, subCategory.ID, itemFilter)
			if err != nil {
				s.logger.LogError(ctx, err, "Failed to get items for subcategory", map[string]interface{}{
					"subcategory_id": subCategory.ID,
				})
				continue
			}

			menuSubCategory := &MenuSubCategory{
				SubCategory: &subCategory,
				Items:       items,
			}

			menuCategory.SubCategories = append(menuCategory.SubCategories, menuSubCategory)
			totalItems += len(items)
			availableItems += len(items) // All items are available since we filtered for available=true
		}

		menuCategories = append(menuCategories, menuCategory)
	}

	stats := MenuStats{
		TotalCategories:    len(categories),
		TotalSubCategories: totalSubCategories,
		TotalItems:         totalItems,
		AvailableItems:     availableItems,
	}

	return &MenuResponse{
		Categories: menuCategories,
		Stats:      stats,
	}, nil
}

func (s *menuService) GetMenuByCategory(ctx context.Context, categoryID uint) (*MenuCategoryResponse, error) {
	// Get category with subcategories
	category, err := s.categoryRepo.GetWithSubCategories(ctx, categoryID)
	if err != nil {
		s.logger.LogError(ctx, err, "Failed to get category", map[string]interface{}{
			"category_id": categoryID,
		})
		return nil, appErrors.WrapInternalError(err, "Failed to get category")
	}

	if category == nil {
		return nil, appErrors.NewNotFoundError("Category")
	}

	menuSubCategories := make([]*MenuSubCategory, 0, len(category.SubCategories))
	totalItems := 0
	availableItems := 0

	for _, subCategory := range category.SubCategories {
		// Get items for this subcategory
		itemFilter := entities.ItemFilter{
			OrderBy:  "display_order",
			OrderDir: "ASC",
		}

		items, err := s.itemRepo.GetBySubCategoryID(ctx, subCategory.ID, itemFilter)
		if err != nil {
			s.logger.LogError(ctx, err, "Failed to get items for subcategory", map[string]interface{}{
				"subcategory_id": subCategory.ID,
			})
			continue
		}

		menuSubCategory := &MenuSubCategory{
			SubCategory: &subCategory,
			Items:       items,
		}

		menuSubCategories = append(menuSubCategories, menuSubCategory)
		totalItems += len(items)

		// Count available items
		for _, item := range items {
			if item.Available {
				availableItems++
			}
		}
	}

	stats := MenuCategoryStats{
		TotalSubCategories: len(category.SubCategories),
		TotalItems:         totalItems,
		AvailableItems:     availableItems,
	}

	return &MenuCategoryResponse{
		Category:      category,
		SubCategories: menuSubCategories,
		Stats:         stats,
	}, nil
}

func (s *menuService) SearchMenuItems(ctx context.Context, query string, filters SearchFilters) (*SearchResponse, error) {
	if query == "" {
		return nil, appErrors.NewBadRequestError("Search query is required", "")
	}

	itemFilter := entities.ItemFilter{
		CategoryID:    filters.CategoryID,
		SubCategoryID: filters.SubCategoryID,
		Available:     filters.Available,
		MinPrice:      filters.MinPrice,
		MaxPrice:      filters.MaxPrice,
		Limit:         filters.Limit,
		Offset:        filters.Offset,
		IncludeCount:  true,
	}

	if itemFilter.Limit == 0 {
		itemFilter.Limit = 20 // Default limit
	}

	items, pagination, err := s.itemRepo.Search(ctx, query, itemFilter)
	if err != nil {
		s.logger.LogError(ctx, err, "Failed to search menu items", map[string]interface{}{
			"search_query": query,
			"filters":      filters,
		})
		return nil, appErrors.WrapInternalError(err, "Failed to search menu items")
	}

	stats := SearchStats{
		TotalResults: int(pagination.Total),
		SearchQuery:  query,
	}

	return &SearchResponse{
		Items:      items,
		Pagination: pagination,
		Stats:      stats,
	}, nil
}

func (s *menuService) GetFeaturedItems(ctx context.Context, limit int) ([]*entities.Item, error) {
	if limit <= 0 {
		limit = 10
	}

	items, err := s.itemRepo.GetFeatured(ctx, limit)
	if err != nil {
		s.logger.LogError(ctx, err, "Failed to get featured items", map[string]interface{}{
			"limit": limit,
		})
		return nil, appErrors.WrapInternalError(err, "Failed to get featured items")
	}

	return items, nil
}

// Helper function
func boolPtr(b bool) *bool {
	return &b
}