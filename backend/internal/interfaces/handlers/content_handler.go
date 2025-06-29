package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"restaurant-menu-api/internal/domain/entities"
	"restaurant-menu-api/internal/domain/services"
	"restaurant-menu-api/pkg/logger"
	"restaurant-menu-api/pkg/response"
	"restaurant-menu-api/pkg/utils"
)

type ContentHandler struct {
	service services.ContentService
	logger  *logger.Logger
}

type CreateContentRequest struct {
	SectionName string                 `json:"section_name" binding:"required,min=1,max=50"`
	Title       string                 `json:"title"`
	Content     string                 `json:"content"`
	ImageURL    string                 `json:"image_url"`
	Metadata    map[string]interface{} `json:"metadata"`
}

type UpdateContentRequest struct {
	SectionName *string                `json:"section_name,omitempty" binding:"omitempty,min=1,max=50"`
	Title       *string                `json:"title,omitempty"`
	Content     *string                `json:"content,omitempty"`
	ImageURL    *string                `json:"image_url,omitempty"`
	Metadata    map[string]interface{} `json:"metadata,omitempty"`
	Active      *bool                  `json:"active,omitempty"`
}

func NewContentHandler(service services.ContentService, logger *logger.Logger) *ContentHandler {
	return &ContentHandler{
		service: service,
		logger:  logger,
	}
}

// GetAll retrieves all content with optional filtering and pagination
// @Summary List all content
// @Description Get all content with optional filtering and pagination
// @Tags Content
// @Accept json
// @Produce json
// @Param active query bool false "Filter by active status"
// @Param type query string false "Filter by content type"
// @Param search query string false "Search in title and content"
// @Param limit query int false "Number of items to return"
// @Param offset query int false "Number of items to skip"
// @Param order_by query string false "Field to order by"
// @Param order_dir query string false "Order direction (ASC/DESC)"
// @Success 200 {array} entities.ContentSection
// @Failure 500 {object} response.APIResponse
// @Router /api/v1/content [get]
func (h *ContentHandler) GetAll(c *gin.Context) {
	ctx := c.Request.Context()

	// Parse query parameters
	filter := entities.ContentSectionFilter{
		Active:      utils.ParseBoolPtr(c.Query("active")),
		SectionName: c.Query("section_name"),
		Search:      c.Query("search"),
		Limit:       utils.ParseInt(c.Query("limit"), 0),
		Offset:      utils.ParseInt(c.Query("offset"), 0),
		OrderBy:     c.DefaultQuery("order_by", "created_at"),
		OrderDir:    c.DefaultQuery("order_dir", "DESC"),
	}

	content, err := h.service.GetAll(ctx, filter)
	if err != nil {
		h.logger.LogError(ctx, err, "Failed to get content", nil)
		response.Error(c, err)
		return
	}

	response.Success(c, content)
}

// GetByID retrieves content by ID
// @Summary Get content by ID
// @Description Get specific content by its ID
// @Tags Content
// @Accept json
// @Produce json
// @Param id path int true "Content ID"
// @Success 200 {object} entities.ContentSection
// @Failure 404 {object} response.APIResponse
// @Failure 500 {object} response.APIResponse
// @Router /api/v1/content/{id} [get]
func (h *ContentHandler) GetByID(c *gin.Context) {
	ctx := c.Request.Context()

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		response.BadRequest(c, "Invalid content ID", err.Error())
		return
	}

	content, err := h.service.GetByID(ctx, uint(id))
	if err != nil {
		h.logger.LogError(ctx, err, "Failed to get content", map[string]interface{}{
			"content_id": id,
		})
		response.Error(c, err)
		return
	}

	response.Success(c, content)
}

// GetBySection retrieves content by section name
// @Summary Get content by section name
// @Description Get specific content by its section name
// @Tags Content
// @Accept json
// @Produce json
// @Param section path string true "Section name"
// @Success 200 {object} entities.ContentSection
// @Failure 404 {object} response.APIResponse
// @Failure 500 {object} response.APIResponse
// @Router /api/v1/content/by-section/{section} [get]
func (h *ContentHandler) GetByKey(c *gin.Context) {
	ctx := c.Request.Context()

	key := c.Param("key")
	if key == "" {
		response.BadRequest(c, "Section name is required", "")
		return
	}

	content, err := h.service.GetBySection(ctx, key)
	if err != nil {
		h.logger.LogError(ctx, err, "Failed to get content by section", map[string]interface{}{
			"section_name": key,
		})
		response.Error(c, err)
		return
	}

	response.Success(c, content)
}

