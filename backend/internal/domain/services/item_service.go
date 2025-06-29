package services

import (
	"context"
	"fmt"

	"restaurant-menu-api/internal/domain/entities"
	"restaurant-menu-api/internal/domain/repositories"
	"restaurant-menu-api/pkg/logger"
	"restaurant-menu-api/pkg/utils"
)

type ItemService interface {
	GetAll(ctx context.Context, filter entities.ItemFilter) ([]*entities.Item, *entities.Pagination, error)
	GetByID(ctx context.Context, id uint) (*entities.Item, error)
	GetBySubCategoryID(ctx context.Context, subCategoryID uint) ([]*entities.Item, error)
	GetFeatured(ctx context.Context, limit int) ([]*entities.Item, error)
	Search(ctx context.Context, query string, filter entities.ItemFilter) ([]*entities.Item, *entities.Pagination, error)
	Create(ctx context.Context, item *entities.Item) error
	Update(ctx context.Context, id uint, item *entities.Item) error
	Delete(ctx context.Context, id uint) error
	ToggleAvailable(ctx context.Context, id uint) error
	UpdateDisplayOrder(ctx context.Context, id uint, order int) error
	UpdatePrice(ctx context.Context, id uint, price float64) error
}

type itemService struct {
	repo   repositories.ItemRepository
	logger *logger.Logger
}

func NewItemService(repo repositories.ItemRepository, logger *logger.Logger) ItemService {
	return &itemService{
		repo:   repo,
		logger: logger,
	}
}

func (s *itemService) GetAll(ctx context.Context, filter entities.ItemFilter) ([]*entities.Item, *entities.Pagination, error) {
	return s.repo.GetAll(ctx, filter)
}

func (s *itemService) GetByID(ctx context.Context, id uint) (*entities.Item, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *itemService) GetBySubCategoryID(ctx context.Context, subCategoryID uint) ([]*entities.Item, error) {
	filter := entities.ItemFilter{
		SubCategoryID: &subCategoryID,
		Available:     utils.BoolPtr(true),
		OrderBy:       "display_order",
		OrderDir:      "ASC",
	}
	
	items, _, err := s.repo.GetAll(ctx, filter)
	return items, err
}

func (s *itemService) GetFeatured(ctx context.Context, limit int) ([]*entities.Item, error) {
	filter := entities.ItemFilter{
		Available: utils.BoolPtr(true),
		OrderBy:   "created_at",
		OrderDir:  "DESC",
		Limit:     limit,
	}
	
	items, _, err := s.repo.GetAll(ctx, filter)
	return items, err
}

func (s *itemService) Search(ctx context.Context, query string, filter entities.ItemFilter) ([]*entities.Item, *entities.Pagination, error) {
	filter.Search = query
	return s.repo.GetAll(ctx, filter)
}

func (s *itemService) Create(ctx context.Context, item *entities.Item) error {
	// Set default display order if not provided
	if item.DisplayOrder == 0 {
		count, err := s.repo.Count(ctx, entities.ItemFilter{SubCategoryID: &item.SubCategoryID})
		if err != nil {
			return fmt.Errorf("failed to get item count: %w", err)
		}
		item.DisplayOrder = int(count) + 1
	}

	// Set default availability
	if !item.Available {
		item.Available = true
	}

	// Set default currency if not provided
	if item.Currency == "" {
		item.Currency = "USD"
	}

	return s.repo.Create(ctx, item)
}

func (s *itemService) Update(ctx context.Context, id uint, updateData *entities.Item) error {
	// Get existing item
	existing, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	
	// Update fields
	if updateData.Name != "" {
		existing.Name = updateData.Name
	}
	if updateData.Description != "" {
		existing.Description = updateData.Description
	}
	if updateData.Price != 0 {
		existing.Price = updateData.Price
	}
	if updateData.Currency != "" {
		existing.Currency = updateData.Currency
	}
	if updateData.ImageURL != "" {
		existing.ImageURL = updateData.ImageURL
	}
	if updateData.SubCategoryID != 0 {
		existing.SubCategoryID = updateData.SubCategoryID
	}
	if updateData.DisplayOrder != 0 {
		existing.DisplayOrder = updateData.DisplayOrder
	}
	// Always update availability if specified
	existing.Available = updateData.Available
	existing.DietaryInfo = updateData.DietaryInfo
	
	return s.repo.Update(ctx, existing)
}

func (s *itemService) Delete(ctx context.Context, id uint) error {
	return s.repo.Delete(ctx, id)
}

func (s *itemService) ToggleAvailable(ctx context.Context, id uint) error {
	return s.repo.ToggleAvailable(ctx, id)
}

func (s *itemService) UpdateDisplayOrder(ctx context.Context, id uint, order int) error {
	return s.repo.UpdateDisplayOrder(ctx, id, order)
}

func (s *itemService) UpdatePrice(ctx context.Context, id uint, price float64) error {
	return s.repo.UpdatePrice(ctx, id, price)
}

