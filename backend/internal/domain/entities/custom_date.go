package entities

import (
	"database/sql/driver"
	"fmt"
	"time"
)

// CustomDate represents a date without time component
// Properly marshals to JSON as "YYYY-MM-DD" format
type CustomDate struct {
	time.Time
}

// MarshalJSON implements json.Marshaler interface
// Returns date in "YYYY-MM-DD" format instead of RFC3339 timestamp
func (d CustomDate) MarshalJSON() ([]byte, error) {
	if d.Time.IsZero() {
		return []byte("null"), nil
	}
	return []byte(fmt.Sprintf("\"%s\"", d.Time.Format("2006-01-02"))), nil
}

// UnmarshalJSON implements json.Unmarshaler interface
// Accepts date strings in "YYYY-MM-DD" format
func (d *CustomDate) UnmarshalJSON(data []byte) error {
	str := string(data)
	if str == "null" || str == "" {
		d.Time = time.Time{}
		return nil
	}

	// Remove surrounding quotes
	if len(str) >= 2 && str[0] == '"' && str[len(str)-1] == '"' {
		str = str[1 : len(str)-1]
	}

	t, err := time.Parse("2006-01-02", str)
	if err != nil {
		return fmt.Errorf("invalid date format, expected YYYY-MM-DD: %w", err)
	}
	d.Time = t
	return nil
}

// Scan implements sql.Scanner interface
// Reads DATE values from PostgreSQL
func (d *CustomDate) Scan(value interface{}) error {
	if value == nil {
		d.Time = time.Time{}
		return nil
	}

	switch v := value.(type) {
	case time.Time:
		d.Time = v
		return nil
	case []byte:
		t, err := time.Parse("2006-01-02", string(v))
		if err != nil {
			return fmt.Errorf("failed to parse date from bytes: %w", err)
		}
		d.Time = t
		return nil
	case string:
		t, err := time.Parse("2006-01-02", v)
		if err != nil {
			return fmt.Errorf("failed to parse date from string: %w", err)
		}
		d.Time = t
		return nil
	default:
		return fmt.Errorf("unsupported Scan type for CustomDate: %T", value)
	}
}

// Value implements driver.Valuer interface
// Writes date values to PostgreSQL DATE column
func (d CustomDate) Value() (driver.Value, error) {
	if d.Time.IsZero() {
		return nil, nil
	}
	// Return only the date portion with zero time in UTC
	y, m, day := d.Time.Date()
	return time.Date(y, m, day, 0, 0, 0, 0, time.UTC), nil
}

// GormDataType specifies the database column type for GORM migrations
func (CustomDate) GormDataType() string {
	return "date"
}

// String returns the date in YYYY-MM-DD format
func (d CustomDate) String() string {
	if d.Time.IsZero() {
		return ""
	}
	return d.Time.Format("2006-01-02")
}
