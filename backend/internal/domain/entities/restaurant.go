package entities

import (
	"database/sql/driver"
	"encoding/json"
	"fmt"
	"time"
)

type Address map[string]interface{}
type ContactInfo map[string]interface{}
type Settings map[string]interface{}

func (a Address) Value() (driver.Value, error) {
	return json.Marshal(a)
}

func (a *Address) Scan(value interface{}) error {
	if value == nil {
		*a = make(map[string]interface{})
		return nil
	}

	bytes, ok := value.([]byte)
	if !ok {
		return fmt.Errorf("cannot scan %T into Address", value)
	}

	return json.Unmarshal(bytes, a)
}

func (ci ContactInfo) Value() (driver.Value, error) {
	return json.Marshal(ci)
}

func (ci *ContactInfo) Scan(value interface{}) error {
	if value == nil {
		*ci = make(map[string]interface{})
		return nil
	}

	bytes, ok := value.([]byte)
	if !ok {
		return fmt.Errorf("cannot scan %T into ContactInfo", value)
	}

	return json.Unmarshal(bytes, ci)
}

func (s Settings) Value() (driver.Value, error) {
	return json.Marshal(s)
}

func (s *Settings) Scan(value interface{}) error {
	if value == nil {
		*s = make(map[string]interface{})
		return nil
	}

	bytes, ok := value.([]byte)
	if !ok {
		return fmt.Errorf("cannot scan %T into Settings", value)
	}

	return json.Unmarshal(bytes, s)
}

type RestaurantInfo struct {
	ID          uint        `json:"id" gorm:"primarykey"`
	Name        string      `json:"name" gorm:"size:200;not null" validate:"required,min=1,max=200"`
	Description string      `json:"description" gorm:"type:text"`
	Address     Address     `json:"address" gorm:"type:jsonb"`
	ContactInfo ContactInfo `json:"contact_info" gorm:"type:jsonb"`
	Settings    Settings    `json:"settings" gorm:"type:jsonb"`
	Active      bool        `json:"active" gorm:"default:true;index"`
	CreatedAt   time.Time   `json:"created_at"`
	UpdatedAt   time.Time   `json:"updated_at"`

	// Relationships
	OperatingHours []OperatingHour `json:"operating_hours,omitempty" gorm:"foreignKey:RestaurantInfoID;constraint:OnDelete:CASCADE"`
}

func (ri *RestaurantInfo) TableName() string {
	return "restaurant_info"
}

type OperatingHour struct {
	ID               uint      `json:"id" gorm:"primarykey"`
	DayOfWeek        int       `json:"day_of_week" gorm:"not null;check:day_of_week >= 0 AND day_of_week <= 6" validate:"min=0,max=6"`
	OpenTime         *string   `json:"open_time" gorm:"type:time"`
	CloseTime        *string   `json:"close_time" gorm:"type:time"`
	IsClosed         bool      `json:"is_closed" gorm:"default:false"`
	RestaurantInfoID uint      `json:"restaurant_info_id" gorm:"not null;index"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`

	// Relationships
	RestaurantInfo *RestaurantInfo `json:"-" gorm:"foreignKey:RestaurantInfoID"`
}

func (oh *OperatingHour) TableName() string {
	return "operating_hours"
}

type RestaurantInfoFilter struct {
	Active       *bool  `json:"active"`
	Search       string `json:"search"`
	Limit        int    `json:"limit"`
	Offset       int    `json:"offset"`
	OrderBy      string `json:"order_by"`
	OrderDir     string `json:"order_dir"`
	IncludeCount bool   `json:"include_count"`
}