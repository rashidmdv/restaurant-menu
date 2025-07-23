package repositories

import (
	"context"
	"restaurant-menu-api/internal/domain/entities"
)

type UserRepository interface {
	Create(ctx context.Context, user *entities.User) error
	GetByID(ctx context.Context, id uint) (*entities.User, error)
	GetByEmail(ctx context.Context, email string) (*entities.User, error)
	GetAll(ctx context.Context, filter entities.UserFilter) ([]*entities.User, *entities.Pagination, error)
	Update(ctx context.Context, user *entities.User) error
	Delete(ctx context.Context, id uint) error
	Count(ctx context.Context, filter entities.UserFilter) (int64, error)
	ToggleActive(ctx context.Context, id uint) error
	UpdateLastLogin(ctx context.Context, id uint) error
	ExistsByEmail(ctx context.Context, email string) (bool, error)
}