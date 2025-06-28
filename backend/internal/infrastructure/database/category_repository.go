package database

import (
	"context"
	"errors"
	"strings"

	"gorm.io/gorm"

	"restaurant-menu-api/internal/domain/entities"
	"restaurant-menu-api/internal/domain/repositories"
)

type categoryRepository struct {
	db *gorm.DB
}

func NewCategoryRepository(db *gorm.DB) repositories.CategoryRepository {
	return &categoryRepository{db: db}
}

func (r *categoryRepository) Create(ctx context.Context, category *entities.Category) error {
	return r.db.WithContext(ctx).Create(category).Error
}

func (r *categoryRepository) GetByID(ctx context.Context, id uint) (*entities.Category, error) {
	var category entities.Category
	err := r.db.WithContext(ctx).First(&category, id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &category, nil
}

func (r *categoryRepository) GetBySlug(ctx context.Context, slug string) (*entities.Category, error) {
	var category entities.Category
	err := r.db.WithContext(ctx).Where("slug = ?", slug).First(&category).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &category, nil
}

func (r *categoryRepository) GetAll(ctx context.Context, filter entities.CategoryFilter) ([]*entities.Category, *entities.Pagination, error) {
	var categories []*entities.Category
	var total int64

	query := r.db.WithContext(ctx).Model(&entities.Category{})

	// Apply filters
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

	if err := query.Find(&categories).Error; err != nil {
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

	return categories, pagination, nil
}

func (r *categoryRepository) Update(ctx context.Context, category *entities.Category) error {
	return r.db.WithContext(ctx).Save(category).Error
}

func (r *categoryRepository) Delete(ctx context.Context, id uint) error {
	return r.db.WithContext(ctx).Delete(&entities.Category{}, id).Error
}

func (r *categoryRepository) GetWithSubCategories(ctx context.Context, id uint) (*entities.Category, error) {
	var category entities.Category
	err := r.db.WithContext(ctx).
		Preload("SubCategories", "active = ?", true).
		First(&category, id).Error
	
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &category, nil
}

func (r *categoryRepository) GetAllWithSubCategories(ctx context.Context, filter entities.CategoryFilter) ([]*entities.Category, error) {
	var categories []*entities.Category

	query := r.db.WithContext(ctx).
		Preload("SubCategories", "active = ?", true)

	// Apply filters
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

	if err := query.Find(&categories).Error; err != nil {
		return nil, err
	}

	return categories, nil
}

func (r *categoryRepository) Count(ctx context.Context, filter entities.CategoryFilter) (int64, error) {
	var count int64
	query := r.db.WithContext(ctx).Model(&entities.Category{})

	if filter.Active != nil {
		query = query.Where("active = ?", *filter.Active)
	}

	if filter.Search != "" {
		search := "%" + strings.ToLower(filter.Search) + "%"
		query = query.Where("LOWER(name) LIKE ? OR LOWER(description) LIKE ?", search, search)
	}

	return count, query.Count(&count).Error
}

func (r *categoryRepository) UpdateDisplayOrder(ctx context.Context, id uint, order int) error {
	return r.db.WithContext(ctx).
		Model(&entities.Category{}).
		Where("id = ?", id).
		Update("display_order", order).Error
}

func (r *categoryRepository) ToggleActive(ctx context.Context, id uint) error {
	return r.db.WithContext(ctx).
		Model(&entities.Category{}).
		Where("id = ?", id).
		Update("active", gorm.Expr("NOT active")).Error
}