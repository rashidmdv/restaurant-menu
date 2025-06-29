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

type ItemHandler struct {
	service           services.ItemService
	subCategoryService services.SubCategoryService
	logger            *logger.Logger
}

type CreateItemRequest struct {
	Name          string                  `json:"name" binding:"required,min=1,max=150"`
	Description   string                  `json:"description"`
	Price         float64                 `json:"price" binding:"required,min=0"`
	Currency      string                  `json:"currency"`
	DietaryInfo   entities.DietaryInfo    `json:"dietary_info"`
	ImageURL      string                  `json:"image_url"`
	SubCategoryID uint                    `json:"sub_category_id" binding:"required"`
	Available     *bool                   `json:"available"`
	DisplayOrder  int                     `json:"display_order"`
}

type UpdateItemRequest struct {
	Name          string                  `json:"name" binding:"required,min=1,max=150"`
	Description   string                  `json:"description"`
	Price         float64                 `json:"price" binding:"required,min=0"`
	Currency      string                  `json:"currency"`
	DietaryInfo   entities.DietaryInfo    `json:"dietary_info"`
	ImageURL      string                  `json:"image_url"`
	SubCategoryID uint                    `json:"sub_category_id" binding:"required"`
	Available     *bool                   `json:"available"`
	DisplayOrder  int                     `json:"display_order"`
}

type UpdatePriceRequest struct {
	Price float64 `json:"price" binding:"required,min=0"`
}


func NewItemHandler(service services.ItemService, subCategoryService services.SubCategoryService, logger *logger.Logger) *ItemHandler {
	return &ItemHandler{
		service:           service,
		subCategoryService: subCategoryService,
		logger:            logger,
	}
}

// GetAllItems godoc
// @Summary List all items
// @Description Get all menu items with optional filtering and pagination
// @Tags Items
// @Accept json
// @Produce json
// @Param sub_category_id query int false "Filter by subcategory ID"
// @Param category_id query int false "Filter by category ID"
// @Param available query boolean false "Filter by availability status"
// @Param min_price query number false "Minimum price filter"
// @Param max_price query number false "Maximum price filter"
// @Param search query string false "Search in name and description"
// @Param limit query int false "Number of items to return"
// @Param offset query int false "Number of items to skip"
// @Param order_by query string false "Field to order by"
// @Param order_dir query string false "Order direction (ASC/DESC)"
// @Param include_count query boolean false "Include total count"
// @Success 200 {array} entities.Item
// @Failure 500 {object} response.APIResponse
// @Router /v1/items [get]
func (h *ItemHandler) GetAll(c *gin.Context) {
	ctx := c.Request.Context()

	// Parse query parameters
	filter := entities.ItemFilter{
		Limit:        utils.ParseInt(c.Query("limit"), 10),
		Offset:       utils.ParseInt(c.Query("offset"), 0),
		OrderBy:      c.DefaultQuery("order_by", "display_order"),
		OrderDir:     c.DefaultQuery("order_dir", "ASC"),
		Search:       c.Query("search"),
		IncludeCount: c.Query("include_count") == "true",
	}

	if subCategoryID := c.Query("sub_category_id"); subCategoryID != "" {
		if id, err := strconv.ParseUint(subCategoryID, 10, 32); err == nil {
			filter.SubCategoryID = utils.UintPtr(uint(id))
		}
	}

	if categoryID := c.Query("category_id"); categoryID != "" {
		if id, err := strconv.ParseUint(categoryID, 10, 32); err == nil {
			filter.CategoryID = utils.UintPtr(uint(id))
		}
	}

	if available := c.Query("available"); available != "" {
		if available == "true" {
			filter.Available = utils.BoolPtr(true)
		} else if available == "false" {
			filter.Available = utils.BoolPtr(false)
		}
	}

	if minPrice := c.Query("min_price"); minPrice != "" {
		if price, err := strconv.ParseFloat(minPrice, 64); err == nil {
			filter.MinPrice = &price
		}
	}

	if maxPrice := c.Query("max_price"); maxPrice != "" {
		if price, err := strconv.ParseFloat(maxPrice, 64); err == nil {
			filter.MaxPrice = &price
		}
	}

	items, pagination, err := h.service.GetAll(ctx, filter)
	if err != nil {
		h.logger.LogError(ctx, err, "Failed to get items", nil)
		response.Error(c, appErrors.WrapInternalError(err, "Failed to get items"))
		return
	}

	if filter.IncludeCount && pagination != nil {
		response.SuccessWithPagination(c, items, pagination)
	} else {
		response.Success(c, items)
	}
}

