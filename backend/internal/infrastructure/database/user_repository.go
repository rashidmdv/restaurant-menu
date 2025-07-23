package database

import (
	"context"
	"errors"
	"strings"
	"time"

	"gorm.io/gorm"

	"restaurant-menu-api/internal/domain/entities"
	"restaurant-menu-api/internal/domain/repositories"
)

type userRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) repositories.UserRepository {
	return &userRepository{db: db}
}

func (r *userRepository) Create(ctx context.Context, user *entities.User) error {
	return r.db.WithContext(ctx).Create(user).Error
}

func (r *userRepository) GetByID(ctx context.Context, id uint) (*entities.User, error) {
	var user entities.User
	err := r.db.WithContext(ctx).First(&user, id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &user, nil
}

func (r *userRepository) GetByEmail(ctx context.Context, email string) (*entities.User, error) {
	var user entities.User
	err := r.db.WithContext(ctx).Where("email = ?", email).First(&user).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &user, nil
}

func (r *userRepository) GetAll(ctx context.Context, filter entities.UserFilter) ([]*entities.User, *entities.Pagination, error) {
	var users []*entities.User
	var total int64

	query := r.db.WithContext(ctx).Model(&entities.User{})

	// Apply filters
	if filter.Role != nil {
		query = query.Where("role = ?", *filter.Role)
	}

	if filter.IsActive != nil {
		query = query.Where("is_active = ?", *filter.IsActive)
	}

	if filter.Search != "" {
		search := "%" + strings.ToLower(filter.Search) + "%"
		query = query.Where("LOWER(name) LIKE ? OR LOWER(email) LIKE ?", search, search)
	}

	// Count total records
	if err := query.Count(&total).Error; err != nil {
		return nil, nil, err
	}

	// Apply pagination
	if filter.Limit > 0 {
		query = query.Limit(filter.Limit)
	}
	if filter.Offset > 0 {
		query = query.Offset(filter.Offset)
	}

	// Apply ordering
	orderBy := "created_at DESC"
	if filter.OrderBy != "" {
		direction := "ASC"
		if filter.OrderDir != "" && strings.ToUpper(filter.OrderDir) == "DESC" {
			direction = "DESC"
		}
		orderBy = filter.OrderBy + " " + direction
	}
	query = query.Order(orderBy)

	if err := query.Find(&users).Error; err != nil {
		return nil, nil, err
	}

	// Calculate pagination
	page := 1
	if filter.Limit > 0 {
		page = (filter.Offset / filter.Limit) + 1
	}
	pagination := entities.NewPagination(page, filter.Limit, total)

	return users, pagination, nil
}

func (r *userRepository) Update(ctx context.Context, user *entities.User) error {
	return r.db.WithContext(ctx).Save(user).Error
}

func (r *userRepository) Delete(ctx context.Context, id uint) error {
	return r.db.WithContext(ctx).Delete(&entities.User{}, id).Error
}

func (r *userRepository) Count(ctx context.Context, filter entities.UserFilter) (int64, error) {
	var count int64
	query := r.db.WithContext(ctx).Model(&entities.User{})

	if filter.Role != nil {
		query = query.Where("role = ?", *filter.Role)
	}

	if filter.IsActive != nil {
		query = query.Where("is_active = ?", *filter.IsActive)
	}

	if filter.Search != "" {
		search := "%" + strings.ToLower(filter.Search) + "%"
		query = query.Where("LOWER(name) LIKE ? OR LOWER(email) LIKE ?", search, search)
	}

	return count, query.Count(&count).Error
}

func (r *userRepository) ToggleActive(ctx context.Context, id uint) error {
	return r.db.WithContext(ctx).
		Model(&entities.User{}).
		Where("id = ?", id).
		Update("is_active", gorm.Expr("NOT is_active")).Error
}

func (r *userRepository) UpdateLastLogin(ctx context.Context, id uint) error {
	now := time.Now()
	return r.db.WithContext(ctx).
		Model(&entities.User{}).
		Where("id = ?", id).
		Update("last_login_at", &now).Error
}

func (r *userRepository) ExistsByEmail(ctx context.Context, email string) (bool, error) {
	var count int64
	err := r.db.WithContext(ctx).
		Model(&entities.User{}).
		Where("email = ?", email).
		Count(&count).Error
	return count > 0, err
}