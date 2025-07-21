package storage

import (
	"context"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"path/filepath"
	"strings"
	"time"

	"cloud.google.com/go/storage"
	"github.com/google/uuid"
	"google.golang.org/api/iterator"
	"google.golang.org/api/option"

	"restaurant-menu-api/internal/config"
	"restaurant-menu-api/internal/domain/interfaces"
	appErrors "restaurant-menu-api/pkg/errors"
)

type GCPStorage struct {
	client     *storage.Client
	bucket     string
	bucketName string
	projectID  string
}

func NewGCPStorage(ctx context.Context, cfg *config.GCPConfig) (*GCPStorage, error) {
	var client *storage.Client
	var err error

	// Initialize client with credentials
	if cfg.ServiceAccountKey != "" {
		// Use JSON key content
		client, err = storage.NewClient(ctx, option.WithCredentialsJSON([]byte(cfg.ServiceAccountKey)))
	} else if cfg.ServiceAccountKeyPath != "" {
		// Use JSON key file path
		client, err = storage.NewClient(ctx, option.WithCredentialsFile(cfg.ServiceAccountKeyPath))
	} else {
		// Use default credentials (useful for Cloud Run, GCE, etc.)
		client, err = storage.NewClient(ctx)
	}

	if err != nil {
		return nil, fmt.Errorf("failed to create GCP Storage client: %w", err)
	}

	return &GCPStorage{
		client:     client,
		bucket:     cfg.Bucket,
		bucketName: cfg.Bucket,
		projectID:  cfg.ProjectID,
	}, nil
}

func (g *GCPStorage) Close() error {
	return g.client.Close()
}

func (g *GCPStorage) UploadFile(ctx context.Context, file multipart.File, header *multipart.FileHeader, options interfaces.UploadOptions) (*interfaces.FileMetadata, error) {
	// Validate file type
	if err := g.ValidateFileType(header.Filename, ""); err != nil {
		return nil, err
	}

	// Validate file size (10MB limit)
	if header.Size > 10*1024*1024 {
		return nil, appErrors.NewValidationError("File too large", "File size must be less than 10MB")
	}

	// Generate unique filename
	key := g.GenerateUploadKey(options.Folder, header.Filename)

	// Read file content
	fileBytes, err := io.ReadAll(file)
	if err != nil {
		return nil, appErrors.WrapInternalError(err, "Failed to read file content")
	}

	// Detect content type
	contentType := http.DetectContentType(fileBytes)
	if err := g.ValidateFileType("", contentType); err != nil {
		return nil, err
	}

	// Get object handle
	obj := g.client.Bucket(g.bucketName).Object(key)

	// Create writer
	writer := obj.NewWriter(ctx)
	writer.ContentType = contentType
	writer.Metadata = make(map[string]string)
	writer.Metadata["original-filename"] = header.Filename
	writer.Metadata["upload-timestamp"] = time.Now().UTC().Format(time.RFC3339)

	// Add custom metadata
	for k, v := range options.Metadata {
		writer.Metadata[k] = v
	}

	// Set ACL based on options
	if options.ACL == "public-read" || options.ACL == "" {
		writer.PredefinedACL = "publicRead"
	}

	// Write file content
	if _, err := writer.Write(fileBytes); err != nil {
		writer.Close()
		return nil, appErrors.WrapInternalError(err, "Failed to write file content")
	}

	// Close writer
	if err := writer.Close(); err != nil {
		return nil, appErrors.WrapInternalError(err, "Failed to upload file to GCP Storage")
	}

	return &interfaces.FileMetadata{
		Key:      key,
		URL:      g.GetPublicURL(key),
		Bucket:   g.bucketName,
		Size:     header.Size,
		MimeType: contentType,
	}, nil
}

func (g *GCPStorage) UploadFromReader(ctx context.Context, reader io.Reader, key string, contentType string, size int64, options interfaces.UploadOptions) (*interfaces.FileMetadata, error) {
	// Validate file type
	if err := g.ValidateFileType("", contentType); err != nil {
		return nil, err
	}

	// Validate file size (10MB limit)
	if size > 10*1024*1024 {
		return nil, appErrors.NewValidationError("File too large", "File size must be less than 10MB")
	}

	// Get object handle
	obj := g.client.Bucket(g.bucketName).Object(key)

	// Create writer
	writer := obj.NewWriter(ctx)
	writer.ContentType = contentType
	writer.Metadata = make(map[string]string)
	writer.Metadata["upload-timestamp"] = time.Now().UTC().Format(time.RFC3339)

	// Add custom metadata
	for k, v := range options.Metadata {
		writer.Metadata[k] = v
	}

	// Set ACL based on options
	if options.ACL == "public-read" || options.ACL == "" {
		writer.PredefinedACL = "publicRead"
	}

	// Copy from reader to writer
	if _, err := io.Copy(writer, reader); err != nil {
		writer.Close()
		return nil, appErrors.WrapInternalError(err, "Failed to write file content")
	}

	// Close writer
	if err := writer.Close(); err != nil {
		return nil, appErrors.WrapInternalError(err, "Failed to upload file to GCP Storage")
	}

	return &interfaces.FileMetadata{
		Key:      key,
		URL:      g.GetPublicURL(key),
		Bucket:   g.bucketName,
		Size:     size,
		MimeType: contentType,
	}, nil
}

