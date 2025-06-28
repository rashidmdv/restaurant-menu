package handlers

import (
	"strconv"

	"github.com/gin-gonic/gin"

	"restaurant-menu-api/internal/domain/entities"
	"restaurant-menu-api/internal/domain/services"
	"restaurant-menu-api/pkg/logger"
	"restaurant-menu-api/pkg/response"
	appErrors "restaurant-menu-api/pkg/errors"
)

type CategoryHandler struct {
	service services.CategoryService
	logger  *logger.Logger
}

type CreateCategoryRequest struct {
	Name         string `json:"name" binding:"required,min=1,max=100"`
	Description  string `json:"description"`
	DisplayOrder int    `json:"display_order"`
	Active       *bool  `json:"active"`
}

type UpdateCategoryRequest struct {
	Name         string `json:"name" binding:"required,min=1,max=100"`
	Description  string `json:"description"`
	DisplayOrder int    `json:"display_order"`
	Active       *bool  `json:"active"`
}

type UpdateDisplayOrderRequest struct {
	DisplayOrder int `json:"display_order" binding:"required"`
}

func NewCategoryHandler(service services.CategoryService, logger *logger.Logger) *CategoryHandler {
	return &CategoryHandler{
		service: service,
		logger:  logger,
	}
}

// GetCompleteMenu godoc
// @Summary Get complete menu
// @Description Get the complete hierarchical menu with all categories, subcategories, and items
// @Tags Menu
// @Accept json
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Failure 500 {object} response.APIResponse
// @Router /v1/menu [get]
func (h *CategoryHandler) GetCompleteMenu(c *gin.Context) {
	ctx := c.Request.Context()

	// Get all active categories with subcategories
	filter := entities.CategoryFilter{
		Active:   boolPtr(true),
		OrderBy:  "display_order",
		OrderDir: "ASC",
	}

	categories, _, err := h.service.GetAll(ctx, filter)
	if err != nil {
		h.logger.LogError(ctx, err, "Failed to get complete menu", nil)
		response.Error(c, appErrors.WrapInternalError(err, "Failed to get menu"))
		return
	}

	response.Success(c, map[string]interface{}{
		"categories": categories,
	})
}

// GetAllCategories godoc
// @Summary List all categories
// @Description Get all categories with optional filtering and pagination
// @Tags Categories
// @Accept json
// @Produce json
// @Param active query boolean false "Filter by active status"
// @Param search query string false "Search in name and description"
// @Param limit query int false "Number of items to return"
// @Param offset query int false "Number of items to skip"
// @Param order_by query string false "Field to order by"
// @Param order_dir query string false "Order direction (ASC/DESC)"
// @Param include_count query boolean false "Include total count"
// @Success 200 {array} entities.Category
// @Failure 500 {object} response.APIResponse
// @Router /v1/categories [get]
func (h *CategoryHandler) GetAll(c *gin.Context) {
	ctx := c.Request.Context()

	// Parse query parameters
	filter := entities.CategoryFilter{
		Limit:        parseInt(c.Query("limit"), 10),
		Offset:       parseInt(c.Query("offset"), 0),
		OrderBy:      c.DefaultQuery("order_by", "display_order"),
		OrderDir:     c.DefaultQuery("order_dir", "ASC"),
		Search:       c.Query("search"),
		IncludeCount: c.Query("include_count") == "true",
	}

	if active := c.Query("active"); active != "" {
		if active == "true" {
			filter.Active = boolPtr(true)
		} else if active == "false" {
			filter.Active = boolPtr(false)
		}
	}

	categories, pagination, err := h.service.GetAll(ctx, filter)
	if err != nil {
		h.logger.LogError(ctx, err, "Failed to get categories", nil)
		response.Error(c, appErrors.WrapInternalError(err, "Failed to get categories"))
		return
	}

	if filter.IncludeCount && pagination != nil {
		response.SuccessWithPagination(c, categories, pagination)
	} else {
		response.Success(c, categories)
	}
}

func (h *CategoryHandler) GetByID(c *gin.Context) {
	ctx := c.Request.Context()

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		response.BadRequest(c, "Invalid category ID", "ID must be a positive integer")
		return
	}

	// Check if we should include subcategories
	includeSubCategories := c.Query("include_subcategories") == "true"

	var category *entities.Category
	if includeSubCategories {
		category, err = h.service.GetWithSubCategories(ctx, uint(id))
	} else {
		category, err = h.service.GetByID(ctx, uint(id))
	}

	if err != nil {
		h.logger.LogError(ctx, err, "Failed to get category", map[string]interface{}{
			"category_id": id,
		})
		response.Error(c, appErrors.WrapInternalError(err, "Failed to get category"))
		return
	}

	if category == nil {
		response.NotFound(c, "Category")
		return
	}

	response.Success(c, category)
}

// CreateCategory godoc
// @Summary Create a new category
// @Description Create a new menu category
// @Tags Categories
// @Accept json
// @Produce json
// @Param category body CreateCategoryRequest true "Category data"
// @Success 201 {object} entities.Category
// @Failure 400 {object} response.APIResponse
// @Failure 409 {object} response.APIResponse
// @Failure 500 {object} response.APIResponse
// @Router /v1/categories [post]
func (h *CategoryHandler) Create(c *gin.Context) {
	ctx := c.Request.Context()

	var req CreateCategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, "Invalid request data", err.Error())
		return
	}

	serviceReq := services.CreateCategoryRequest{
		Name:         req.Name,
		Description:  req.Description,
		DisplayOrder: req.DisplayOrder,
		Active:       req.Active,
	}

	category, err := h.service.Create(ctx, serviceReq)
	if err != nil {
		h.logger.LogError(ctx, err, "Failed to create category", map[string]interface{}{
			"category_name": req.Name,
		})
		response.Error(c, appErrors.WrapInternalError(err, "Failed to create category"))
		return
	}

	h.logger.LogInfo(ctx, "Category created successfully", map[string]interface{}{
		"category_id":   category.ID,
		"category_name": category.Name,
	})

	response.Created(c, category)
}

