package services

import (
	"context"

	"restaurant-menu-api/internal/domain/entities"
	"restaurant-menu-api/internal/domain/repositories"
	"restaurant-menu-api/pkg/logger"
)

type ContentService interface {
	GetAll(ctx context.Context, filter entities.ContentSectionFilter) ([]*entities.ContentSection, error)
	GetByID(ctx context.Context, id uint) (*entities.ContentSection, error)
	GetBySection(ctx context.Context, sectionName string) (*entities.ContentSection, error)
	Create(ctx context.Context, content *entities.ContentSection) error
	Update(ctx context.Context, content *entities.ContentSection) error
	Delete(ctx context.Context, id uint) error
	ToggleActive(ctx context.Context, id uint) error
}

type contentService struct {
	repo   repositories.ContentRepository
	logger *logger.Logger
}

func NewContentService(repo repositories.ContentRepository, logger *logger.Logger) ContentService {
	return &contentService{
		repo:   repo,
		logger: logger,
	}
}

func (s *contentService) GetAll(ctx context.Context, filter entities.ContentSectionFilter) ([]*entities.ContentSection, error) {
	return s.repo.GetAll(ctx, filter)
}

func (s *contentService) GetByID(ctx context.Context, id uint) (*entities.ContentSection, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *contentService) GetBySection(ctx context.Context, sectionName string) (*entities.ContentSection, error) {
	return s.repo.GetBySection(ctx, sectionName)
}

func (s *contentService) Create(ctx context.Context, content *entities.ContentSection) error {
	// Set default active status
	content.Active = true
	return s.repo.Create(ctx, content)
}

func (s *contentService) Update(ctx context.Context, content *entities.ContentSection) error {
	return s.repo.Update(ctx, content)
}

func (s *contentService) Delete(ctx context.Context, id uint) error {
	return s.repo.Delete(ctx, id)
}

func (s *contentService) ToggleActive(ctx context.Context, id uint) error {
	return s.repo.ToggleActive(ctx, id)
}