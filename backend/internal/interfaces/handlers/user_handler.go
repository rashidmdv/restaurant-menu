package handlers

import (
	"strconv"

	"github.com/gin-gonic/gin"

	"restaurant-menu-api/internal/domain/entities"
	"restaurant-menu-api/internal/domain/services"
	appErrors "restaurant-menu-api/pkg/errors"
	"restaurant-menu-api/pkg/logger"
	"restaurant-menu-api/pkg/response"
	"restaurant-menu-api/pkg/utils"
)

type UserHandler struct {
	service services.UserService
	logger  *logger.Logger
}

type ChangePasswordRequest struct {
	CurrentPassword string `json:"current_password" binding:"required"`
	NewPassword     string `json:"new_password" binding:"required,min=8,max=72"`
}

func NewUserHandler(service services.UserService, logger *logger.Logger) *UserHandler {
	return &UserHandler{
		service: service,
		logger:  logger,
	}
}

// GetAllUsers godoc
// @Summary List all users
// @Description Get all users with optional filtering and pagination
// @Tags Users
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param role query string false "User role filter" Enums(admin,moderator,viewer)
// @Param is_active query boolean false "Active status filter"
// @Param search query string false "Search by name or email"
// @Param page query int false "Page number" minimum(1) default(1)
// @Param limit query int false "Items per page" minimum(1) maximum(100) default(10)
// @Param order_by query string false "Order by field" default(created_at)
// @Param order_dir query string false "Order direction" Enums(asc,desc) default(desc)
// @Success 200 {object} response.APIResponse{data=[]entities.UserResponse,meta=response.Meta}
// @Failure 400 {object} response.APIResponse{error=response.APIError}
// @Failure 401 {object} response.APIResponse{error=response.APIError}
// @Failure 403 {object} response.APIResponse{error=response.APIError}
// @Failure 500 {object} response.APIResponse{error=response.APIError}
// @Router /users [get]
func (h *UserHandler) GetAllUsers(c *gin.Context) {
	filter := entities.UserFilter{
		Search:   c.Query("search"),
		OrderBy:  c.DefaultQuery("order_by", "created_at"),
		OrderDir: c.DefaultQuery("order_dir", "desc"),
	}

	// Parse role filter
	if roleStr := c.Query("role"); roleStr != "" {
		role := entities.UserRole(roleStr)
		filter.Role = &role
	}

	// Parse is_active filter
	if isActiveStr := c.Query("is_active"); isActiveStr != "" {
		if isActive, err := strconv.ParseBool(isActiveStr); err == nil {
			filter.IsActive = &isActive
		}
	}

	// Parse pagination
	page, limit := utils.ParsePagination(c)
	filter.Offset = (page - 1) * limit
	filter.Limit = limit

	users, pagination, err := h.service.GetAll(c.Request.Context(), filter)
	if err != nil {
		response.Error(c, err)
		return
	}

	// Convert users to response format
	userResponses := make([]*entities.UserResponse, len(users))
	for i, user := range users {
		userResponses[i] = user.ToResponse()
	}

	response.SuccessWithMeta(c, userResponses, &response.Meta{
		Pagination: pagination,
	})
}

// GetUserByID godoc
// @Summary Get user by ID
// @Description Get a specific user by their ID
// @Tags Users
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "User ID"
// @Success 200 {object} response.APIResponse{data=entities.UserResponse}
// @Failure 400 {object} response.APIResponse{error=response.APIError}
// @Failure 401 {object} response.APIResponse{error=response.APIError}
// @Failure 403 {object} response.APIResponse{error=response.APIError}
// @Failure 404 {object} response.APIResponse{error=response.APIError}
// @Failure 500 {object} response.APIResponse{error=response.APIError}
// @Router /users/{id} [get]
func (h *UserHandler) GetUserByID(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		response.Error(c, appErrors.NewValidationError("Invalid user ID", ""))
		return
	}

	user, err := h.service.GetByID(c.Request.Context(), uint(id))
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Success(c, user.ToResponse())
}

// CreateUser godoc
// @Summary Create a new user
// @Description Create a new user account
// @Tags Users
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param user body entities.CreateUserRequest true "User creation request"
// @Success 201 {object} response.APIResponse{data=entities.UserResponse}
// @Failure 400 {object} response.APIResponse{error=response.APIError}
// @Failure 401 {object} response.APIResponse{error=response.APIError}
// @Failure 403 {object} response.APIResponse{error=response.APIError}
// @Failure 409 {object} response.APIResponse{error=response.APIError}
// @Failure 500 {object} response.APIResponse{error=response.APIError}
// @Router /users [post]
func (h *UserHandler) CreateUser(c *gin.Context) {
	var req entities.CreateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, appErrors.WrapValidationError(err, "Invalid request data"))
		return
	}

	user, err := h.service.Create(c.Request.Context(), &req)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Created(c, user.ToResponse())
}

