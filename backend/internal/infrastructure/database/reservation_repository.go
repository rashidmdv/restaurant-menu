package database

import (
	"context"
	"errors"

	"gorm.io/gorm"

	"restaurant-menu-api/internal/domain/entities"
	"restaurant-menu-api/internal/domain/repositories"
)

type reservationRepository struct {
	db *gorm.DB
}

func NewReservationRepository(db *gorm.DB) repositories.ReservationRepository {
	return &reservationRepository{db: db}
}

func (r *reservationRepository) Create(ctx context.Context, reservation *entities.Reservation) error {
	return r.db.WithContext(ctx).Create(reservation).Error
}

func (r *reservationRepository) GetByID(ctx context.Context, id uint) (*entities.Reservation, error) {
	var reservation entities.Reservation
	err := r.db.WithContext(ctx).First(&reservation, id).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &reservation, nil
}

func (r *reservationRepository) Update(ctx context.Context, reservation *entities.Reservation) error {
	return r.db.WithContext(ctx).Save(reservation).Error
}

func (r *reservationRepository) Delete(ctx context.Context, id uint) error {
	return r.db.WithContext(ctx).Delete(&entities.Reservation{}, id).Error
}

func (r *reservationRepository) List(ctx context.Context, filter *entities.ReservationFilter) ([]entities.Reservation, int64, error) {
	var reservations []entities.Reservation
	var total int64

	query := r.db.WithContext(ctx).Model(&entities.Reservation{})

	// Apply filters
	if filter != nil {
		if filter.Status != nil {
			query = query.Where("status = ?", *filter.Status)
		}
		if filter.DateFrom != nil {
			query = query.Where("reservation_date >= ?", *filter.DateFrom)
		}
		if filter.DateTo != nil {
			query = query.Where("reservation_date <= ?", *filter.DateTo)
		}
		if filter.Search != "" {
			searchPattern := "%" + filter.Search + "%"
			query = query.Where("full_name ILIKE ? OR email ILIKE ? OR phone ILIKE ?",
				searchPattern, searchPattern, searchPattern)
		}

		// Count total
		if filter.IncludeCount {
			if err := query.Count(&total).Error; err != nil {
				return nil, 0, err
			}
		}

		// Apply ordering
		orderBy := "created_at"
		orderDir := "DESC"
		if filter.OrderBy != "" {
			orderBy = filter.OrderBy
		}
		if filter.OrderDir != "" {
			orderDir = filter.OrderDir
		}
		query = query.Order(orderBy + " " + orderDir)

		// Apply pagination
		if filter.Limit > 0 {
			query = query.Limit(filter.Limit)
		}
		if filter.Offset > 0 {
			query = query.Offset(filter.Offset)
		}
	} else {
		query = query.Order("created_at DESC")
	}

	err := query.Find(&reservations).Error
	if err != nil {
		return nil, 0, err
	}

	return reservations, total, nil
}

func (r *reservationRepository) UpdateStatus(ctx context.Context, id uint, status entities.ReservationStatus) error {
	return r.db.WithContext(ctx).
		Model(&entities.Reservation{}).
		Where("id = ?", id).
		Update("status", status).Error
}