func (h *CategoryHandler) Update(c *gin.Context) {
	ctx := c.Request.Context()

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		response.BadRequest(c, "Invalid category ID", "ID must be a positive integer")
		return
	}

	var req UpdateCategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, "Invalid request data", err.Error())
		return
	}

	// Get existing category
	category, err := h.service.GetByID(ctx, uint(id))
	if err != nil {
		h.logger.LogError(ctx, err, "Failed to get category", map[string]interface{}{
			"category_id": id,
		})
		response.Error(c, appErrors.WrapInternalError(err, "Failed to get category"))
		return
	}

	if category == nil {
		response.NotFound(c, "Category")
		return
	}

	serviceReq := services.UpdateCategoryRequest{
		Name:         req.Name,
		Description:  req.Description,
		DisplayOrder: req.DisplayOrder,
		Active:       req.Active,
	}

	category, err = h.service.Update(ctx, uint(id), serviceReq)
	if err != nil {
		h.logger.LogError(ctx, err, "Failed to update category", map[string]interface{}{
			"category_id":   id,
			"category_name": req.Name,
		})
		response.Error(c, appErrors.WrapInternalError(err, "Failed to update category"))
		return
	}

	h.logger.LogInfo(ctx, "Category updated successfully", map[string]interface{}{
		"category_id":   category.ID,
		"category_name": category.Name,
	})

	response.Success(c, category)
}

func (h *CategoryHandler) Delete(c *gin.Context) {
	ctx := c.Request.Context()

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		response.BadRequest(c, "Invalid category ID", "ID must be a positive integer")
		return
	}

	// Check if category exists
	category, err := h.service.GetByID(ctx, uint(id))
	if err != nil {
		h.logger.LogError(ctx, err, "Failed to get category", map[string]interface{}{
			"category_id": id,
		})
		response.Error(c, appErrors.WrapInternalError(err, "Failed to get category"))
		return
	}

	if category == nil {
		response.NotFound(c, "Category")
		return
	}

	if err := h.service.Delete(ctx, uint(id)); err != nil {
		h.logger.LogError(ctx, err, "Failed to delete category", map[string]interface{}{
			"category_id": id,
		})
		response.Error(c, appErrors.WrapInternalError(err, "Failed to delete category"))
		return
	}

	h.logger.LogInfo(ctx, "Category deleted successfully", map[string]interface{}{
		"category_id":   id,
		"category_name": category.Name,
	})

	response.NoContent(c)
}

func (h *CategoryHandler) ToggleActive(c *gin.Context) {
	ctx := c.Request.Context()

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		response.BadRequest(c, "Invalid category ID", "ID must be a positive integer")
		return
	}

	// Check if category exists
	category, err := h.service.GetByID(ctx, uint(id))
	if err != nil {
		h.logger.LogError(ctx, err, "Failed to get category", map[string]interface{}{
			"category_id": id,
		})
		response.Error(c, appErrors.WrapInternalError(err, "Failed to get category"))
		return
	}

	if category == nil {
		response.NotFound(c, "Category")
		return
	}

	updatedCategory, err := h.service.ToggleActive(ctx, uint(id))
	if err != nil {
		h.logger.LogError(ctx, err, "Failed to toggle category active status", map[string]interface{}{
			"category_id": id,
		})
		response.Error(c, appErrors.WrapInternalError(err, "Failed to toggle category active status"))
		return
	}

	h.logger.LogInfo(ctx, "Category active status toggled successfully", map[string]interface{}{
		"category_id": id,
		"new_status":  updatedCategory.Active,
	})

	response.Success(c, updatedCategory)
}

func (h *CategoryHandler) UpdateDisplayOrder(c *gin.Context) {
	ctx := c.Request.Context()

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		response.BadRequest(c, "Invalid category ID", "ID must be a positive integer")
		return
	}

	var req UpdateDisplayOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, "Invalid request data", err.Error())
		return
	}

	// Check if category exists
	category, err := h.service.GetByID(ctx, uint(id))
	if err != nil {
		h.logger.LogError(ctx, err, "Failed to get category", map[string]interface{}{
			"category_id": id,
		})
		response.Error(c, appErrors.WrapInternalError(err, "Failed to get category"))
		return
	}

	if category == nil {
		response.NotFound(c, "Category")
		return
	}

	updatedCategory, err := h.service.UpdateDisplayOrder(ctx, uint(id), req.DisplayOrder)
	if err != nil {
		h.logger.LogError(ctx, err, "Failed to update category display order", map[string]interface{}{
			"category_id":    id,
			"display_order": req.DisplayOrder,
		})
		response.Error(c, appErrors.WrapInternalError(err, "Failed to update category display order"))
		return
	}

	h.logger.LogInfo(ctx, "Category display order updated successfully", map[string]interface{}{
		"category_id":    id,
		"display_order": req.DisplayOrder,
	})

	response.Success(c, updatedCategory)
}

// Helper functions
func boolPtr(b bool) *bool {
	return &b
}

func parseInt(s string, defaultValue int) int {
	if s == "" {
		return defaultValue
	}
	if val, err := strconv.Atoi(s); err == nil {
		return val
	}
	return defaultValue
}