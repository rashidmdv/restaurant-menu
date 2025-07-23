package handlers

import (
	"strconv"

	"github.com/gin-gonic/gin"

	"restaurant-menu-api/internal/domain/entities"
	"restaurant-menu-api/internal/domain/services"
	"restaurant-menu-api/pkg/logger"
	"restaurant-menu-api/pkg/response"
	"restaurant-menu-api/pkg/utils"
	appErrors "restaurant-menu-api/pkg/errors"
)

type SubCategoryHandler struct {
	service        services.SubCategoryService
	categoryService services.CategoryService
	logger         *logger.Logger
}

type CreateSubCategoryRequest struct {
	Name         string `json:"name" binding:"required,min=1,max=100"`
	Description  string `json:"description"`
	CategoryID   uint   `json:"category_id" binding:"required"`
	DisplayOrder int    `json:"display_order"`
	Active       *bool  `json:"active"`
}

type UpdateSubCategoryRequest struct {
	Name         string `json:"name" binding:"required,min=1,max=100"`
	Description  string `json:"description"`
	CategoryID   uint   `json:"category_id" binding:"required"`
	DisplayOrder int    `json:"display_order"`
	Active       *bool  `json:"active"`
}


func NewSubCategoryHandler(service services.SubCategoryService, categoryService services.CategoryService, logger *logger.Logger) *SubCategoryHandler {
	return &SubCategoryHandler{
		service:        service,
		categoryService: categoryService,
		logger:         logger,
	}
}

// GetAllSubCategories godoc
// @Summary List all subcategories
// @Description Get all subcategories with optional filtering and pagination
// @Tags SubCategories
// @Accept json
// @Produce json
// @Param category_id query int false "Filter by category ID"
// @Param active query boolean false "Filter by active status"
// @Param search query string false "Search in name and description"
// @Param limit query int false "Number of items to return"
// @Param offset query int false "Number of items to skip"
// @Param order_by query string false "Field to order by"
// @Param order_dir query string false "Order direction (ASC/DESC)"
// @Param include_count query boolean false "Include total count"
// @Success 200 {array} entities.SubCategory
// @Failure 500 {object} response.APIResponse
// @Router /v1/subcategories [get]
func (h *SubCategoryHandler) GetAll(c *gin.Context) {
	ctx := c.Request.Context()

	// Parse query parameters
	filter := entities.SubCategoryFilter{
		Limit:        utils.ParseInt(c.Query("limit"), 10),
		Offset:       utils.ParseInt(c.Query("offset"), 0),
		OrderBy:      c.DefaultQuery("order_by", "display_order"),
		OrderDir:     c.DefaultQuery("order_dir", "ASC"),
		Search:       c.Query("search"),
		IncludeCount: c.Query("include_count") == "true",
	}

	if categoryID := c.Query("category_id"); categoryID != "" {
		if id, err := strconv.ParseUint(categoryID, 10, 32); err == nil {
			filter.CategoryID = utils.UintPtr(uint(id))
		}
	}

	if active := c.Query("active"); active != "" {
		if active == "true" {
			filter.Active = utils.BoolPtr(true)
		} else if active == "false" {
			filter.Active = utils.BoolPtr(false)
		}
	}

	subcategories, pagination, err := h.service.GetAll(ctx, filter)
	if err != nil {
		h.logger.LogError(ctx, err, "Failed to get subcategories", nil)
		response.Error(c, appErrors.WrapInternalError(err, "Failed to get subcategories"))
		return
	}

	if filter.IncludeCount && pagination != nil {
		response.SuccessWithPagination(c, subcategories, pagination)
	} else {
		response.Success(c, subcategories)
	}
}