// GetItemByID godoc
// @Summary Get item by ID
// @Description Get a specific menu item by its ID
// @Tags Items
// @Accept json
// @Produce json
// @Param id path int true "Item ID"
// @Success 200 {object} entities.Item
// @Failure 400 {object} response.APIResponse
// @Failure 404 {object} response.APIResponse
// @Failure 500 {object} response.APIResponse
// @Router /v1/items/{id} [get]
func (h *ItemHandler) GetByID(c *gin.Context) {
	ctx := c.Request.Context()

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		response.BadRequest(c, "Invalid item ID", "ID must be a positive integer")
		return
	}

	item, err := h.service.GetByID(ctx, uint(id))
	if err != nil {
		h.logger.LogError(ctx, err, "Failed to get item", map[string]interface{}{
			"item_id": id,
		})
		response.Error(c, appErrors.WrapInternalError(err, "Failed to get item"))
		return
	}

	if item == nil {
		response.NotFound(c, "Item")
		return
	}

	response.Success(c, item)
}

// CreateItem godoc
// @Summary Create a new item
// @Description Create a new menu item
// @Tags Items
// @Accept json
// @Produce json
// @Param item body CreateItemRequest true "Item data"
// @Success 201 {object} entities.Item
// @Failure 400 {object} response.APIResponse
// @Failure 409 {object} response.APIResponse
// @Failure 500 {object} response.APIResponse
// @Router /v1/items [post]
func (h *ItemHandler) Create(c *gin.Context) {
	ctx := c.Request.Context()

	var req CreateItemRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, "Invalid request data", err.Error())
		return
	}

	// Validate subcategory exists
	subCategory, err := h.subCategoryService.GetByID(ctx, req.SubCategoryID)
	if err != nil {
		h.logger.LogError(ctx, err, "Failed to validate subcategory", map[string]interface{}{
			"sub_category_id": req.SubCategoryID,
		})
		response.Error(c, appErrors.WrapInternalError(err, "Failed to validate subcategory"))
		return
	}

	if subCategory == nil {
		response.BadRequest(c, "Invalid subcategory ID", "SubCategory does not exist")
		return
	}

	// Set default values
	if req.Currency == "" {
		req.Currency = "AED"
	}

	item := &entities.Item{
		Name:          req.Name,
		Description:   req.Description,
		Price:         req.Price,
		Currency:      req.Currency,
		DietaryInfo:   req.DietaryInfo,
		ImageURL:      req.ImageURL,
		SubCategoryID: req.SubCategoryID,
		Available:     true,
		DisplayOrder:  req.DisplayOrder,
	}

	if req.Available != nil {
		item.Available = *req.Available
	}

	if err := h.service.Create(ctx, item); err != nil {
		h.logger.LogError(ctx, err, "Failed to create item", map[string]interface{}{
			"item_name":       req.Name,
			"sub_category_id": req.SubCategoryID,
		})
		response.Error(c, appErrors.WrapInternalError(err, "Failed to create item"))
		return
	}

	h.logger.LogInfo(ctx, "Item created successfully", map[string]interface{}{
		"item_id":         item.ID,
		"item_name":       item.Name,
		"sub_category_id": item.SubCategoryID,
	})

	response.Created(c, item)
}

