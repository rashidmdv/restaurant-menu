package repositories

import (
	"context"
	"restaurant-menu-api/internal/domain/entities"
)

type SubCategoryRepository interface {
	Create(ctx context.Context, subcategory *entities.SubCategory) error
	GetByID(ctx context.Context, id uint) (*entities.SubCategory, error)
	GetBySlug(ctx context.Context, slug string) (*entities.SubCategory, error)
	GetAll(ctx context.Context, filter entities.SubCategoryFilter) ([]*entities.SubCategory, *entities.Pagination, error)
	GetByCategoryID(ctx context.Context, categoryID uint, filter entities.SubCategoryFilter) ([]*entities.SubCategory, error)
	Update(ctx context.Context, subcategory *entities.SubCategory) error
	Delete(ctx context.Context, id uint) error
	GetWithItems(ctx context.Context, id uint) (*entities.SubCategory, error)
	GetAllWithItems(ctx context.Context, filter entities.SubCategoryFilter) ([]*entities.SubCategory, error)
	Count(ctx context.Context, filter entities.SubCategoryFilter) (int64, error)
	UpdateDisplayOrder(ctx context.Context, id uint, order int) error
	ToggleActive(ctx context.Context, id uint) error
}