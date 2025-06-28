package response

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"restaurant-menu-api/internal/domain/entities"
	appErrors "restaurant-menu-api/pkg/errors"
)

type APIResponse struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data,omitempty"`
	Error   *APIError   `json:"error,omitempty"`
	Meta    *Meta       `json:"meta,omitempty"`
}

type APIError struct {
	Code    string `json:"code"`
	Message string `json:"message"`
	Details string `json:"details,omitempty"`
}

type Meta struct {
	Pagination *entities.Pagination `json:"pagination,omitempty"`
	Total      int64                `json:"total,omitempty"`
	RequestID  string               `json:"request_id,omitempty"`
	Timestamp  string               `json:"timestamp,omitempty"`
}

func Success(c *gin.Context, data interface{}) {
	c.JSON(http.StatusOK, APIResponse{
		Success: true,
		Data:    data,
		Meta:    getMeta(c),
	})
}

func SuccessWithPagination(c *gin.Context, data interface{}, pagination *entities.Pagination) {
	meta := getMeta(c)
	meta.Pagination = pagination
	
	c.JSON(http.StatusOK, APIResponse{
		Success: true,
		Data:    data,
		Meta:    meta,
	})
}

func SuccessWithMeta(c *gin.Context, data interface{}, meta *Meta) {
	if meta == nil {
		meta = getMeta(c)
	} else {
		// Merge with default meta
		defaultMeta := getMeta(c)
		if meta.RequestID == "" {
			meta.RequestID = defaultMeta.RequestID
		}
		if meta.Timestamp == "" {
			meta.Timestamp = defaultMeta.Timestamp
		}
	}

	c.JSON(http.StatusOK, APIResponse{
		Success: true,
		Data:    data,
		Meta:    meta,
	})
}

func Created(c *gin.Context, data interface{}) {
	c.JSON(http.StatusCreated, APIResponse{
		Success: true,
		Data:    data,
		Meta:    getMeta(c),
	})
}

func NoContent(c *gin.Context) {
	c.JSON(http.StatusNoContent, APIResponse{
		Success: true,
		Meta:    getMeta(c),
	})
}

func Error(c *gin.Context, err error) {
	var statusCode int
	var apiError *APIError

	if appErr, ok := appErrors.IsAppError(err); ok {
		statusCode = appErr.StatusCode
		apiError = &APIError{
			Code:    string(appErr.Type),
			Message: appErr.Message,
			Details: appErr.Details,
		}
	} else {
		statusCode = http.StatusInternalServerError
		apiError = &APIError{
			Code:    string(appErrors.InternalError),
			Message: "Internal server error",
			Details: "",
		}
	}

	c.JSON(statusCode, APIResponse{
		Success: false,
		Error:   apiError,
		Meta:    getMeta(c),
	})
}

func BadRequest(c *gin.Context, message, details string) {
	c.JSON(http.StatusBadRequest, APIResponse{
		Success: false,
		Error: &APIError{
			Code:    string(appErrors.BadRequestError),
			Message: message,
			Details: details,
		},
		Meta: getMeta(c),
	})
}

func NotFound(c *gin.Context, resource string) {
	c.JSON(http.StatusNotFound, APIResponse{
		Success: false,
		Error: &APIError{
			Code:    string(appErrors.NotFoundError),
			Message: resource + " not found",
		},
		Meta: getMeta(c),
	})
}

func Unauthorized(c *gin.Context, message string) {
	if message == "" {
		message = "Unauthorized access"
	}
	
	c.JSON(http.StatusUnauthorized, APIResponse{
		Success: false,
		Error: &APIError{
			Code:    string(appErrors.UnauthorizedError),
			Message: message,
		},
		Meta: getMeta(c),
	})
}

func Forbidden(c *gin.Context, message string) {
	if message == "" {
		message = "Access forbidden"
	}
	
	c.JSON(http.StatusForbidden, APIResponse{
		Success: false,
		Error: &APIError{
			Code:    string(appErrors.ForbiddenError),
			Message: message,
		},
		Meta: getMeta(c),
	})
}

func Conflict(c *gin.Context, message string) {
	c.JSON(http.StatusConflict, APIResponse{
		Success: false,
		Error: &APIError{
			Code:    string(appErrors.ConflictError),
			Message: message,
		},
		Meta: getMeta(c),
	})
}

func ValidationError(c *gin.Context, message, details string) {
	c.JSON(http.StatusBadRequest, APIResponse{
		Success: false,
		Error: &APIError{
			Code:    string(appErrors.ValidationError),
			Message: message,
			Details: details,
		},
		Meta: getMeta(c),
	})
}

func InternalServerError(c *gin.Context, message string) {
	if message == "" {
		message = "Internal server error"
	}
	
	c.JSON(http.StatusInternalServerError, APIResponse{
		Success: false,
		Error: &APIError{
			Code:    string(appErrors.InternalError),
			Message: message,
		},
		Meta: getMeta(c),
	})
}

func getMeta(c *gin.Context) *Meta {
	meta := &Meta{}
	
	if requestID, exists := c.Get("request_id"); exists {
		if id, ok := requestID.(string); ok {
			meta.RequestID = id
		}
	}
	
	if timestamp, exists := c.Get("timestamp"); exists {
		if ts, ok := timestamp.(string); ok {
			meta.Timestamp = ts
		}
	}
	
	return meta
}