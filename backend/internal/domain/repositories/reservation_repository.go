package repositories

import (
	"context"
	"restaurant-menu-api/internal/domain/entities"
)

type ReservationRepository interface {
	Create(ctx context.Context, reservation *entities.Reservation) error
	GetByID(ctx context.Context, id uint) (*entities.Reservation, error)
	Update(ctx context.Context, reservation *entities.Reservation) error
	Delete(ctx context.Context, id uint) error
	List(ctx context.Context, filter *entities.ReservationFilter) ([]entities.Reservation, int64, error)
	UpdateStatus(ctx context.Context, id uint, status entities.ReservationStatus) error
}
