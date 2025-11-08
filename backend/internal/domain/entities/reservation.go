package entities

import "time"

type ReservationStatus string

const (
	ReservationStatusPending   ReservationStatus = "pending"
	ReservationStatusConfirmed ReservationStatus = "confirmed"
	ReservationStatusCancelled ReservationStatus = "cancelled"
	ReservationStatusCompleted ReservationStatus = "completed"
)

type Reservation struct {
	ID              uint              `json:"id" gorm:"primarykey"`
	FullName        string            `json:"full_name" gorm:"size:200;not null" validate:"required,min=2,max=200"`
	Email           string            `json:"email" gorm:"size:255;not null" validate:"required,email"`
	Phone           string            `json:"phone" gorm:"size:20;not null" validate:"required"`
	ReservationDate CustomDate        `json:"reservation_date" gorm:"type:date;not null" validate:"required"`
	ReservationTime string            `json:"reservation_time" gorm:"type:time;not null" validate:"required"`
	NumberOfGuests  int               `json:"number_of_guests" gorm:"not null" validate:"required,min=1,max=20"`
	SpecialRequests string            `json:"special_requests" gorm:"type:text"`
	Status          ReservationStatus `json:"status" gorm:"size:20;default:'pending';index" validate:"oneof=pending confirmed cancelled completed"`
	CreatedAt       time.Time         `json:"created_at"`
	UpdatedAt       time.Time         `json:"updated_at"`
}

func (r *Reservation) TableName() string {
	return "reservations"
}

type ReservationFilter struct {
	Status       *ReservationStatus `json:"status"`
	DateFrom     *string            `json:"date_from"`
	DateTo       *string            `json:"date_to"`
	Search       string             `json:"search"`
	Limit        int                `json:"limit"`
	Offset       int                `json:"offset"`
	OrderBy      string             `json:"order_by"`
	OrderDir     string             `json:"order_dir"`
	IncludeCount bool               `json:"include_count"`
}

type CreateReservationRequest struct {
	FullName        string `json:"full_name" validate:"required,min=2,max=200"`
	Email           string `json:"email" validate:"required,email"`
	Phone           string `json:"phone" validate:"required"`
	ReservationDate string `json:"reservation_date" validate:"required"`
	ReservationTime string `json:"reservation_time" validate:"required"`
	NumberOfGuests  int    `json:"number_of_guests" validate:"required,min=1,max=20"`
	SpecialRequests string `json:"special_requests"`
}

type UpdateReservationRequest struct {
	FullName        *string            `json:"full_name" validate:"omitempty,min=2,max=200"`
	Email           *string            `json:"email" validate:"omitempty,email"`
	Phone           *string            `json:"phone"`
	ReservationDate *string            `json:"reservation_date"`
	ReservationTime *string            `json:"reservation_time"`
	NumberOfGuests  *int               `json:"number_of_guests" validate:"omitempty,min=1,max=20"`
	SpecialRequests *string            `json:"special_requests"`
	Status          *ReservationStatus `json:"status" validate:"omitempty,oneof=pending confirmed cancelled completed"`
}