// GetSubCategoryByID godoc
// @Summary Get subcategory by ID
// @Description Get a specific subcategory by its ID with optional items
// @Tags SubCategories
// @Accept json
// @Produce json
// @Param id path int true "SubCategory ID"
// @Param include_items query boolean false "Include items in response"
// @Success 200 {object} entities.SubCategory
// @Failure 400 {object} response.APIResponse
// @Failure 404 {object} response.APIResponse
// @Failure 500 {object} response.APIResponse
// @Router /v1/subcategories/{id} [get]
func (h *SubCategoryHandler) GetByID(c *gin.Context) {
	ctx := c.Request.Context()

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		response.BadRequest(c, "Invalid subcategory ID", "ID must be a positive integer")
		return
	}

	// Check if we should include items
	includeItems := c.Query("include_items") == "true"

	var subcategory *entities.SubCategory
	if includeItems {
		subcategory, err = h.service.GetByID(ctx, uint(id))
	} else {
		subcategory, err = h.service.GetByID(ctx, uint(id))
	}

	if err != nil {
		h.logger.LogError(ctx, err, "Failed to get subcategory", map[string]interface{}{
			"subcategory_id": id,
		})
		response.Error(c, appErrors.WrapInternalError(err, "Failed to get subcategory"))
		return
	}

	if subcategory == nil {
		response.NotFound(c, "SubCategory")
		return
	}

	response.Success(c, subcategory)
}

// CreateSubCategory godoc
// @Summary Create a new subcategory
// @Description Create a new menu subcategory
// @Tags SubCategories
// @Accept json
// @Produce json
// @Param subcategory body CreateSubCategoryRequest true "SubCategory data"
// @Success 201 {object} entities.SubCategory
// @Failure 400 {object} response.APIResponse
// @Failure 409 {object} response.APIResponse
// @Failure 500 {object} response.APIResponse
// @Router /v1/subcategories [post]
func (h *SubCategoryHandler) Create(c *gin.Context) {
	ctx := c.Request.Context()

	var req CreateSubCategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, "Invalid request data", err.Error())
		return
	}

	// Validate category exists
	category, err := h.categoryService.GetByID(ctx, req.CategoryID)
	if err != nil {
		h.logger.LogError(ctx, err, "Failed to validate category", map[string]interface{}{
			"category_id": req.CategoryID,
		})
		response.Error(c, appErrors.WrapInternalError(err, "Failed to validate category"))
		return
	}

	if category == nil {
		response.BadRequest(c, "Invalid category ID", "Category does not exist")
		return
	}

	subcategory := &entities.SubCategory{
		Name:         req.Name,
		Description:  req.Description,
		CategoryID:   req.CategoryID,
		DisplayOrder: req.DisplayOrder,
		Active:       true,
	}

	if req.Active != nil {
		subcategory.Active = *req.Active
	}

	if err := h.service.Create(ctx, subcategory); err != nil {
		h.logger.LogError(ctx, err, "Failed to create subcategory", map[string]interface{}{
			"subcategory_name": req.Name,
			"category_id":      req.CategoryID,
		})
		response.Error(c, appErrors.WrapInternalError(err, "Failed to create subcategory"))
		return
	}

	h.logger.LogInfo(ctx, "SubCategory created successfully", map[string]interface{}{
		"subcategory_id":   subcategory.ID,
		"subcategory_name": subcategory.Name,
		"category_id":      subcategory.CategoryID,
	})

	response.Created(c, subcategory)
}

