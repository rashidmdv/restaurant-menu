package entities

import (
	"database/sql/driver"
	"encoding/json"
	"fmt"
	"time"

	"gorm.io/gorm"
)

type Metadata map[string]interface{}

func (m Metadata) Value() (driver.Value, error) {
	return json.Marshal(m)
}

func (m *Metadata) Scan(value interface{}) error {
	if value == nil {
		*m = make(map[string]interface{})
		return nil
	}

	bytes, ok := value.([]byte)
	if !ok {
		return fmt.Errorf("cannot scan %T into Metadata", value)
	}

	return json.Unmarshal(bytes, m)
}

type ContentSection struct {
	ID          uint           `json:"id" gorm:"primarykey"`
	SectionName string         `json:"section_name" gorm:"size:50;not null;uniqueIndex" validate:"required,min=1,max=50"`
	Title       string         `json:"title" gorm:"size:200"`
	Content     string         `json:"content" gorm:"type:text"`
	Metadata    Metadata       `json:"metadata" gorm:"type:jsonb"`
	ImageURL    string         `json:"image_url" gorm:"size:500"`
	Active      bool           `json:"active" gorm:"default:true;index"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
}

func (cs *ContentSection) TableName() string {
	return "content_sections"
}

type ContentSectionFilter struct {
	SectionName string `json:"section_name"`
	Active      *bool  `json:"active"`
	Search      string `json:"search"`
	Limit       int    `json:"limit"`
	Offset      int    `json:"offset"`
	OrderBy     string `json:"order_by"`
	OrderDir    string `json:"order_dir"`
}