func (g *GCPStorage) DeleteFile(ctx context.Context, key string) error {
	obj := g.client.Bucket(g.bucketName).Object(key)
	if err := obj.Delete(ctx); err != nil {
		return appErrors.WrapInternalError(err, "Failed to delete file from GCP Storage")
	}
	return nil
}

func (g *GCPStorage) FileExists(ctx context.Context, key string) (bool, error) {
	obj := g.client.Bucket(g.bucketName).Object(key)
	_, err := obj.Attrs(ctx)
	
	if err != nil {
		if err == storage.ErrObjectNotExist {
			return false, nil
		}
		return false, appErrors.WrapInternalError(err, "Failed to check if file exists")
	}
	
	return true, nil
}

func (g *GCPStorage) GetFileInfo(ctx context.Context, key string) (*interfaces.FileMetadata, error) {
	obj := g.client.Bucket(g.bucketName).Object(key)
	attrs, err := obj.Attrs(ctx)
	
	if err != nil {
		if err == storage.ErrObjectNotExist {
			return nil, appErrors.NewNotFoundError("File")
		}
		return nil, appErrors.WrapInternalError(err, "Failed to get file info")
	}

	return &interfaces.FileMetadata{
		Key:          key,
		URL:          g.GetPublicURL(key),
		Bucket:       g.bucketName,
		Size:         attrs.Size,
		MimeType:     attrs.ContentType,
		LastModified: &attrs.Updated,
		ETag:         attrs.Etag,
		Metadata:     attrs.Metadata,
	}, nil
}

func (g *GCPStorage) GetPresignedURL(ctx context.Context, key string, options interfaces.PresignedURLOptions) (string, error) {
	if options.Expires == 0 {
		options.Expires = 15 * time.Minute
	}

	// For simplicity, return public URL for GCP (since we're making files public)
	// In production, you might want to implement proper signed URLs
	return g.GetPublicURL(key), nil
}

func (g *GCPStorage) GetPresignedUploadURL(ctx context.Context, key string, contentType string, options interfaces.PresignedURLOptions) (string, error) {
	// For GCP, presigned upload URLs require more complex setup
	// For now, return empty string to indicate direct upload should be used instead
	return "", appErrors.NewValidationError("Presigned uploads not supported", "Use direct upload instead")
}

func (g *GCPStorage) CopyFile(ctx context.Context, sourceKey, destinationKey string) error {
	srcObj := g.client.Bucket(g.bucketName).Object(sourceKey)
	dstObj := g.client.Bucket(g.bucketName).Object(destinationKey)
	
	_, err := dstObj.CopierFrom(srcObj).Run(ctx)
	if err != nil {
		return appErrors.WrapInternalError(err, "Failed to copy file")
	}
	
	return nil
}

func (g *GCPStorage) ListFiles(ctx context.Context, prefix string, maxResults int) ([]*interfaces.FileMetadata, error) {
	if maxResults == 0 {
		maxResults = 100
	}

	query := &storage.Query{Prefix: prefix}
	query.SetAttrSelection([]string{"Name", "Size", "ContentType", "Updated", "Etag"})
	
	it := g.client.Bucket(g.bucketName).Objects(ctx, query)
	
	files := make([]*interfaces.FileMetadata, 0)
	count := 0
	
	for count < maxResults {
		attrs, err := it.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			return nil, appErrors.WrapInternalError(err, "Failed to list files")
		}
		
		files = append(files, &interfaces.FileMetadata{
			Key:          attrs.Name,
			URL:          g.GetPublicURL(attrs.Name),
			Bucket:       g.bucketName,
			Size:         attrs.Size,
			MimeType:     attrs.ContentType,
			LastModified: &attrs.Updated,
			ETag:         attrs.Etag,
		})
		
		count++
	}
	
	return files, nil
}

func (g *GCPStorage) GetPublicURL(key string) string {
	return fmt.Sprintf("https://storage.googleapis.com/%s/%s", g.bucketName, key)
}

func (g *GCPStorage) GenerateUploadKey(folder, originalFilename string) string {
	ext := filepath.Ext(originalFilename)
	fileName := fmt.Sprintf("%s%s", uuid.New().String(), ext)
	return fmt.Sprintf("%s/%s", strings.Trim(folder, "/"), fileName)
}

func (g *GCPStorage) ValidateFileType(filename string, contentType string) error {
	// Validate by extension if filename is provided
	if filename != "" {
		ext := strings.ToLower(filepath.Ext(filename))
		validExtensions := []string{".jpg", ".jpeg", ".png", ".webp", ".gif"}
		
		isValid := false
		for _, validExt := range validExtensions {
			if ext == validExt {
				isValid = true
				break
			}
		}
		
		if !isValid {
			return appErrors.NewValidationError("Invalid file type", "Only JPEG, PNG, WebP, and GIF images are allowed")
		}
	}

	// Validate by content type if provided
	if contentType != "" {
		validTypes := []string{
			"image/jpeg",
			"image/png",
			"image/webp",
			"image/gif",
		}
		
		isValid := false
		for _, validType := range validTypes {
			if contentType == validType {
				isValid = true
				break
			}
		}
		
		if !isValid {
			return appErrors.NewValidationError("Invalid content type", "File must be a valid image")
		}
	}

	return nil
}