// UpdateSubCategory godoc
// @Summary Update a subcategory
// @Description Update an existing menu subcategory
// @Tags SubCategories
// @Accept json
// @Produce json
// @Param id path int true "SubCategory ID"
// @Param subcategory body UpdateSubCategoryRequest true "SubCategory data"
// @Success 200 {object} entities.SubCategory
// @Failure 400 {object} response.APIResponse
// @Failure 404 {object} response.APIResponse
// @Failure 500 {object} response.APIResponse
// @Router /v1/subcategories/{id} [put]
func (h *SubCategoryHandler) Update(c *gin.Context) {
	ctx := c.Request.Context()

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		response.BadRequest(c, "Invalid subcategory ID", "ID must be a positive integer")
		return
	}

	var req UpdateSubCategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, "Invalid request data", err.Error())
		return
	}

	// Get existing subcategory
	subcategory, err := h.service.GetByID(ctx, uint(id))
	if err != nil {
		h.logger.LogError(ctx, err, "Failed to get subcategory", map[string]interface{}{
			"subcategory_id": id,
		})
		response.Error(c, appErrors.WrapInternalError(err, "Failed to get subcategory"))
		return
	}

	if subcategory == nil {
		response.NotFound(c, "SubCategory")
		return
	}

	// Validate category exists
	category, err := h.categoryService.GetByID(ctx, req.CategoryID)
	if err != nil {
		h.logger.LogError(ctx, err, "Failed to validate category", map[string]interface{}{
			"category_id": req.CategoryID,
		})
		response.Error(c, appErrors.WrapInternalError(err, "Failed to validate category"))
		return
	}

	if category == nil {
		response.BadRequest(c, "Invalid category ID", "Category does not exist")
		return
	}

	// Update fields
	subcategory.Name = req.Name
	subcategory.Description = req.Description
	subcategory.CategoryID = req.CategoryID
	subcategory.DisplayOrder = req.DisplayOrder

	if req.Active != nil {
		subcategory.Active = *req.Active
	}

	if err := h.service.Update(ctx, uint(id), subcategory); err != nil {
		h.logger.LogError(ctx, err, "Failed to update subcategory", map[string]interface{}{
			"subcategory_id":   id,
			"subcategory_name": req.Name,
		})
		response.Error(c, appErrors.WrapInternalError(err, "Failed to update subcategory"))
		return
	}

	h.logger.LogInfo(ctx, "SubCategory updated successfully", map[string]interface{}{
		"subcategory_id":   subcategory.ID,
		"subcategory_name": subcategory.Name,
	})

	response.Success(c, subcategory)
}

// DeleteSubCategory godoc
// @Summary Delete a subcategory
// @Description Delete a menu subcategory by ID
// @Tags SubCategories
// @Accept json
// @Produce json
// @Param id path int true "SubCategory ID"
// @Success 204
// @Failure 400 {object} response.APIResponse
// @Failure 404 {object} response.APIResponse
// @Failure 500 {object} response.APIResponse
// @Router /v1/subcategories/{id} [delete]
func (h *SubCategoryHandler) Delete(c *gin.Context) {
	ctx := c.Request.Context()

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		response.BadRequest(c, "Invalid subcategory ID", "ID must be a positive integer")
		return
	}

	// Check if subcategory exists
	subcategory, err := h.service.GetByID(ctx, uint(id))
	if err != nil {
		h.logger.LogError(ctx, err, "Failed to get subcategory", map[string]interface{}{
			"subcategory_id": id,
		})
		response.Error(c, appErrors.WrapInternalError(err, "Failed to get subcategory"))
		return
	}

	if subcategory == nil {
		response.NotFound(c, "SubCategory")
		return
	}

	if err := h.service.Delete(ctx, uint(id)); err != nil {
		h.logger.LogError(ctx, err, "Failed to delete subcategory", map[string]interface{}{
			"subcategory_id": id,
		})
		response.Error(c, appErrors.WrapInternalError(err, "Failed to delete subcategory"))
		return
	}

	h.logger.LogInfo(ctx, "SubCategory deleted successfully", map[string]interface{}{
		"subcategory_id":   id,
		"subcategory_name": subcategory.Name,
	})

	response.NoContent(c)
}

