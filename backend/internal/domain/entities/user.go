package entities

import (
	"time"

	"gorm.io/gorm"
)

type UserRole string

const (
	UserRoleAdmin      UserRole = "admin"
	UserRoleModerator  UserRole = "moderator"
	UserRoleViewer     UserRole = "viewer"
)

type User struct {
	ID           uint           `json:"id" gorm:"primarykey"`
	Email        string         `json:"email" gorm:"size:255;not null;uniqueIndex" validate:"required,email,max=255"`
	PasswordHash string         `json:"-" gorm:"size:255;not null"`
	Name         string         `json:"name" gorm:"size:100;not null" validate:"required,min=1,max=100"`
	Role         UserRole       `json:"role" gorm:"size:20;not null;default:'admin'" validate:"required,oneof=admin moderator viewer"`
	IsActive     bool           `json:"is_active" gorm:"default:true;index"`
	LastLoginAt  *time.Time     `json:"last_login_at"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `json:"-" gorm:"index"`
}

func (u *User) TableName() string {
	return "users"
}

func (u *User) IsAdmin() bool {
	return u.Role == UserRoleAdmin
}

func (u *User) CanManageUsers() bool {
	return u.Role == UserRoleAdmin
}

func (u *User) CanManageContent() bool {
	return u.Role == UserRoleAdmin || u.Role == UserRoleModerator
}

func (u *User) CanViewDashboard() bool {
	return u.Role == UserRoleAdmin || u.Role == UserRoleModerator || u.Role == UserRoleViewer
}

type UserFilter struct {
	Role     *UserRole `json:"role"`
	IsActive *bool     `json:"is_active"`
	Search   string    `json:"search"`
	Limit    int       `json:"limit"`
	Offset   int       `json:"offset"`
	OrderBy  string    `json:"order_by"`
	OrderDir string    `json:"order_dir"`
}

type CreateUserRequest struct {
	Email    string   `json:"email" validate:"required,email,max=255"`
	Password string   `json:"password" validate:"required,min=8,max=72"`
	Name     string   `json:"name" validate:"required,min=1,max=100"`
	Role     UserRole `json:"role" validate:"required,oneof=admin moderator viewer"`
}

type UpdateUserRequest struct {
	Email    *string   `json:"email,omitempty" validate:"omitempty,email,max=255"`
	Password *string   `json:"password,omitempty" validate:"omitempty,min=8,max=72"`
	Name     *string   `json:"name,omitempty" validate:"omitempty,min=1,max=100"`
	Role     *UserRole `json:"role,omitempty" validate:"omitempty,oneof=admin moderator viewer"`
	IsActive *bool     `json:"is_active,omitempty"`
}

type UpdateProfileRequest struct {
	Name  string `json:"name" binding:"required,min=1,max=100"`
	Email string `json:"email" binding:"required,email"`
}

type UserResponse struct {
	ID          uint       `json:"id"`
	Email       string     `json:"email"`
	Name        string     `json:"name"`
	Role        UserRole   `json:"role"`
	IsActive    bool       `json:"is_active"`
	LastLoginAt *time.Time `json:"last_login_at"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}

func (u *User) ToResponse() *UserResponse {
	return &UserResponse{
		ID:          u.ID,
		Email:       u.Email,
		Name:        u.Name,
		Role:        u.Role,
		IsActive:    u.IsActive,
		LastLoginAt: u.LastLoginAt,
		CreatedAt:   u.CreatedAt,
		UpdatedAt:   u.UpdatedAt,
	}
}