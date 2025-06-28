package services

import (
	"context"

	"restaurant-menu-api/internal/domain/entities"
	"restaurant-menu-api/internal/domain/repositories"
	"restaurant-menu-api/pkg/logger"
	appErrors "restaurant-menu-api/pkg/errors"
)

type CategoryService interface {
	Create(ctx context.Context, req CreateCategoryRequest) (*entities.Category, error)
	GetByID(ctx context.Context, id uint) (*entities.Category, error)
	GetAll(ctx context.Context, filter entities.CategoryFilter) ([]*entities.Category, *entities.Pagination, error)
	Update(ctx context.Context, id uint, req UpdateCategoryRequest) (*entities.Category, error)
	Delete(ctx context.Context, id uint) error
	ToggleActive(ctx context.Context, id uint) (*entities.Category, error)
	UpdateDisplayOrder(ctx context.Context, id uint, order int) (*entities.Category, error)
	GetWithSubCategories(ctx context.Context, id uint) (*entities.Category, error)
}

type categoryService struct {
	categoryRepo repositories.CategoryRepository
	logger       *logger.Logger
}

type CreateCategoryRequest struct {
	Name         string `json:"name" validate:"required,min=1,max=100"`
	Description  string `json:"description"`
	DisplayOrder int    `json:"display_order"`
	Active       *bool  `json:"active"`
}

type UpdateCategoryRequest struct {
	Name         string `json:"name" validate:"required,min=1,max=100"`
	Description  string `json:"description"`
	DisplayOrder int    `json:"display_order"`
	Active       *bool  `json:"active"`
}

func NewCategoryService(categoryRepo repositories.CategoryRepository, logger *logger.Logger) CategoryService {
	return &categoryService{
		categoryRepo: categoryRepo,
		logger:       logger,
	}
}

func (s *categoryService) Create(ctx context.Context, req CreateCategoryRequest) (*entities.Category, error) {
	// Check if category with same name already exists
	existing, _, err := s.categoryRepo.GetAll(ctx, entities.CategoryFilter{
		Search: req.Name,
		Limit:  1,
	})
	if err != nil {
		s.logger.LogError(ctx, err, "Failed to check existing category", map[string]interface{}{
			"category_name": req.Name,
		})
		return nil, appErrors.WrapInternalError(err, "Failed to validate category")
	}

	for _, cat := range existing {
		if cat.Name == req.Name {
			return nil, appErrors.NewConflictError("Category with this name already exists")
		}
	}

	category := &entities.Category{
		Name:         req.Name,
		Description:  req.Description,
		DisplayOrder: req.DisplayOrder,
		Active:       true,
	}

	if req.Active != nil {
		category.Active = *req.Active
	}

	if err := s.categoryRepo.Create(ctx, category); err != nil {
		s.logger.LogError(ctx, err, "Failed to create category", map[string]interface{}{
			"category_name": req.Name,
		})
		return nil, appErrors.WrapInternalError(err, "Failed to create category")
	}

	s.logger.LogInfo(ctx, "Category created successfully", map[string]interface{}{
		"category_id":   category.ID,
		"category_name": category.Name,
	})

	return category, nil
}

func (s *categoryService) GetByID(ctx context.Context, id uint) (*entities.Category, error) {
	category, err := s.categoryRepo.GetByID(ctx, id)
	if err != nil {
		s.logger.LogError(ctx, err, "Failed to get category", map[string]interface{}{
			"category_id": id,
		})
		return nil, appErrors.WrapInternalError(err, "Failed to get category")
	}

	if category == nil {
		return nil, appErrors.NewNotFoundError("Category")
	}

	return category, nil
}

func (s *categoryService) GetAll(ctx context.Context, filter entities.CategoryFilter) ([]*entities.Category, *entities.Pagination, error) {
	categories, pagination, err := s.categoryRepo.GetAll(ctx, filter)
	if err != nil {
		s.logger.LogError(ctx, err, "Failed to get categories", nil)
		return nil, nil, appErrors.WrapInternalError(err, "Failed to get categories")
	}

	return categories, pagination, nil
}

func (s *categoryService) Update(ctx context.Context, id uint, req UpdateCategoryRequest) (*entities.Category, error) {
	// Get existing category
	category, err := s.categoryRepo.GetByID(ctx, id)
	if err != nil {
		s.logger.LogError(ctx, err, "Failed to get category for update", map[string]interface{}{
			"category_id": id,
		})
		return nil, appErrors.WrapInternalError(err, "Failed to get category")
	}

	if category == nil {
		return nil, appErrors.NewNotFoundError("Category")
	}

	// Check if another category with same name exists (excluding current category)
	if req.Name != category.Name {
		existing, _, err := s.categoryRepo.GetAll(ctx, entities.CategoryFilter{
			Search: req.Name,
			Limit:  1,
		})
		if err != nil {
			s.logger.LogError(ctx, err, "Failed to check existing category", map[string]interface{}{
				"category_name": req.Name,
			})
			return nil, appErrors.WrapInternalError(err, "Failed to validate category")
		}

		for _, cat := range existing {
			if cat.Name == req.Name && cat.ID != id {
				return nil, appErrors.NewConflictError("Category with this name already exists")
			}
		}
	}

	// Update fields
	category.Name = req.Name
	category.Description = req.Description
	category.DisplayOrder = req.DisplayOrder

	if req.Active != nil {
		category.Active = *req.Active
	}

	if err := s.categoryRepo.Update(ctx, category); err != nil {
		s.logger.LogError(ctx, err, "Failed to update category", map[string]interface{}{
			"category_id":   id,
			"category_name": req.Name,
		})
		return nil, appErrors.WrapInternalError(err, "Failed to update category")
	}

	s.logger.LogInfo(ctx, "Category updated successfully", map[string]interface{}{
		"category_id":   category.ID,
		"category_name": category.Name,
	})

	return category, nil
}

