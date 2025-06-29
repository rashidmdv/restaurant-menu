package repositories

import (
	"context"
	"restaurant-menu-api/internal/domain/entities"
)

type RestaurantRepository interface {
	GetInfo(ctx context.Context) (*entities.RestaurantInfo, error)
	UpdateInfo(ctx context.Context, info *entities.RestaurantInfo) error
	CreateInfo(ctx context.Context, info *entities.RestaurantInfo) error
	GetOperatingHours(ctx context.Context) ([]entities.OperatingHour, error)
	UpdateOperatingHours(ctx context.Context, hours []entities.OperatingHour) error
	GetOperatingHoursByDay(ctx context.Context, dayOfWeek int) (*entities.OperatingHour, error)
}