// UpdateItem godoc
// @Summary Update an item
// @Description Update an existing menu item
// @Tags Items
// @Accept json
// @Produce json
// @Param id path int true "Item ID"
// @Param item body UpdateItemRequest true "Item data"
// @Success 200 {object} entities.Item
// @Failure 400 {object} response.APIResponse
// @Failure 404 {object} response.APIResponse
// @Failure 500 {object} response.APIResponse
// @Router /v1/items/{id} [put]
func (h *ItemHandler) Update(c *gin.Context) {
	ctx := c.Request.Context()

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		response.BadRequest(c, "Invalid item ID", "ID must be a positive integer")
		return
	}

	var req UpdateItemRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, "Invalid request data", err.Error())
		return
	}

	// Get existing item
	item, err := h.service.GetByID(ctx, uint(id))
	if err != nil {
		h.logger.LogError(ctx, err, "Failed to get item", map[string]interface{}{
			"item_id": id,
		})
		response.Error(c, appErrors.WrapInternalError(err, "Failed to get item"))
		return
	}

	if item == nil {
		response.NotFound(c, "Item")
		return
	}

	// Validate subcategory exists
	subCategory, err := h.subCategoryService.GetByID(ctx, req.SubCategoryID)
	if err != nil {
		h.logger.LogError(ctx, err, "Failed to validate subcategory", map[string]interface{}{
			"sub_category_id": req.SubCategoryID,
		})
		response.Error(c, appErrors.WrapInternalError(err, "Failed to validate subcategory"))
		return
	}

	if subCategory == nil {
		response.BadRequest(c, "Invalid subcategory ID", "SubCategory does not exist")
		return
	}

	// Set default values
	if req.Currency == "" {
		req.Currency = "AED"
	}

	// Update fields
	item.Name = req.Name
	item.Description = req.Description
	item.Price = req.Price
	item.Currency = req.Currency
	item.DietaryInfo = req.DietaryInfo
	item.ImageURL = req.ImageURL
	item.SubCategoryID = req.SubCategoryID
	item.DisplayOrder = req.DisplayOrder

	if req.Available != nil {
		item.Available = *req.Available
	}

	if err := h.service.Update(ctx, uint(id), item); err != nil {
		h.logger.LogError(ctx, err, "Failed to update item", map[string]interface{}{
			"item_id":   id,
			"item_name": req.Name,
		})
		response.Error(c, appErrors.WrapInternalError(err, "Failed to update item"))
		return
	}

	h.logger.LogInfo(ctx, "Item updated successfully", map[string]interface{}{
		"item_id":   item.ID,
		"item_name": item.Name,
	})

	response.Success(c, item)
}

// DeleteItem godoc
// @Summary Delete an item
// @Description Delete a menu item by ID
// @Tags Items
// @Accept json
// @Produce json
// @Param id path int true "Item ID"
// @Success 204
// @Failure 400 {object} response.APIResponse
// @Failure 404 {object} response.APIResponse
// @Failure 500 {object} response.APIResponse
// @Router /v1/items/{id} [delete]
func (h *ItemHandler) Delete(c *gin.Context) {
	ctx := c.Request.Context()

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		response.BadRequest(c, "Invalid item ID", "ID must be a positive integer")
		return
	}

	// Check if item exists
	item, err := h.service.GetByID(ctx, uint(id))
	if err != nil {
		h.logger.LogError(ctx, err, "Failed to get item", map[string]interface{}{
			"item_id": id,
		})
		response.Error(c, appErrors.WrapInternalError(err, "Failed to get item"))
		return
	}

	if item == nil {
		response.NotFound(c, "Item")
		return
	}

	if err := h.service.Delete(ctx, uint(id)); err != nil {
		h.logger.LogError(ctx, err, "Failed to delete item", map[string]interface{}{
			"item_id": id,
		})
		response.Error(c, appErrors.WrapInternalError(err, "Failed to delete item"))
		return
	}

	h.logger.LogInfo(ctx, "Item deleted successfully", map[string]interface{}{
		"item_id":   id,
		"item_name": item.Name,
	})

	response.NoContent(c)
}

// ToggleItemAvailable godoc
// @Summary Toggle item availability
// @Description Toggle the availability status of an item
// @Tags Items
// @Accept json
// @Produce json
// @Param id path int true "Item ID"
// @Success 200 {object} entities.Item
// @Failure 400 {object} response.APIResponse
// @Failure 404 {object} response.APIResponse
// @Failure 500 {object} response.APIResponse
// @Router /v1/items/{id}/toggle-available [patch]
func (h *ItemHandler) ToggleAvailable(c *gin.Context) {
	ctx := c.Request.Context()

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		response.BadRequest(c, "Invalid item ID", "ID must be a positive integer")
		return
	}

	// Check if item exists
	item, err := h.service.GetByID(ctx, uint(id))
	if err != nil {
		h.logger.LogError(ctx, err, "Failed to get item", map[string]interface{}{
			"item_id": id,
		})
		response.Error(c, appErrors.WrapInternalError(err, "Failed to get item"))
		return
	}

	if item == nil {
		response.NotFound(c, "Item")
		return
	}

	if err := h.service.ToggleAvailable(ctx, uint(id)); err != nil {
		h.logger.LogError(ctx, err, "Failed to toggle item availability", map[string]interface{}{
			"item_id": id,
		})
		response.Error(c, appErrors.WrapInternalError(err, "Failed to toggle item availability"))
		return
	}

	// Get updated item
	updatedItem, err := h.service.GetByID(ctx, uint(id))
	if err != nil {
		h.logger.LogError(ctx, err, "Failed to get updated item", map[string]interface{}{
			"item_id": id,
		})
		response.Error(c, appErrors.WrapInternalError(err, "Failed to get updated item"))
		return
	}

	h.logger.LogInfo(ctx, "Item availability toggled successfully", map[string]interface{}{
		"item_id":      id,
		"new_status":   updatedItem.Available,
	})

	response.Success(c, updatedItem)
}

