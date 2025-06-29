package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"restaurant-menu-api/internal/domain/entities"
	"restaurant-menu-api/internal/domain/services"
	"restaurant-menu-api/pkg/logger"
	"restaurant-menu-api/pkg/response"
)

type RestaurantHandler struct {
	service services.RestaurantService
	logger  *logger.Logger
}

type CreateRestaurantRequest struct {
	Name        string                 `json:"name" binding:"required,min=1,max=200"`
	Description string                 `json:"description"`
	Address     map[string]interface{} `json:"address"`
	ContactInfo map[string]interface{} `json:"contact_info"`
	Settings    map[string]interface{} `json:"settings"`
}

type UpdateRestaurantRequest struct {
	Name        *string                `json:"name,omitempty" binding:"omitempty,min=1,max=200"`
	Description *string                `json:"description,omitempty"`
	Address     map[string]interface{} `json:"address,omitempty"`
	ContactInfo map[string]interface{} `json:"contact_info,omitempty"`
	Settings    map[string]interface{} `json:"settings,omitempty"`
	Active      *bool                  `json:"active,omitempty"`
}

func NewRestaurantHandler(service services.RestaurantService, logger *logger.Logger) *RestaurantHandler {
	return &RestaurantHandler{
		service: service,
		logger:  logger,
	}
}

// GetInfo retrieves restaurant information
// @Summary Get restaurant information
// @Description Get the restaurant's basic information
// @Tags Restaurants
// @Accept json
// @Produce json
// @Success 200 {object} entities.RestaurantInfo
// @Failure 500 {object} response.APIResponse
// @Router /api/v1/restaurants/info [get]
func (h *RestaurantHandler) GetInfo(c *gin.Context) {
	ctx := c.Request.Context()

	restaurant, err := h.service.GetInfo(ctx)
	if err != nil {
		h.logger.LogError(ctx, err, "Failed to get restaurant info", nil)
		response.Error(c, err)
		return
	}

	response.Success(c, restaurant)
}

// GetOperatingHours retrieves restaurant operating hours
// @Summary Get operating hours
// @Description Get the restaurant's operating hours
// @Tags Restaurants
// @Accept json
// @Produce json
// @Success 200 {array} entities.OperatingHour
// @Failure 500 {object} response.APIResponse
// @Router /api/v1/restaurants/hours [get]
func (h *RestaurantHandler) GetOperatingHours(c *gin.Context) {
	ctx := c.Request.Context()

	hours, err := h.service.GetOperatingHours(ctx)
	if err != nil {
		h.logger.LogError(ctx, err, "Failed to get operating hours", nil)
		response.Error(c, err)
		return
	}

	response.Success(c, hours)
}

// CreateInfo creates restaurant information
// @Summary Create restaurant information
// @Description Create the restaurant's basic information
// @Tags Restaurants
// @Accept json
// @Produce json
// @Param restaurant body CreateRestaurantRequest true "Restaurant data"
// @Success 201 {object} entities.RestaurantInfo
// @Failure 400 {object} response.APIResponse
// @Failure 500 {object} response.APIResponse
// @Router /api/v1/restaurants/info [post]
func (h *RestaurantHandler) CreateInfo(c *gin.Context) {
	ctx := c.Request.Context()

	var req CreateRestaurantRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, "Invalid request data", err.Error())
		return
	}

	restaurant := &entities.RestaurantInfo{
		Name:        req.Name,
		Description: req.Description,
		Address:     entities.Address(req.Address),
		ContactInfo: entities.ContactInfo(req.ContactInfo),
		Settings:    entities.Settings(req.Settings),
	}

	if err := h.service.CreateInfo(ctx, restaurant); err != nil {
		h.logger.LogError(ctx, err, "Failed to create restaurant info", map[string]interface{}{
			"restaurant_name": req.Name,
		})
		response.Error(c, err)
		return
	}

	h.logger.LogInfo(ctx, "Restaurant info created successfully", map[string]interface{}{
		"restaurant_id":   restaurant.ID,
		"restaurant_name": restaurant.Name,
	})

	response.Created(c, restaurant)
}

// UpdateInfo updates restaurant information
// @Summary Update restaurant information
// @Description Update the restaurant's basic information
// @Tags Restaurants
// @Accept json
// @Produce json
// @Param restaurant body UpdateRestaurantRequest true "Restaurant data"
// @Success 200 {object} entities.RestaurantInfo
// @Failure 400 {object} response.APIResponse
// @Failure 500 {object} response.APIResponse
// @Router /api/v1/restaurants/info [put]
func (h *RestaurantHandler) UpdateInfo(c *gin.Context) {
	ctx := c.Request.Context()

	var req UpdateRestaurantRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, "Invalid request data", err.Error())
		return
	}

	// Get existing restaurant info first
	existing, err := h.service.GetInfo(ctx)
	if err != nil {
		h.logger.LogError(ctx, err, "Failed to get existing restaurant info", nil)
		response.Error(c, err)
		return
	}

	// Update fields
	if req.Name != nil {
		existing.Name = *req.Name
	}
	if req.Description != nil {
		existing.Description = *req.Description
	}
	if req.Address != nil {
		existing.Address = entities.Address(req.Address)
	}
	if req.ContactInfo != nil {
		existing.ContactInfo = entities.ContactInfo(req.ContactInfo)
	}
	if req.Settings != nil {
		existing.Settings = entities.Settings(req.Settings)
	}
	if req.Active != nil {
		existing.Active = *req.Active
	}

	if err := h.service.UpdateInfo(ctx, existing); err != nil {
		h.logger.LogError(ctx, err, "Failed to update restaurant info", nil)
		response.Error(c, err)
		return
	}

	h.logger.LogInfo(ctx, "Restaurant info updated successfully", nil)
	response.Success(c, existing)
}

// Delete deletes a restaurant
// @Summary Delete a restaurant
// @Description Delete a restaurant by ID
// @Tags Restaurants
// @Accept json
// @Produce json
// @Param id path int true "Restaurant ID"
// @Success 204
// @Failure 404 {object} response.APIResponse
// @Failure 500 {object} response.APIResponse
// @Router /api/v1/restaurants/{id} [delete]
func (h *RestaurantHandler) Delete(c *gin.Context) {
	ctx := c.Request.Context()

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		response.BadRequest(c, "Invalid restaurant ID", err.Error())
		return
	}

	// Delete method is not available in RestaurantService
	// if err := h.service.Delete(ctx, uint(id)); err != nil {
	// 	h.logger.LogError(ctx, err, "Failed to delete restaurant", map[string]interface{}{
	// 		"restaurant_id": id,
	// 	})
	// 	response.Error(c, err)
	// 	return
	// }
	
	h.logger.LogError(ctx, nil, "Delete operation not supported", map[string]interface{}{
		"restaurant_id": id,
	})
	c.JSON(http.StatusNotImplemented, gin.H{
		"success": false,
		"error": gin.H{
			"code":    "NOT_IMPLEMENTED",
			"message": "Delete operation not supported",
			"details": "Restaurant deletion is not implemented",
		},
	})
}