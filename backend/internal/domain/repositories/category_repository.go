package repositories

import (
	"context"
	"restaurant-menu-api/internal/domain/entities"
)

type CategoryRepository interface {
	Create(ctx context.Context, category *entities.Category) error
	GetByID(ctx context.Context, id uint) (*entities.Category, error)
	GetBySlug(ctx context.Context, slug string) (*entities.Category, error)
	GetAll(ctx context.Context, filter entities.CategoryFilter) ([]*entities.Category, *entities.Pagination, error)
	Update(ctx context.Context, category *entities.Category) error
	Delete(ctx context.Context, id uint) error
	GetWithSubCategories(ctx context.Context, id uint) (*entities.Category, error)
	GetAllWithSubCategories(ctx context.Context, filter entities.CategoryFilter) ([]*entities.Category, error)
	Count(ctx context.Context, filter entities.CategoryFilter) (int64, error)
	UpdateDisplayOrder(ctx context.Context, id uint, order int) error
	ToggleActive(ctx context.Context, id uint) error
}