// ToggleSubCategoryActive godoc
// @Summary Toggle subcategory active status
// @Description Toggle the active status of a subcategory
// @Tags SubCategories
// @Accept json
// @Produce json
// @Param id path int true "SubCategory ID"
// @Success 200 {object} entities.SubCategory
// @Failure 400 {object} response.APIResponse
// @Failure 404 {object} response.APIResponse
// @Failure 500 {object} response.APIResponse
// @Router /v1/subcategories/{id}/toggle-active [patch]
func (h *SubCategoryHandler) ToggleActive(c *gin.Context) {
	ctx := c.Request.Context()

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		response.BadRequest(c, "Invalid subcategory ID", "ID must be a positive integer")
		return
	}

	// Check if subcategory exists
	subcategory, err := h.service.GetByID(ctx, uint(id))
	if err != nil {
		h.logger.LogError(ctx, err, "Failed to get subcategory", map[string]interface{}{
			"subcategory_id": id,
		})
		response.Error(c, appErrors.WrapInternalError(err, "Failed to get subcategory"))
		return
	}

	if subcategory == nil {
		response.NotFound(c, "SubCategory")
		return
	}

	if err := h.service.ToggleActive(ctx, uint(id)); err != nil {
		h.logger.LogError(ctx, err, "Failed to toggle subcategory active status", map[string]interface{}{
			"subcategory_id": id,
		})
		response.Error(c, appErrors.WrapInternalError(err, "Failed to toggle subcategory active status"))
		return
	}

	// Get updated subcategory
	updatedSubCategory, err := h.service.GetByID(ctx, uint(id))
	if err != nil {
		h.logger.LogError(ctx, err, "Failed to get updated subcategory", map[string]interface{}{
			"subcategory_id": id,
		})
		response.Error(c, appErrors.WrapInternalError(err, "Failed to get updated subcategory"))
		return
	}

	h.logger.LogInfo(ctx, "SubCategory active status toggled successfully", map[string]interface{}{
		"subcategory_id": id,
		"new_status":     updatedSubCategory.Active,
	})

	response.Success(c, updatedSubCategory)
}

// UpdateSubCategoryDisplayOrder godoc
// @Summary Update subcategory display order
// @Description Update the display order of a subcategory
// @Tags SubCategories
// @Accept json
// @Produce json
// @Param id path int true "SubCategory ID"
// @Param order body UpdateDisplayOrderRequest true "Display order data"
// @Success 200 {object} entities.SubCategory
// @Failure 400 {object} response.APIResponse
// @Failure 404 {object} response.APIResponse
// @Failure 500 {object} response.APIResponse
// @Router /v1/subcategories/{id}/display-order [patch]
func (h *SubCategoryHandler) UpdateDisplayOrder(c *gin.Context) {
	ctx := c.Request.Context()

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		response.BadRequest(c, "Invalid subcategory ID", "ID must be a positive integer")
		return
	}

	var req UpdateDisplayOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, "Invalid request data", err.Error())
		return
	}

	// Check if subcategory exists
	subcategory, err := h.service.GetByID(ctx, uint(id))
	if err != nil {
		h.logger.LogError(ctx, err, "Failed to get subcategory", map[string]interface{}{
			"subcategory_id": id,
		})
		response.Error(c, appErrors.WrapInternalError(err, "Failed to get subcategory"))
		return
	}

	if subcategory == nil {
		response.NotFound(c, "SubCategory")
		return
	}

	if err := h.service.UpdateDisplayOrder(ctx, uint(id), req.DisplayOrder); err != nil {
		h.logger.LogError(ctx, err, "Failed to update subcategory display order", map[string]interface{}{
			"subcategory_id": id,
			"display_order":  req.DisplayOrder,
		})
		response.Error(c, appErrors.WrapInternalError(err, "Failed to update subcategory display order"))
		return
	}

	// Get updated subcategory
	updatedSubCategory, err := h.service.GetByID(ctx, uint(id))
	if err != nil {
		h.logger.LogError(ctx, err, "Failed to get updated subcategory", map[string]interface{}{
			"subcategory_id": id,
		})
		response.Error(c, appErrors.WrapInternalError(err, "Failed to get updated subcategory"))
		return
	}

	h.logger.LogInfo(ctx, "SubCategory display order updated successfully", map[string]interface{}{
		"subcategory_id": id,
		"display_order":  req.DisplayOrder,
	})

	response.Success(c, updatedSubCategory)
}

