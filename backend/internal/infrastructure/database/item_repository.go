package database

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"gorm.io/gorm"

	"restaurant-menu-api/internal/domain/entities"
	"restaurant-menu-api/internal/domain/repositories"
)

type itemRepository struct {
	db *gorm.DB
}

func NewItemRepository(db *gorm.DB) repositories.ItemRepository {
	return &itemRepository{db: db}
}

func (r *itemRepository) Create(ctx context.Context, item *entities.Item) error {
	return r.db.WithContext(ctx).Create(item).Error
}

func (r *itemRepository) GetByID(ctx context.Context, id uint) (*entities.Item, error) {
	var item entities.Item
	err := r.db.WithContext(ctx).
		Preload("SubCategory").
		Preload("SubCategory.Category").
		First(&item, id).Error
	
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &item, nil
}

func (r *itemRepository) GetAll(ctx context.Context, filter entities.ItemFilter) ([]*entities.Item, *entities.Pagination, error) {
	var items []*entities.Item
	var total int64

	query := r.db.WithContext(ctx).Model(&entities.Item{}).
		Preload("SubCategory").
		Preload("SubCategory.Category")

	// Apply filters
	if filter.SubCategoryID != nil {
		query = query.Where("sub_category_id = ?", *filter.SubCategoryID)
	}

	if filter.CategoryID != nil {
		query = query.Joins("JOIN sub_categories ON items.sub_category_id = sub_categories.id").
			Where("sub_categories.category_id = ?", *filter.CategoryID)
	}

	if filter.Available != nil {
		query = query.Where("available = ?", *filter.Available)
	}

	if filter.MinPrice != nil {
		query = query.Where("price >= ?", *filter.MinPrice)
	}

	if filter.MaxPrice != nil {
		query = query.Where("price <= ?", *filter.MaxPrice)
	}

	if filter.Search != "" {
		search := "%" + strings.ToLower(filter.Search) + "%"
		query = query.Where("LOWER(name) LIKE ? OR LOWER(description) LIKE ?", search, search)
	}

	// Count total records
	if err := query.Count(&total).Error; err != nil {
		return nil, nil, err
	}

	// Apply pagination
	if filter.Limit > 0 {
		query = query.Limit(filter.Limit)
	}
	if filter.Offset > 0 {
		query = query.Offset(filter.Offset)
	}

	// Apply ordering
	orderBy := "display_order ASC, created_at DESC"
	if filter.OrderBy != "" {
		direction := "ASC"
		if filter.OrderDir != "" && strings.ToUpper(filter.OrderDir) == "DESC" {
			direction = "DESC"
		}
		orderBy = filter.OrderBy + " " + direction
	}
	query = query.Order(orderBy)

	if err := query.Find(&items).Error; err != nil {
		return nil, nil, err
	}

	var pagination *entities.Pagination
	if filter.IncludeCount {
		page := (filter.Offset / filter.Limit) + 1
		if filter.Limit == 0 {
			page = 1
		}
		pagination = entities.NewPagination(page, filter.Limit, total)
	}

	return items, pagination, nil
}

func (r *itemRepository) GetBySubCategoryID(ctx context.Context, subCategoryID uint, filter entities.ItemFilter) ([]*entities.Item, error) {
	var items []*entities.Item

	query := r.db.WithContext(ctx).
		Where("sub_category_id = ?", subCategoryID).
		Preload("SubCategory").
		Preload("SubCategory.Category")

	if filter.Available != nil {
		query = query.Where("available = ?", *filter.Available)
	}

	if filter.MinPrice != nil {
		query = query.Where("price >= ?", *filter.MinPrice)
	}

	if filter.MaxPrice != nil {
		query = query.Where("price <= ?", *filter.MaxPrice)
	}

	if filter.Search != "" {
		search := "%" + strings.ToLower(filter.Search) + "%"
		query = query.Where("LOWER(name) LIKE ? OR LOWER(description) LIKE ?", search, search)
	}

	// Apply ordering
	orderBy := "display_order ASC, created_at DESC"
	if filter.OrderBy != "" {
		direction := "ASC"
		if filter.OrderDir != "" && strings.ToUpper(filter.OrderDir) == "DESC" {
			direction = "DESC"
		}
		orderBy = filter.OrderBy + " " + direction
	}
	query = query.Order(orderBy)

	if err := query.Find(&items).Error; err != nil {
		return nil, err
	}

	return items, nil
}

func (r *itemRepository) GetByCategoryID(ctx context.Context, categoryID uint, filter entities.ItemFilter) ([]*entities.Item, error) {
	var items []*entities.Item

	query := r.db.WithContext(ctx).
		Joins("JOIN sub_categories ON items.sub_category_id = sub_categories.id").
		Where("sub_categories.category_id = ?", categoryID).
		Preload("SubCategory").
		Preload("SubCategory.Category")

	if filter.Available != nil {
		query = query.Where("items.available = ?", *filter.Available)
	}

	if filter.MinPrice != nil {
		query = query.Where("items.price >= ?", *filter.MinPrice)
	}

	if filter.MaxPrice != nil {
		query = query.Where("items.price <= ?", *filter.MaxPrice)
	}

	if filter.Search != "" {
		search := "%" + strings.ToLower(filter.Search) + "%"
		query = query.Where("LOWER(items.name) LIKE ? OR LOWER(items.description) LIKE ?", search, search)
	}

	// Apply ordering
	orderBy := "items.display_order ASC, items.created_at DESC"
	if filter.OrderBy != "" {
		direction := "ASC"
		if filter.OrderDir != "" && strings.ToUpper(filter.OrderDir) == "DESC" {
			direction = "DESC"
		}
		orderBy = "items." + filter.OrderBy + " " + direction
	}
	query = query.Order(orderBy)

	if err := query.Find(&items).Error; err != nil {
		return nil, err
	}

	return items, nil
}

