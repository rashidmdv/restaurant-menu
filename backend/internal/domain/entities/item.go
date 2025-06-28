package entities

import (
	"database/sql/driver"
	"encoding/json"
	"fmt"
	"time"

	"gorm.io/gorm"
)

type DietaryInfo map[string]interface{}

func (di DietaryInfo) Value() (driver.Value, error) {
	return json.Marshal(di)
}

func (di *DietaryInfo) Scan(value interface{}) error {
	if value == nil {
		*di = make(map[string]interface{})
		return nil
	}

	bytes, ok := value.([]byte)
	if !ok {
		return fmt.Errorf("cannot scan %T into DietaryInfo", value)
	}

	return json.Unmarshal(bytes, di)
}

type Item struct {
	ID            uint           `json:"id" gorm:"primarykey"`
	Name          string         `json:"name" gorm:"size:150;not null" validate:"required,min=1,max=150"`
	Description   string         `json:"description" gorm:"type:text"`
	Price         float64        `json:"price" gorm:"type:decimal(10,2);not null" validate:"required,min=0"`
	Currency      string         `json:"currency" gorm:"size:3;default:'AED'" validate:"len=3"`
	DietaryInfo   DietaryInfo    `json:"dietary_info" gorm:"type:jsonb"`
	ImageURL      string         `json:"image_url" gorm:"size:500"`
	SubCategoryID uint           `json:"sub_category_id" gorm:"not null;index" validate:"required"`
	Available     bool           `json:"available" gorm:"default:true;index"`
	DisplayOrder  int            `json:"display_order" gorm:"default:0;index"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `json:"-" gorm:"index"`

	// Relationships
	SubCategory *SubCategory `json:"sub_category,omitempty" gorm:"foreignKey:SubCategoryID"`
}

func (i *Item) TableName() string {
	return "items"
}

type ItemFilter struct {
	SubCategoryID *uint   `json:"sub_category_id"`
	CategoryID    *uint   `json:"category_id"`
	Available     *bool   `json:"available"`
	MinPrice      *float64 `json:"min_price"`
	MaxPrice      *float64 `json:"max_price"`
	Search        string  `json:"search"`
	Limit         int     `json:"limit"`
	Offset        int     `json:"offset"`
	OrderBy       string  `json:"order_by"`
	OrderDir      string  `json:"order_dir"`
	IncludeCount  bool    `json:"include_count"`
}