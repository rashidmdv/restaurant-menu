package database

import (
	"context"
	"errors"

	"gorm.io/gorm"

	"restaurant-menu-api/internal/domain/entities"
	"restaurant-menu-api/internal/domain/repositories"
)

type restaurantRepository struct {
	db *gorm.DB
}

func NewRestaurantRepository(db *gorm.DB) repositories.RestaurantRepository {
	return &restaurantRepository{db: db}
}

func (r *restaurantRepository) GetInfo(ctx context.Context) (*entities.RestaurantInfo, error) {
	var info entities.RestaurantInfo
	err := r.db.WithContext(ctx).
		Preload("OperatingHours", func(db *gorm.DB) *gorm.DB {
			return db.Order("day_of_week ASC")
		}).
		First(&info).Error
	
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &info, nil
}

func (r *restaurantRepository) UpdateInfo(ctx context.Context, info *entities.RestaurantInfo) error {
	return r.db.WithContext(ctx).Save(info).Error
}

func (r *restaurantRepository) CreateInfo(ctx context.Context, info *entities.RestaurantInfo) error {
	return r.db.WithContext(ctx).Create(info).Error
}

func (r *restaurantRepository) GetOperatingHours(ctx context.Context) ([]entities.OperatingHour, error) {
	var hours []entities.OperatingHour
	err := r.db.WithContext(ctx).
		Order("day_of_week ASC").
		Find(&hours).Error
	
	if err != nil {
		return nil, err
	}
	return hours, nil
}

func (r *restaurantRepository) UpdateOperatingHours(ctx context.Context, hours []entities.OperatingHour) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		// First, get restaurant info ID (assuming there's only one restaurant)
		var restaurantInfo entities.RestaurantInfo
		if err := tx.First(&restaurantInfo).Error; err != nil {
			return err
		}

		// Delete existing operating hours for this restaurant
		if err := tx.Where("restaurant_info_id = ?", restaurantInfo.ID).Delete(&entities.OperatingHour{}).Error; err != nil {
			return err
		}

		// Create new operating hours
		for i := range hours {
			hours[i].RestaurantInfoID = restaurantInfo.ID
			if err := tx.Create(&hours[i]).Error; err != nil {
				return err
			}
		}

		return nil
	})
}

func (r *restaurantRepository) GetOperatingHoursByDay(ctx context.Context, dayOfWeek int) (*entities.OperatingHour, error) {
	var hour entities.OperatingHour
	err := r.db.WithContext(ctx).
		Where("day_of_week = ?", dayOfWeek).
		First(&hour).Error
	
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &hour, nil
}