func (s *categoryService) Delete(ctx context.Context, id uint) error {
	// Check if category exists
	category, err := s.categoryRepo.GetByID(ctx, id)
	if err != nil {
		s.logger.LogError(ctx, err, "Failed to get category for deletion", map[string]interface{}{
			"category_id": id,
		})
		return appErrors.WrapInternalError(err, "Failed to get category")
	}

	if category == nil {
		return appErrors.NewNotFoundError("Category")
	}

	// Check if category has subcategories
	subCategories, err := s.categoryRepo.GetWithSubCategories(ctx, id)
	if err != nil {
		s.logger.LogError(ctx, err, "Failed to check category subcategories", map[string]interface{}{
			"category_id": id,
		})
		return appErrors.WrapInternalError(err, "Failed to validate category deletion")
	}

	if len(subCategories.SubCategories) > 0 {
		return appErrors.NewConflictError("Cannot delete category with existing subcategories")
	}

	if err := s.categoryRepo.Delete(ctx, id); err != nil {
		s.logger.LogError(ctx, err, "Failed to delete category", map[string]interface{}{
			"category_id": id,
		})
		return appErrors.WrapInternalError(err, "Failed to delete category")
	}

	s.logger.LogInfo(ctx, "Category deleted successfully", map[string]interface{}{
		"category_id":   id,
		"category_name": category.Name,
	})

	return nil
}

func (s *categoryService) ToggleActive(ctx context.Context, id uint) (*entities.Category, error) {
	// Check if category exists
	category, err := s.categoryRepo.GetByID(ctx, id)
	if err != nil {
		s.logger.LogError(ctx, err, "Failed to get category", map[string]interface{}{
			"category_id": id,
		})
		return nil, appErrors.WrapInternalError(err, "Failed to get category")
	}

	if category == nil {
		return nil, appErrors.NewNotFoundError("Category")
	}

	if err := s.categoryRepo.ToggleActive(ctx, id); err != nil {
		s.logger.LogError(ctx, err, "Failed to toggle category active status", map[string]interface{}{
			"category_id": id,
		})
		return nil, appErrors.WrapInternalError(err, "Failed to toggle category active status")
	}

	// Get updated category
	updatedCategory, err := s.categoryRepo.GetByID(ctx, id)
	if err != nil {
		s.logger.LogError(ctx, err, "Failed to get updated category", map[string]interface{}{
			"category_id": id,
		})
		return nil, appErrors.WrapInternalError(err, "Failed to get updated category")
	}

	s.logger.LogInfo(ctx, "Category active status toggled successfully", map[string]interface{}{
		"category_id": id,
		"new_status":  updatedCategory.Active,
	})

	return updatedCategory, nil
}

func (s *categoryService) UpdateDisplayOrder(ctx context.Context, id uint, order int) (*entities.Category, error) {
	// Check if category exists
	category, err := s.categoryRepo.GetByID(ctx, id)
	if err != nil {
		s.logger.LogError(ctx, err, "Failed to get category", map[string]interface{}{
			"category_id": id,
		})
		return nil, appErrors.WrapInternalError(err, "Failed to get category")
	}

	if category == nil {
		return nil, appErrors.NewNotFoundError("Category")
	}

	if err := s.categoryRepo.UpdateDisplayOrder(ctx, id, order); err != nil {
		s.logger.LogError(ctx, err, "Failed to update category display order", map[string]interface{}{
			"category_id":    id,
			"display_order": order,
		})
		return nil, appErrors.WrapInternalError(err, "Failed to update category display order")
	}

	// Get updated category
	updatedCategory, err := s.categoryRepo.GetByID(ctx, id)
	if err != nil {
		s.logger.LogError(ctx, err, "Failed to get updated category", map[string]interface{}{
			"category_id": id,
		})
		return nil, appErrors.WrapInternalError(err, "Failed to get updated category")
	}

	s.logger.LogInfo(ctx, "Category display order updated successfully", map[string]interface{}{
		"category_id":    id,
		"display_order": order,
	})

	return updatedCategory, nil
}

func (s *categoryService) GetWithSubCategories(ctx context.Context, id uint) (*entities.Category, error) {
	category, err := s.categoryRepo.GetWithSubCategories(ctx, id)
	if err != nil {
		s.logger.LogError(ctx, err, "Failed to get category with subcategories", map[string]interface{}{
			"category_id": id,
		})
		return nil, appErrors.WrapInternalError(err, "Failed to get category")
	}

	if category == nil {
		return nil, appErrors.NewNotFoundError("Category")
	}

	return category, nil
}