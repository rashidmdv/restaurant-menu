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

func (h *ItemHandler) GetAll(c *gin.Context) {
	ctx := c.Request.Context()

	// Parse query parameters
	filter := entities.ItemFilter{
		Limit:        parseInt(c.Query("limit"), 10),
		Offset:       parseInt(c.Query("offset"), 0),
		OrderBy:      c.DefaultQuery("order_by", "display_order"),
		OrderDir:     c.DefaultQuery("order_dir", "ASC"),
		Search:       c.Query("search"),
		IncludeCount: c.Query("include_count") == "true",
	}

	if subCategoryID := c.Query("sub_category_id"); subCategoryID != "" {
		if id, err := strconv.ParseUint(subCategoryID, 10, 32); err == nil {
			filter.SubCategoryID = uintPtr(uint(id))
		}
	}

	if categoryID := c.Query("category_id"); categoryID != "" {
		if id, err := strconv.ParseUint(categoryID, 10, 32); err == nil {
			filter.CategoryID = uintPtr(uint(id))
		}
	}

	if available := c.Query("available"); available != "" {
		if available == "true" {
			filter.Available = boolPtr(true)
		} else if available == "false" {
			filter.Available = boolPtr(false)
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

func (h *ItemHandler) Search(c *gin.Context) {
	ctx := c.Request.Context()

	query := c.Query("q")
	if query == "" {
		response.BadRequest(c, "Search query is required", "Provide 'q' parameter with search term")
		return
	}

	// Parse query parameters for filters
	filter := entities.ItemFilter{
		Limit:        parseInt(c.Query("limit"), 20),
		Offset:       parseInt(c.Query("offset"), 0),
		IncludeCount: true,
	}

	if subCategoryID := c.Query("sub_category_id"); subCategoryID != "" {
		if id, err := strconv.ParseUint(subCategoryID, 10, 32); err == nil {
			filter.SubCategoryID = uintPtr(uint(id))
		}
	}

	if categoryID := c.Query("category_id"); categoryID != "" {
		if id, err := strconv.ParseUint(categoryID, 10, 32); err == nil {
			filter.CategoryID = uintPtr(uint(id))
		}
	}

	if available := c.Query("available"); available != "" {
		if available == "true" {
			filter.Available = boolPtr(true)
		} else if available == "false" {
			filter.Available = boolPtr(false)
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

func (h *ItemHandler) GetFeatured(c *gin.Context) {
	ctx := c.Request.Context()

	limit := parseInt(c.Query("limit"), 10)
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