func (r *itemRepository) Update(ctx context.Context, item *entities.Item) error {
	return r.db.WithContext(ctx).Save(item).Error
}

func (r *itemRepository) Delete(ctx context.Context, id uint) error {
	return r.db.WithContext(ctx).Delete(&entities.Item{}, id).Error
}

func (r *itemRepository) Search(ctx context.Context, query string, filter entities.ItemFilter) ([]*entities.Item, *entities.Pagination, error) {
	var items []*entities.Item
	var total int64

	search := "%" + strings.ToLower(query) + "%"
	
	dbQuery := r.db.WithContext(ctx).Model(&entities.Item{}).
		Preload("SubCategory").
		Preload("SubCategory.Category").
		Where("LOWER(name) LIKE ? OR LOWER(description) LIKE ?", search, search)

	// Apply additional filters
	if filter.SubCategoryID != nil {
		dbQuery = dbQuery.Where("sub_category_id = ?", *filter.SubCategoryID)
	}

	if filter.CategoryID != nil {
		dbQuery = dbQuery.Joins("JOIN sub_categories ON items.sub_category_id = sub_categories.id").
			Where("sub_categories.category_id = ?", *filter.CategoryID)
	}

	if filter.Available != nil {
		dbQuery = dbQuery.Where("available = ?", *filter.Available)
	}

	if filter.MinPrice != nil {
		dbQuery = dbQuery.Where("price >= ?", *filter.MinPrice)
	}

	if filter.MaxPrice != nil {
		dbQuery = dbQuery.Where("price <= ?", *filter.MaxPrice)
	}

	// Count total records
	if err := dbQuery.Count(&total).Error; err != nil {
		return nil, nil, err
	}

	// Apply pagination
	if filter.Limit > 0 {
		dbQuery = dbQuery.Limit(filter.Limit)
	}
	if filter.Offset > 0 {
		dbQuery = dbQuery.Offset(filter.Offset)
	}

	// Apply ordering with relevance (exact match first, then partial matches)
	orderBy := fmt.Sprintf("CASE WHEN LOWER(name) = LOWER('%s') THEN 1 WHEN LOWER(name) LIKE '%s' THEN 2 ELSE 3 END, display_order ASC", 
		strings.ToLower(query), search)
	dbQuery = dbQuery.Order(orderBy)

	if err := dbQuery.Find(&items).Error; err != nil {
		return nil, nil, err
	}

	var pagination *entities.Pagination
	if filter.IncludeCount {
		page := (filter.Offset / filter.Limit) + 1
		if filter.Limit == 0 {
			page = 1
		}
		pagination = entities.NewPagination(page, filter.Limit, total)
	}

	return items, pagination, nil
}

func (r *itemRepository) Count(ctx context.Context, filter entities.ItemFilter) (int64, error) {
	var count int64
	query := r.db.WithContext(ctx).Model(&entities.Item{})

	if filter.SubCategoryID != nil {
		query = query.Where("sub_category_id = ?", *filter.SubCategoryID)
	}

	if filter.CategoryID != nil {
		query = query.Joins("JOIN sub_categories ON items.sub_category_id = sub_categories.id").
			Where("sub_categories.category_id = ?", *filter.CategoryID)
	}

	if filter.Available != nil {
		query = query.Where("available = ?", *filter.Available)
	}

	if filter.MinPrice != nil {
		query = query.Where("price >= ?", *filter.MinPrice)
	}

	if filter.MaxPrice != nil {
		query = query.Where("price <= ?", *filter.MaxPrice)
	}

	if filter.Search != "" {
		search := "%" + strings.ToLower(filter.Search) + "%"
		query = query.Where("LOWER(name) LIKE ? OR LOWER(description) LIKE ?", search, search)
	}

	return count, query.Count(&count).Error
}

func (r *itemRepository) UpdateDisplayOrder(ctx context.Context, id uint, order int) error {
	return r.db.WithContext(ctx).
		Model(&entities.Item{}).
		Where("id = ?", id).
		Update("display_order", order).Error
}

func (r *itemRepository) ToggleAvailable(ctx context.Context, id uint) error {
	return r.db.WithContext(ctx).
		Model(&entities.Item{}).
		Where("id = ?", id).
		Update("available", gorm.Expr("NOT available")).Error
}

func (r *itemRepository) UpdatePrice(ctx context.Context, id uint, price float64) error {
	return r.db.WithContext(ctx).
		Model(&entities.Item{}).
		Where("id = ?", id).
		Update("price", price).Error
}

func (r *itemRepository) GetFeatured(ctx context.Context, limit int) ([]*entities.Item, error) {
	var items []*entities.Item

	if limit <= 0 {
		limit = 10
	}

	query := r.db.WithContext(ctx).
		Where("available = ? AND image_url != ''", true).
		Preload("SubCategory").
		Preload("SubCategory.Category").
		Order("RANDOM()").  // PostgreSQL random ordering
		Limit(limit)

	if err := query.Find(&items).Error; err != nil {
		return nil, err
	}

	return items, nil
}