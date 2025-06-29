package handlers

import (
	"github.com/gin-gonic/gin"

	"restaurant-menu-api/internal/domain/services"
	"restaurant-menu-api/pkg/logger"
	"restaurant-menu-api/pkg/response"
)

type MenuHandler struct {
	service services.MenuService
	logger  *logger.Logger
}

func NewMenuHandler(service services.MenuService, logger *logger.Logger) *MenuHandler {
	return &MenuHandler{
		service: service,
		logger:  logger,
	}
}

// GetCompleteMenu retrieves the complete hierarchical menu
// @Summary Get complete menu
// @Description Get the complete hierarchical menu with all categories, subcategories, and items
// @Tags Menu
// @Accept json
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Failure 500 {object} response.APIResponse
// @Router /api/v1/menu [get]
func (h *MenuHandler) GetCompleteMenu(c *gin.Context) {
	ctx := c.Request.Context()

	menu, err := h.service.GetCompleteMenu(ctx)
	if err != nil {
		h.logger.LogError(ctx, err, "Failed to get complete menu", nil)
		response.Error(c, err)
		return
	}

	h.logger.LogInfo(ctx, "Complete menu retrieved successfully", map[string]interface{}{
		"categories_count": len(menu.Categories),
	})

	response.Success(c, map[string]interface{}{
		"menu":       menu,
		"categories": len(menu.Categories),
	})
}