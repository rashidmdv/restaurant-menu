package handlers

import (
	"path/filepath"
	"strings"
	"time"

	"github.com/gin-gonic/gin"

	"restaurant-menu-api/internal/domain/interfaces"
	"restaurant-menu-api/pkg/logger"
	"restaurant-menu-api/pkg/response"
	appErrors "restaurant-menu-api/pkg/errors"
)

type UploadHandler struct {
	storageClient interfaces.StorageInterface
	logger        *logger.Logger
}

type UploadImageResponse struct {
	Key      string `json:"key"`
	URL      string `json:"url"`
	Bucket   string `json:"bucket"`
	Size     int64  `json:"size"`
	MimeType string `json:"mime_type"`
}

type PresignedURLRequest struct {
	Key         string `json:"key" binding:"required"`
	ContentType string `json:"content_type" binding:"required"`
	ExpiresIn   int    `json:"expires_in"` // minutes, default 15
}

type PresignedURLResponse struct {
	URL       string `json:"url"`
	Key       string `json:"key"`
	ExpiresIn int    `json:"expires_in"`
}

func NewUploadHandler(storageClient interfaces.StorageInterface, logger *logger.Logger) *UploadHandler {
	return &UploadHandler{
		storageClient: storageClient,
		logger:        logger,
	}
}

// UploadImage godoc
// @Summary Upload an image
// @Description Upload an image file to cloud storage
// @Tags Upload
// @Accept multipart/form-data
// @Produce json
// @Param image formData file true "Image file"
// @Param folder formData string false "Upload folder (default: items)"
// @Success 201 {object} UploadImageResponse
// @Failure 400 {object} response.APIResponse
// @Failure 500 {object} response.APIResponse
// @Router /v1/upload [post]
func (h *UploadHandler) UploadImage(c *gin.Context) {
	ctx := c.Request.Context()

	// Parse multipart form
	if err := c.Request.ParseMultipartForm(10 << 20); err != nil { // 10MB limit
		response.BadRequest(c, "Failed to parse form", err.Error())
		return
	}

	// Get file from form
	file, header, err := c.Request.FormFile("image")
	if err != nil {
		response.BadRequest(c, "No image file provided", err.Error())
		return
	}
	defer file.Close()

	// Get folder from form (optional)
	folder := c.DefaultPostForm("folder", "items")

	// Prepare upload options
	options := interfaces.UploadOptions{
		Folder: folder,
		ACL:    "public-read",
	}

	// Upload file using storage interface
	result, err := h.storageClient.UploadFile(ctx, file, header, options)
	if err != nil {
		h.logger.LogError(ctx, err, "Failed to upload image", map[string]interface{}{
			"filename": header.Filename,
			"size":     header.Size,
			"folder":   folder,
		})
		response.Error(c, err)
		return
	}

	h.logger.LogInfo(ctx, "Image uploaded successfully", map[string]interface{}{
		"key":      result.Key,
		"url":      result.URL,
		"filename": header.Filename,
		"size":     result.Size,
	})

	response.Created(c, UploadImageResponse{
		Key:      result.Key,
		URL:      result.URL,
		Bucket:   result.Bucket,
		Size:     result.Size,
		MimeType: result.MimeType,
	})
}

// DeleteImage godoc
// @Summary Delete an image
// @Description Delete an image file from cloud storage
// @Tags Upload
// @Accept json
// @Produce json
// @Param key path string true "Image key (storage object key)"
// @Success 204
// @Failure 400 {object} response.APIResponse
// @Failure 404 {object} response.APIResponse
// @Failure 500 {object} response.APIResponse
// @Router /v1/upload/{key} [delete]
func (h *UploadHandler) DeleteImage(c *gin.Context) {
	ctx := c.Request.Context()

	key := c.Param("key")
	if key == "" {
		response.BadRequest(c, "Image key is required", "")
		return
	}

	// Decode key if it's URL encoded
	key = strings.ReplaceAll(key, "%2F", "/")

	// Check if file exists
	exists, err := h.storageClient.FileExists(ctx, key)
	if err != nil {
		h.logger.LogError(ctx, err, "Failed to check if file exists", map[string]interface{}{
			"key": key,
		})
		response.Error(c, err)
		return
	}

	if !exists {
		response.NotFound(c, "Image")
		return
	}

	// Delete file
	if err := h.storageClient.DeleteFile(ctx, key); err != nil {
		h.logger.LogError(ctx, err, "Failed to delete image", map[string]interface{}{
			"key": key,
		})
		response.Error(c, err)
		return
	}

	h.logger.LogInfo(ctx, "Image deleted successfully", map[string]interface{}{
		"key": key,
	})

	response.NoContent(c)
}

