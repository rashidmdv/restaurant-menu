package entities

import (
	"time"

	"gorm.io/gorm"
)

type SubCategory struct {
	ID           uint           `json:"id" gorm:"primarykey"`
	Name         string         `json:"name" gorm:"size:100;not null" validate:"required,min=1,max=100"`
	Description  string         `json:"description" gorm:"type:text"`
	Slug         string         `json:"slug" gorm:"size:100"`
	CategoryID   uint           `json:"category_id" gorm:"not null;index" validate:"required"`
	DisplayOrder int            `json:"display_order" gorm:"default:0;index"`
	Active       bool           `json:"active" gorm:"default:true;index"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `json:"-" gorm:"index"`

	// Relationships
	Category *Category `json:"category,omitempty" gorm:"foreignKey:CategoryID"`
	Items    []Item    `json:"items,omitempty" gorm:"foreignKey:SubCategoryID;constraint:OnDelete:CASCADE"`
}

func (sc *SubCategory) BeforeCreate(tx *gorm.DB) error {
	if sc.Slug == "" {
		sc.Slug = generateSlug(sc.Name)
	}
	return nil
}

func (sc *SubCategory) BeforeUpdate(tx *gorm.DB) error {
	if tx.Statement.Changed("Name") && sc.Slug == "" {
		sc.Slug = generateSlug(sc.Name)
	}
	return nil
}

func (sc *SubCategory) TableName() string {
	return "sub_categories"
}

type SubCategoryFilter struct {
	CategoryID   *uint  `json:"category_id"`
	Active       *bool  `json:"active"`
	Search       string `json:"search"`
	Limit        int    `json:"limit"`
	Offset       int    `json:"offset"`
	OrderBy      string `json:"order_by"`
	OrderDir     string `json:"order_dir"`
	IncludeCount bool   `json:"include_count"`
}