// UpdateItemDisplayOrder godoc
// @Summary Update item display order
// @Description Update the display order of an item
// @Tags Items
// @Accept json
// @Produce json
// @Param id path int true "Item ID"
// @Param order body UpdateDisplayOrderRequest true "Display order data"
// @Success 200 {object} entities.Item
// @Failure 400 {object} response.APIResponse
// @Failure 404 {object} response.APIResponse
// @Failure 500 {object} response.APIResponse
// @Router /v1/items/{id}/display-order [patch]
func (h *ItemHandler) UpdateDisplayOrder(c *gin.Context) {
	ctx := c.Request.Context()

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		response.BadRequest(c, "Invalid item ID", "ID must be a positive integer")
		return
	}

	var req UpdateDisplayOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, "Invalid request data", err.Error())
		return
	}

	// Check if item exists
	item, err := h.service.GetByID(ctx, uint(id))
	if err != nil {
		h.logger.LogError(ctx, err, "Failed to get item", map[string]interface{}{
			"item_id": id,
		})
		response.Error(c, appErrors.WrapInternalError(err, "Failed to get item"))
		return
	}

	if item == nil {
		response.NotFound(c, "Item")
		return
	}

	if err := h.service.UpdateDisplayOrder(ctx, uint(id), req.DisplayOrder); err != nil {
		h.logger.LogError(ctx, err, "Failed to update item display order", map[string]interface{}{
			"item_id":       id,
			"display_order": req.DisplayOrder,
		})
		response.Error(c, appErrors.WrapInternalError(err, "Failed to update item display order"))
		return
	}

	// Get updated item
	updatedItem, err := h.service.GetByID(ctx, uint(id))
	if err != nil {
		h.logger.LogError(ctx, err, "Failed to get updated item", map[string]interface{}{
			"item_id": id,
		})
		response.Error(c, appErrors.WrapInternalError(err, "Failed to get updated item"))
		return
	}

	h.logger.LogInfo(ctx, "Item display order updated successfully", map[string]interface{}{
		"item_id":       id,
		"display_order": req.DisplayOrder,
	})

	response.Success(c, updatedItem)
}

// UpdateItemPrice godoc
// @Summary Update item price
// @Description Update the price of an item
// @Tags Items
// @Accept json
// @Produce json
// @Param id path int true "Item ID"
// @Param price body UpdatePriceRequest true "Price data"
// @Success 200 {object} entities.Item
// @Failure 400 {object} response.APIResponse
// @Failure 404 {object} response.APIResponse
// @Failure 500 {object} response.APIResponse
// @Router /v1/items/{id}/price [patch]
func (h *ItemHandler) UpdatePrice(c *gin.Context) {
	ctx := c.Request.Context()

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		response.BadRequest(c, "Invalid item ID", "ID must be a positive integer")
		return
	}

	var req UpdatePriceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, "Invalid request data", err.Error())
		return
	}

	// Check if item exists
	item, err := h.service.GetByID(ctx, uint(id))
	if err != nil {
		h.logger.LogError(ctx, err, "Failed to get item", map[string]interface{}{
			"item_id": id,
		})
		response.Error(c, appErrors.WrapInternalError(err, "Failed to get item"))
		return
	}

	if item == nil {
		response.NotFound(c, "Item")
		return
	}

	if err := h.service.UpdatePrice(ctx, uint(id), req.Price); err != nil {
		h.logger.LogError(ctx, err, "Failed to update item price", map[string]interface{}{
			"item_id": id,
			"price":   req.Price,
		})
		response.Error(c, appErrors.WrapInternalError(err, "Failed to update item price"))
		return
	}

	// Get updated item
	updatedItem, err := h.service.GetByID(ctx, uint(id))
	if err != nil {
		h.logger.LogError(ctx, err, "Failed to get updated item", map[string]interface{}{
			"item_id": id,
		})
		response.Error(c, appErrors.WrapInternalError(err, "Failed to get updated item"))
		return
	}

	h.logger.LogInfo(ctx, "Item price updated successfully", map[string]interface{}{
		"item_id": id,
		"price":   req.Price,
	})

	response.Success(c, updatedItem)
}

