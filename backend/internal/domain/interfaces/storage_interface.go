package interfaces

import (
	"context"
	"io"
	"mime/multipart"
	"time"
)

// FileMetadata represents metadata about an uploaded file
type FileMetadata struct {
	Key          string            `json:"key"`
	URL          string            `json:"url"`
	Bucket       string            `json:"bucket"`
	Size         int64             `json:"size"`
	MimeType     string            `json:"mime_type"`
	LastModified *time.Time        `json:"last_modified,omitempty"`
	ETag         string            `json:"etag,omitempty"`
	Metadata     map[string]string `json:"metadata,omitempty"`
}

// UploadOptions contains options for file upload
type UploadOptions struct {
	Folder      string            `json:"folder"`
	ACL         string            `json:"acl"`
	Metadata    map[string]string `json:"metadata"`
	ContentType string            `json:"content_type"`
}

// PresignedURLOptions contains options for presigned URL generation
type PresignedURLOptions struct {
	Expires     time.Duration `json:"expires"`
	UploadType  string        `json:"upload_type"`
	ContentType string        `json:"content_type"`
}

// StorageInterface defines the contract for cloud storage operations
type StorageInterface interface {
	// UploadFile uploads a file from multipart form data
	UploadFile(ctx context.Context, file multipart.File, header *multipart.FileHeader, options UploadOptions) (*FileMetadata, error)
	
	// UploadFromReader uploads a file from an io.Reader
	UploadFromReader(ctx context.Context, reader io.Reader, key string, contentType string, size int64, options UploadOptions) (*FileMetadata, error)
	
	// DeleteFile deletes a file by its key
	DeleteFile(ctx context.Context, key string) error
	
	// FileExists checks if a file exists
	FileExists(ctx context.Context, key string) (bool, error)
	
	// GetFileInfo retrieves file metadata
	GetFileInfo(ctx context.Context, key string) (*FileMetadata, error)
	
	// GetPresignedURL generates a presigned URL for file access
	GetPresignedURL(ctx context.Context, key string, options PresignedURLOptions) (string, error)
	
	// GetPresignedUploadURL generates a presigned URL for file upload
	GetPresignedUploadURL(ctx context.Context, key string, contentType string, options PresignedURLOptions) (string, error)
	
	// CopyFile copies a file from source key to destination key
	CopyFile(ctx context.Context, sourceKey, destinationKey string) error
	
	// ListFiles lists files with optional prefix and max results
	ListFiles(ctx context.Context, prefix string, maxResults int) ([]*FileMetadata, error)
	
	// GetPublicURL returns the public URL for a file
	GetPublicURL(key string) string
	
	// GenerateUploadKey generates a unique key for file upload
	GenerateUploadKey(folder, originalFilename string) string
	
	// ValidateFileType validates if the file type is allowed
	ValidateFileType(filename string, contentType string) error
}

// StorageProvider represents the type of storage provider
type StorageProvider string

const (
	StorageProviderAWS StorageProvider = "aws"
	StorageProviderGCP StorageProvider = "gcp"
)

// StorageConfig represents generic storage configuration
type StorageConfig struct {
	Provider StorageProvider
	Region   string
	Bucket   string
}