package entities

import (
	"time"

	"gorm.io/gorm"
)

type Category struct {
	ID           uint           `json:"id" gorm:"primarykey"`
	Name         string         `json:"name" gorm:"size:100;not null;uniqueIndex" validate:"required,min=1,max=100"`
	Description  string         `json:"description" gorm:"type:text"`
	Slug         string         `json:"slug" gorm:"size:100;uniqueIndex"`
	DisplayOrder int            `json:"display_order" gorm:"default:0;index"`
	Active       bool           `json:"active" gorm:"default:true;index"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `json:"-" gorm:"index"`

	// Relationships
	SubCategories []SubCategory `json:"sub_categories,omitempty" gorm:"foreignKey:CategoryID;constraint:OnDelete:CASCADE"`
}

func (c *Category) BeforeCreate(tx *gorm.DB) error {
	if c.Slug == "" {
		c.Slug = generateSlug(c.Name)
	}
	return nil
}

func (c *Category) BeforeUpdate(tx *gorm.DB) error {
	if tx.Statement.Changed("Name") && c.Slug == "" {
		c.Slug = generateSlug(c.Name)
	}
	return nil
}

func (c *Category) TableName() string {
	return "categories"
}

type CategoryFilter struct {
	Active       *bool  `json:"active"`
	Search       string `json:"search"`
	Limit        int    `json:"limit"`
	Offset       int    `json:"offset"`
	OrderBy      string `json:"order_by"`
	OrderDir     string `json:"order_dir"`
	IncludeCount bool   `json:"include_count"`
}