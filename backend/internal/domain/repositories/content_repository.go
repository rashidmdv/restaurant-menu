package repositories

import (
	"context"
	"restaurant-menu-api/internal/domain/entities"
)

type ContentRepository interface {
	GetBySection(ctx context.Context, sectionName string) (*entities.ContentSection, error)
	GetAll(ctx context.Context, filter entities.ContentSectionFilter) ([]*entities.ContentSection, error)
	Create(ctx context.Context, content *entities.ContentSection) error
	Update(ctx context.Context, content *entities.ContentSection) error
	Delete(ctx context.Context, id uint) error
	ToggleActive(ctx context.Context, id uint) error
}