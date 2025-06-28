package repositories

import (
	"context"
	"restaurant-menu-api/internal/domain/entities"
)

type ItemRepository interface {
	Create(ctx context.Context, item *entities.Item) error
	GetByID(ctx context.Context, id uint) (*entities.Item, error)
	GetAll(ctx context.Context, filter entities.ItemFilter) ([]*entities.Item, *entities.Pagination, error)
	GetBySubCategoryID(ctx context.Context, subCategoryID uint, filter entities.ItemFilter) ([]*entities.Item, error)
	GetByCategoryID(ctx context.Context, categoryID uint, filter entities.ItemFilter) ([]*entities.Item, error)
	Update(ctx context.Context, item *entities.Item) error
	Delete(ctx context.Context, id uint) error
	Search(ctx context.Context, query string, filter entities.ItemFilter) ([]*entities.Item, *entities.Pagination, error)
	Count(ctx context.Context, filter entities.ItemFilter) (int64, error)
	UpdateDisplayOrder(ctx context.Context, id uint, order int) error
	ToggleAvailable(ctx context.Context, id uint) error
	UpdatePrice(ctx context.Context, id uint, price float64) error
	GetFeatured(ctx context.Context, limit int) ([]*entities.Item, error)
}