// UpdateUser godoc
// @Summary Update a user
// @Description Update an existing user's information
// @Tags Users
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "User ID"
// @Param user body entities.UpdateUserRequest true "User update request"
// @Success 200 {object} response.APIResponse{data=entities.UserResponse}
// @Failure 400 {object} response.APIResponse{error=response.APIError}
// @Failure 401 {object} response.APIResponse{error=response.APIError}
// @Failure 403 {object} response.APIResponse{error=response.APIError}
// @Failure 404 {object} response.APIResponse{error=response.APIError}
// @Failure 409 {object} response.APIResponse{error=response.APIError}
// @Failure 500 {object} response.APIResponse{error=response.APIError}
// @Router /users/{id} [put]
func (h *UserHandler) UpdateUser(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		response.Error(c, appErrors.NewValidationError("Invalid user ID", ""))
		return
	}

	var req entities.UpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, appErrors.WrapValidationError(err, "Invalid request data"))
		return
	}

	user, err := h.service.Update(c.Request.Context(), uint(id), &req)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Success(c, user.ToResponse())
}

// DeleteUser godoc
// @Summary Delete a user
// @Description Delete a user account
// @Tags Users
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "User ID"
// @Success 200 {object} response.APIResponse
// @Failure 400 {object} response.APIResponse{error=response.APIError}
// @Failure 401 {object} response.APIResponse{error=response.APIError}
// @Failure 403 {object} response.APIResponse{error=response.APIError}
// @Failure 404 {object} response.APIResponse{error=response.APIError}
// @Failure 409 {object} response.APIResponse{error=response.APIError}
// @Failure 500 {object} response.APIResponse{error=response.APIError}
// @Router /users/{id} [delete]
func (h *UserHandler) DeleteUser(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		response.Error(c, appErrors.NewValidationError("Invalid user ID", ""))
		return
	}

	if err := h.service.Delete(c.Request.Context(), uint(id)); err != nil {
		response.Error(c, err)
		return
	}

	response.Success(c, gin.H{"message": "User deleted successfully"})
}

// ToggleUserActive godoc
// @Summary Toggle user active status
// @Description Toggle the active status of a user account
// @Tags Users
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "User ID"
// @Success 200 {object} response.APIResponse{data=entities.UserResponse}
// @Failure 400 {object} response.APIResponse{error=response.APIError}
// @Failure 401 {object} response.APIResponse{error=response.APIError}
// @Failure 403 {object} response.APIResponse{error=response.APIError}
// @Failure 404 {object} response.APIResponse{error=response.APIError}
// @Failure 409 {object} response.APIResponse{error=response.APIError}
// @Failure 500 {object} response.APIResponse{error=response.APIError}
// @Router /users/{id}/status [patch]
func (h *UserHandler) ToggleUserActive(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		response.Error(c, appErrors.NewValidationError("Invalid user ID", ""))
		return
	}

	user, err := h.service.ToggleActive(c.Request.Context(), uint(id))
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Success(c, user.ToResponse())
}

// ChangePassword godoc
// @Summary Change user password
// @Description Change the password for the current user
// @Tags Users
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param password body ChangePasswordRequest true "Password change request"
// @Success 200 {object} response.APIResponse
// @Failure 400 {object} response.APIResponse{error=response.APIError}
// @Failure 401 {object} response.APIResponse{error=response.APIError}
// @Failure 500 {object} response.APIResponse{error=response.APIError}
// @Router /users/change-password [post]
func (h *UserHandler) ChangePassword(c *gin.Context) {
	var req ChangePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, appErrors.WrapValidationError(err, "Invalid request data"))
		return
	}

	// Get user ID from auth context (will be added by middleware)
	userID, exists := c.Get("user_id")
	if !exists {
		response.Error(c, appErrors.NewUnauthorizedError("User not authenticated"))
		return
	}

	userIDUint, ok := userID.(uint)
	if !ok {
		response.Error(c, appErrors.NewInternalError("Invalid user ID format", nil))
		return
	}

	if err := h.service.ChangePassword(c.Request.Context(), userIDUint, req.CurrentPassword, req.NewPassword); err != nil {
		response.Error(c, err)
		return
	}

	response.Success(c, gin.H{"message": "Password changed successfully"})
}