// GetPresignedURL godoc
// @Summary Get presigned upload URL
// @Description Generate a presigned URL for direct file upload to cloud storage
// @Tags Upload
// @Accept json
// @Produce json
// @Param request body PresignedURLRequest true "Presigned URL request"
// @Success 200 {object} PresignedURLResponse
// @Failure 400 {object} response.APIResponse
// @Failure 500 {object} response.APIResponse
// @Router /v1/upload/presigned-url [post]
func (h *UploadHandler) GetPresignedURL(c *gin.Context) {
	ctx := c.Request.Context()

	var req PresignedURLRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, "Invalid request data", err.Error())
		return
	}

	// Validate content type
	if !h.isValidImageContentType(req.ContentType) {
		response.BadRequest(c, "Invalid content type", "Only image files are allowed")
		return
	}

	// Set default expiry
	if req.ExpiresIn == 0 {
		req.ExpiresIn = 15 // 15 minutes
	}

	// Generate presigned URL
	options := interfaces.PresignedURLOptions{
		Expires:     duration(req.ExpiresIn),
		ContentType: req.ContentType,
	}

	url, err := h.storageClient.GetPresignedUploadURL(ctx, req.Key, req.ContentType, options)
	if err != nil {
		h.logger.LogError(ctx, err, "Failed to generate presigned URL", map[string]interface{}{
			"key":          req.Key,
			"content_type": req.ContentType,
		})
		response.Error(c, err)
		return
	}

	h.logger.LogInfo(ctx, "Presigned URL generated successfully", map[string]interface{}{
		"key":        req.Key,
		"expires_in": req.ExpiresIn,
	})

	response.Success(c, PresignedURLResponse{
		URL:       url,
		Key:       req.Key,
		ExpiresIn: req.ExpiresIn,
	})
}

// GetImageInfo godoc
// @Summary Get image information
// @Description Get metadata and information about an uploaded image
// @Tags Upload
// @Accept json
// @Produce json
// @Param key path string true "Image key (storage object key)"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} response.APIResponse
// @Failure 404 {object} response.APIResponse
// @Failure 500 {object} response.APIResponse
// @Router /v1/upload/{key}/info [get]
func (h *UploadHandler) GetImageInfo(c *gin.Context) {
	ctx := c.Request.Context()

	key := c.Param("key")
	if key == "" {
		response.BadRequest(c, "Image key is required", "")
		return
	}

	// Decode key if it's URL encoded
	key = strings.ReplaceAll(key, "%2F", "/")

	// Get file info
	info, err := h.storageClient.GetFileInfo(ctx, key)
	if err != nil {
		if appErr, ok := appErrors.IsAppError(err); ok && appErr.Type == appErrors.NotFoundError {
			response.NotFound(c, "Image")
			return
		}
		
		h.logger.LogError(ctx, err, "Failed to get image info", map[string]interface{}{
			"key": key,
		})
		response.Error(c, err)
		return
	}

	response.Success(c, map[string]interface{}{
		"key":           key,
		"size":          info.Size,
		"content_type":  info.MimeType,
		"last_modified": info.LastModified,
		"etag":          info.ETag,
		"metadata":      info.Metadata,
		"url":           info.URL,
		"bucket":        info.Bucket,
	})
}

func (h *UploadHandler) isValidImageContentType(contentType string) bool {
	validTypes := []string{
		"image/jpeg",
		"image/png",
		"image/webp",
		"image/gif",
	}

	for _, validType := range validTypes {
		if contentType == validType {
			return true
		}
	}

	return false
}

func (h *UploadHandler) isValidImageExtension(filename string) bool {
	ext := strings.ToLower(filepath.Ext(filename))
	validExtensions := []string{".jpg", ".jpeg", ".png", ".webp", ".gif"}

	for _, validExt := range validExtensions {
		if ext == validExt {
			return true
		}
	}

	return false
}

// Helper function
func duration(minutes int) time.Duration {
	return time.Duration(minutes) * time.Minute
}