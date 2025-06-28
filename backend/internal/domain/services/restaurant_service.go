package services

import (
	"context"

	"restaurant-menu-api/internal/domain/entities"
	"restaurant-menu-api/internal/domain/repositories"
	"restaurant-menu-api/pkg/logger"
)

type RestaurantService interface {
	GetInfo(ctx context.Context) (*entities.RestaurantInfo, error)
	UpdateInfo(ctx context.Context, info *entities.RestaurantInfo) error
	CreateInfo(ctx context.Context, info *entities.RestaurantInfo) error
	GetOperatingHours(ctx context.Context) ([]entities.OperatingHour, error)
	UpdateOperatingHours(ctx context.Context, hours []entities.OperatingHour) error
	GetOperatingHoursByDay(ctx context.Context, dayOfWeek int) (*entities.OperatingHour, error)
}

type restaurantService struct {
	repo   repositories.RestaurantRepository
	logger *logger.Logger
}

func NewRestaurantService(repo repositories.RestaurantRepository, logger *logger.Logger) RestaurantService {
	return &restaurantService{
		repo:   repo,
		logger: logger,
	}
}

func (s *restaurantService) GetInfo(ctx context.Context) (*entities.RestaurantInfo, error) {
	return s.repo.GetInfo(ctx)
}

func (s *restaurantService) CreateInfo(ctx context.Context, info *entities.RestaurantInfo) error {
	// Set default active status
	info.Active = true
	return s.repo.CreateInfo(ctx, info)
}

func (s *restaurantService) UpdateInfo(ctx context.Context, info *entities.RestaurantInfo) error {
	return s.repo.UpdateInfo(ctx, info)
}

func (s *restaurantService) GetOperatingHours(ctx context.Context) ([]entities.OperatingHour, error) {
	return s.repo.GetOperatingHours(ctx)
}

func (s *restaurantService) UpdateOperatingHours(ctx context.Context, hours []entities.OperatingHour) error {
	return s.repo.UpdateOperatingHours(ctx, hours)
}

func (s *restaurantService) GetOperatingHoursByDay(ctx context.Context, dayOfWeek int) (*entities.OperatingHour, error) {
	return s.repo.GetOperatingHoursByDay(ctx, dayOfWeek)
}