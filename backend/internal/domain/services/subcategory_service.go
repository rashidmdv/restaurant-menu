package services

import (
	"context"
	"fmt"

	"restaurant-menu-api/internal/domain/entities"
	"restaurant-menu-api/internal/domain/repositories"
	"restaurant-menu-api/pkg/logger"
	"restaurant-menu-api/pkg/utils"
)

type SubCategoryService interface {
	GetAll(ctx context.Context, filter entities.SubCategoryFilter) ([]*entities.SubCategory, *entities.Pagination, error)
	GetByID(ctx context.Context, id uint) (*entities.SubCategory, error)
	GetByCategoryID(ctx context.Context, categoryID uint) ([]*entities.SubCategory, error)
	Create(ctx context.Context, subCategory *entities.SubCategory) error
	Update(ctx context.Context, id uint, subCategory *entities.SubCategory) error
	Delete(ctx context.Context, id uint) error
	ToggleActive(ctx context.Context, id uint) error
	UpdateDisplayOrder(ctx context.Context, id uint, order int) error
}

type subCategoryService struct {
	repo   repositories.SubCategoryRepository
	logger *logger.Logger
}

func NewSubCategoryService(repo repositories.SubCategoryRepository, logger *logger.Logger) SubCategoryService {
	return &subCategoryService{
		repo:   repo,
		logger: logger,
	}
}

func (s *subCategoryService) GetAll(ctx context.Context, filter entities.SubCategoryFilter) ([]*entities.SubCategory, *entities.Pagination, error) {
	return s.repo.GetAll(ctx, filter)
}

func (s *subCategoryService) GetByID(ctx context.Context, id uint) (*entities.SubCategory, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *subCategoryService) GetByCategoryID(ctx context.Context, categoryID uint) ([]*entities.SubCategory, error) {
	filter := entities.SubCategoryFilter{
		CategoryID: &categoryID,
		Active:     utils.BoolPtr(true),
		OrderBy:    "display_order",
		OrderDir:   "ASC",
	}
	
	subCategories, _, err := s.repo.GetAll(ctx, filter)
	return subCategories, err
}

func (s *subCategoryService) Create(ctx context.Context, subCategory *entities.SubCategory) error {
	// Generate slug if not provided
	if subCategory.Slug == "" {
		subCategory.Slug = utils.GenerateSlug(subCategory.Name)
	}

	// Set default display order if not provided
	if subCategory.DisplayOrder == 0 {
		count, err := s.repo.Count(ctx, entities.SubCategoryFilter{CategoryID: &subCategory.CategoryID})
		if err != nil {
			return fmt.Errorf("failed to get subcategory count: %w", err)
		}
		subCategory.DisplayOrder = int(count) + 1
	}

	return s.repo.Create(ctx, subCategory)
}

func (s *subCategoryService) Update(ctx context.Context, id uint, updateData *entities.SubCategory) error {
	// Get existing subcategory
	existing, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}

	// Update fields
	if updateData.Name != "" {
		existing.Name = updateData.Name
		existing.Slug = utils.GenerateSlug(updateData.Name)
	}
	if updateData.Description != "" {
		existing.Description = updateData.Description
	}
	if updateData.CategoryID != 0 {
		existing.CategoryID = updateData.CategoryID
	}
	if updateData.DisplayOrder != 0 {
		existing.DisplayOrder = updateData.DisplayOrder
	}
	// Always update active status if specified
	existing.Active = updateData.Active

	return s.repo.Update(ctx, existing)
}

func (s *subCategoryService) Delete(ctx context.Context, id uint) error {
	return s.repo.Delete(ctx, id)
}

func (s *subCategoryService) ToggleActive(ctx context.Context, id uint) error {
	subCategory, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}

	subCategory.Active = !subCategory.Active
	return s.repo.Update(ctx, subCategory)
}

func (s *subCategoryService) UpdateDisplayOrder(ctx context.Context, id uint, order int) error {
	subCategory, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	
	subCategory.DisplayOrder = order
	return s.repo.Update(ctx, subCategory)
}