// Create creates new content
// @Summary Create new content
// @Description Create new content
// @Tags Content
// @Accept json
// @Produce json
// @Param content body CreateContentRequest true "Content data"
// @Success 201 {object} entities.ContentSection
// @Failure 400 {object} response.APIResponse
// @Failure 409 {object} response.APIResponse
// @Failure 500 {object} response.APIResponse
// @Router /api/v1/content [post]
func (h *ContentHandler) Create(c *gin.Context) {
	ctx := c.Request.Context()

	var req CreateContentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, "Invalid request data", err.Error())
		return
	}

	content := &entities.ContentSection{
		SectionName: req.SectionName,
		Title:       req.Title,
		Content:     req.Content,
		ImageURL:    req.ImageURL,
		Metadata:    entities.Metadata(req.Metadata),
	}

	if err := h.service.Create(ctx, content); err != nil {
		h.logger.LogError(ctx, err, "Failed to create content", map[string]interface{}{
			"section_name": req.SectionName,
			"title":        req.Title,
		})
		response.Error(c, err)
		return
	}

	h.logger.LogInfo(ctx, "Content created successfully", map[string]interface{}{
		"content_id":      content.ID,
		"content_title":   content.Title,
		"section_name":    content.SectionName,
	})

	response.Created(c, content)
}

// Update updates existing content
// @Summary Update content
// @Description Update existing content
// @Tags Content
// @Accept json
// @Produce json
// @Param id path int true "Content ID"
// @Param content body UpdateContentRequest true "Content data"
// @Success 200 {object} entities.ContentSection
// @Failure 400 {object} response.APIResponse
// @Failure 404 {object} response.APIResponse
// @Failure 409 {object} response.APIResponse
// @Failure 500 {object} response.APIResponse
// @Router /api/v1/content/{id} [put]
func (h *ContentHandler) Update(c *gin.Context) {
	ctx := c.Request.Context()

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		response.BadRequest(c, "Invalid content ID", err.Error())
		return
	}

	var req UpdateContentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, "Invalid request data", err.Error())
		return
	}

	// Get existing content first
	existing, err := h.service.GetByID(ctx, uint(id))
	if err != nil {
		h.logger.LogError(ctx, err, "Failed to get existing content", map[string]interface{}{
			"content_id": id,
		})
		response.Error(c, err)
		return
	}

	// Update fields
	if req.SectionName != nil {
		existing.SectionName = *req.SectionName
	}
	if req.Title != nil {
		existing.Title = *req.Title
	}
	if req.Content != nil {
		existing.Content = *req.Content
	}
	if req.ImageURL != nil {
		existing.ImageURL = *req.ImageURL
	}
	if req.Metadata != nil {
		existing.Metadata = entities.Metadata(req.Metadata)
	}
	if req.Active != nil {
		existing.Active = *req.Active
	}

	if err := h.service.Update(ctx, existing); err != nil {
		h.logger.LogError(ctx, err, "Failed to update content", map[string]interface{}{
			"content_id": id,
		})
		response.Error(c, err)
		return
	}

	// Get updated content
	updatedContent, err := h.service.GetByID(ctx, uint(id))
	if err != nil {
		h.logger.LogError(ctx, err, "Failed to get updated content", map[string]interface{}{
			"content_id": id,
		})
		response.Error(c, err)
		return
	}

	h.logger.LogInfo(ctx, "Content updated successfully", map[string]interface{}{
		"content_id": id,
	})

	response.Success(c, updatedContent)
}

// Delete deletes content
// @Summary Delete content
// @Description Delete content by ID
// @Tags Content
// @Accept json
// @Produce json
// @Param id path int true "Content ID"
// @Success 204
// @Failure 404 {object} response.APIResponse
// @Failure 500 {object} response.APIResponse
// @Router /api/v1/content/{id} [delete]
func (h *ContentHandler) Delete(c *gin.Context) {
	ctx := c.Request.Context()

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		response.BadRequest(c, "Invalid content ID", err.Error())
		return
	}

	if err := h.service.Delete(ctx, uint(id)); err != nil {
		h.logger.LogError(ctx, err, "Failed to delete content", map[string]interface{}{
			"content_id": id,
		})
		response.Error(c, err)
		return
	}

	h.logger.LogInfo(ctx, "Content deleted successfully", map[string]interface{}{
		"content_id": id,
	})

	c.JSON(http.StatusNoContent, nil)
}