// SearchItems godoc
// @Summary Search items
// @Description Search menu items by query with optional filters
// @Tags Items
// @Accept json
// @Produce json
// @Param q query string true "Search query"
// @Param sub_category_id query int false "Filter by subcategory ID"
// @Param category_id query int false "Filter by category ID"
// @Param available query boolean false "Filter by availability status"
// @Param min_price query number false "Minimum price filter"
// @Param max_price query number false "Maximum price filter"
// @Param limit query int false "Number of items to return (max 50)"
// @Param offset query int false "Number of items to skip"
// @Success 200 {object} response.APIResponse
// @Failure 400 {object} response.APIResponse
// @Failure 500 {object} response.APIResponse
// @Router /v1/items/search [get]
func (h *ItemHandler) Search(c *gin.Context) {
	ctx := c.Request.Context()

	query := c.Query("q")
	if query == "" {
		response.BadRequest(c, "Search query is required", "Provide 'q' parameter with search term")
		return
	}

	// Parse query parameters for filters
	filter := entities.ItemFilter{
		Limit:        utils.ParseInt(c.Query("limit"), 20),
		Offset:       utils.ParseInt(c.Query("offset"), 0),
		IncludeCount: true,
	}

	if subCategoryID := c.Query("sub_category_id"); subCategoryID != "" {
		if id, err := strconv.ParseUint(subCategoryID, 10, 32); err == nil {
			filter.SubCategoryID = utils.UintPtr(uint(id))
		}
	}

	if categoryID := c.Query("category_id"); categoryID != "" {
		if id, err := strconv.ParseUint(categoryID, 10, 32); err == nil {
			filter.CategoryID = utils.UintPtr(uint(id))
		}
	}

	if available := c.Query("available"); available != "" {
		if available == "true" {
			filter.Available = utils.BoolPtr(true)
		} else if available == "false" {
			filter.Available = utils.BoolPtr(false)
		}
	}

	if minPrice := c.Query("min_price"); minPrice != "" {
		if price, err := strconv.ParseFloat(minPrice, 64); err == nil {
			filter.MinPrice = &price
		}
	}

	if maxPrice := c.Query("max_price"); maxPrice != "" {
		if price, err := strconv.ParseFloat(maxPrice, 64); err == nil {
			filter.MaxPrice = &price
		}
	}

	items, pagination, err := h.service.Search(ctx, query, filter)
	if err != nil {
		h.logger.LogError(ctx, err, "Failed to search items", map[string]interface{}{
			"search_query": query,
		})
		response.Error(c, appErrors.WrapInternalError(err, "Failed to search items"))
		return
	}

	response.SuccessWithPagination(c, items, pagination)
}

// GetFeaturedItems godoc
// @Summary Get featured items
// @Description Get a list of featured menu items
// @Tags Items
// @Accept json
// @Produce json
// @Param limit query int false "Number of items to return (max 50, default 10)"
// @Success 200 {array} entities.Item
// @Failure 500 {object} response.APIResponse
// @Router /v1/items/featured [get]
func (h *ItemHandler) GetFeatured(c *gin.Context) {
	ctx := c.Request.Context()

	limit := utils.ParseInt(c.Query("limit"), 10)
	if limit <= 0 || limit > 50 {
		limit = 10
	}

	items, err := h.service.GetFeatured(ctx, limit)
	if err != nil {
		h.logger.LogError(ctx, err, "Failed to get featured items", map[string]interface{}{
			"limit": limit,
		})
		response.Error(c, appErrors.WrapInternalError(err, "Failed to get featured items"))
		return
	}

	response.Success(c, items)
}