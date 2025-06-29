package database

import (
	"context"
	"errors"
	"strings"

	"gorm.io/gorm"

	"restaurant-menu-api/internal/domain/entities"
	"restaurant-menu-api/internal/domain/repositories"
)

type contentRepository struct {
	db *gorm.DB
}

func NewContentRepository(db *gorm.DB) repositories.ContentRepository {
	return &contentRepository{db: db}
}

func (r *contentRepository) GetBySection(ctx context.Context, sectionName string) (*entities.ContentSection, error) {
	var content entities.ContentSection
	err := r.db.WithContext(ctx).
		Where("section_name = ?", sectionName).
		First(&content).Error
	
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &content, nil
}

func (r *contentRepository) GetAll(ctx context.Context, filter entities.ContentSectionFilter) ([]*entities.ContentSection, error) {
	var contents []*entities.ContentSection

	query := r.db.WithContext(ctx).Model(&entities.ContentSection{})

	// Apply filters
	if filter.SectionName != "" {
		query = query.Where("section_name = ?", filter.SectionName)
	}

	if filter.Active != nil {
		query = query.Where("active = ?", *filter.Active)
	}

	if filter.Search != "" {
		search := "%" + strings.ToLower(filter.Search) + "%"
		query = query.Where("LOWER(title) LIKE ? OR LOWER(content) LIKE ? OR LOWER(section_name) LIKE ?", search, search, search)
	}

	// Apply pagination
	if filter.Limit > 0 {
		query = query.Limit(filter.Limit)
	}
	if filter.Offset > 0 {
		query = query.Offset(filter.Offset)
	}

	// Apply ordering
	orderBy := "section_name ASC, created_at DESC"
	if filter.OrderBy != "" {
		direction := "ASC"
		if filter.OrderDir != "" && strings.ToUpper(filter.OrderDir) == "DESC" {
			direction = "DESC"
		}
		orderBy = filter.OrderBy + " " + direction
	}
	query = query.Order(orderBy)

	if err := query.Find(&contents).Error; err != nil {
		return nil, err
	}

	return contents, nil
}

func (r *contentRepository) Create(ctx context.Context, content *entities.ContentSection) error {
	return r.db.WithContext(ctx).Create(content).Error
}

func (r *contentRepository) Update(ctx context.Context, content *entities.ContentSection) error {
	return r.db.WithContext(ctx).Save(content).Error
}

func (r *contentRepository) Delete(ctx context.Context, id uint) error {
	return r.db.WithContext(ctx).Delete(&entities.ContentSection{}, id).Error
}

func (r *contentRepository) ToggleActive(ctx context.Context, id uint) error {
	return r.db.WithContext(ctx).
		Model(&entities.ContentSection{}).
		Where("id = ?", id).
		Update("active", gorm.Expr("NOT active")).Error
}