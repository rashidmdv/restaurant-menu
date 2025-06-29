package database

import (
	"context"
	"errors"
	"strings"

	"gorm.io/gorm"

	"restaurant-menu-api/internal/domain/entities"
	"restaurant-menu-api/internal/domain/repositories"
)

type subCategoryRepository struct {
	db *gorm.DB
}

func NewSubCategoryRepository(db *gorm.DB) repositories.SubCategoryRepository {
	return &subCategoryRepository{db: db}
}

func (r *subCategoryRepository) Create(ctx context.Context, subcategory *entities.SubCategory) error {
	return r.db.WithContext(ctx).Create(subcategory).Error
}

func (r *subCategoryRepository) GetByID(ctx context.Context, id uint) (*entities.SubCategory, error) {
	var subcategory entities.SubCategory
	err := r.db.WithContext(ctx).Preload("Category").First(&subcategory, id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &subcategory, nil
}

func (r *subCategoryRepository) GetBySlug(ctx context.Context, slug string) (*entities.SubCategory, error) {
	var subcategory entities.SubCategory
	err := r.db.WithContext(ctx).Preload("Category").Where("slug = ?", slug).First(&subcategory).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &subcategory, nil
}

func (r *subCategoryRepository) GetAll(ctx context.Context, filter entities.SubCategoryFilter) ([]*entities.SubCategory, *entities.Pagination, error) {
	var subcategories []*entities.SubCategory
	var total int64

	query := r.db.WithContext(ctx).Model(&entities.SubCategory{}).Preload("Category")

	// Apply filters
	if filter.CategoryID != nil {
		query = query.Where("category_id = ?", *filter.CategoryID)
	}

	if filter.Active != nil {
		query = query.Where("active = ?", *filter.Active)
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

	if err := query.Find(&subcategories).Error; err != nil {
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

	return subcategories, pagination, nil
}

func (r *subCategoryRepository) GetByCategoryID(ctx context.Context, categoryID uint, filter entities.SubCategoryFilter) ([]*entities.SubCategory, error) {
	var subcategories []*entities.SubCategory

	query := r.db.WithContext(ctx).Where("category_id = ?", categoryID)

	if filter.Active != nil {
		query = query.Where("active = ?", *filter.Active)
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

	if err := query.Find(&subcategories).Error; err != nil {
		return nil, err
	}

	return subcategories, nil
}

func (r *subCategoryRepository) Update(ctx context.Context, subcategory *entities.SubCategory) error {
	return r.db.WithContext(ctx).Save(subcategory).Error
}

func (r *subCategoryRepository) Delete(ctx context.Context, id uint) error {
	return r.db.WithContext(ctx).Delete(&entities.SubCategory{}, id).Error
}

func (r *subCategoryRepository) GetWithItems(ctx context.Context, id uint) (*entities.SubCategory, error) {
	var subcategory entities.SubCategory
	err := r.db.WithContext(ctx).
		Preload("Category").
		Preload("Items", "available = ?", true).
		First(&subcategory, id).Error
	
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &subcategory, nil
}

func (r *subCategoryRepository) GetAllWithItems(ctx context.Context, filter entities.SubCategoryFilter) ([]*entities.SubCategory, error) {
	var subcategories []*entities.SubCategory

	query := r.db.WithContext(ctx).
		Preload("Category").
		Preload("Items", "available = ?", true)

	// Apply filters
	if filter.CategoryID != nil {
		query = query.Where("category_id = ?", *filter.CategoryID)
	}

	if filter.Active != nil {
		query = query.Where("active = ?", *filter.Active)
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

	if err := query.Find(&subcategories).Error; err != nil {
		return nil, err
	}

	return subcategories, nil
}

func (r *subCategoryRepository) Count(ctx context.Context, filter entities.SubCategoryFilter) (int64, error) {
	var count int64
	query := r.db.WithContext(ctx).Model(&entities.SubCategory{})

	if filter.CategoryID != nil {
		query = query.Where("category_id = ?", *filter.CategoryID)
	}

	if filter.Active != nil {
		query = query.Where("active = ?", *filter.Active)
	}

	if filter.Search != "" {
		search := "%" + strings.ToLower(filter.Search) + "%"
		query = query.Where("LOWER(name) LIKE ? OR LOWER(description) LIKE ?", search, search)
	}

	return count, query.Count(&count).Error
}

func (r *subCategoryRepository) UpdateDisplayOrder(ctx context.Context, id uint, order int) error {
	return r.db.WithContext(ctx).
		Model(&entities.SubCategory{}).
		Where("id = ?", id).
		Update("display_order", order).Error
}

func (r *subCategoryRepository) ToggleActive(ctx context.Context, id uint) error {
	return r.db.WithContext(ctx).
		Model(&entities.SubCategory{}).
		Where("id = ?", id).
		Update("active", gorm.Expr("NOT active")).Error
}