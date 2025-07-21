package storage

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"path/filepath"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/aws/aws-sdk-go/service/s3/s3manager"
	"github.com/google/uuid"

	"restaurant-menu-api/internal/config"
	"restaurant-menu-api/internal/domain/interfaces"
	appErrors "restaurant-menu-api/pkg/errors"
)

type AWSStorage struct {
	session    *session.Session
	s3Service  *s3.S3
	uploader   *s3manager.Uploader
	downloader *s3manager.Downloader
	bucket     string
	region     string
}

func NewAWSStorage(cfg *config.AWSConfig) (*AWSStorage, error) {
	sess, err := session.NewSession(&aws.Config{
		Region: aws.String(cfg.Region),
		Credentials: credentials.NewStaticCredentials(
			cfg.AccessKeyID,
			cfg.SecretAccessKey,
			"",
		),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create AWS session: %w", err)
	}

	s3Service := s3.New(sess)
	uploader := s3manager.NewUploader(sess)
	downloader := s3manager.NewDownloader(sess)

	client := &AWSStorage{
		session:    sess,
		s3Service:  s3Service,
		uploader:   uploader,
		downloader: downloader,
		bucket:     cfg.S3Bucket,
		region:     cfg.S3Region,
	}

	return client, nil
}

func (a *AWSStorage) UploadFile(ctx context.Context, file multipart.File, header *multipart.FileHeader, options interfaces.UploadOptions) (*interfaces.FileMetadata, error) {
	// Validate file type
	if err := a.ValidateFileType(header.Filename, ""); err != nil {
		return nil, err
	}

	// Validate file size (10MB limit)
	if header.Size > 10*1024*1024 {
		return nil, appErrors.NewValidationError("File too large", "File size must be less than 10MB")
	}

	// Generate unique filename
	key := a.GenerateUploadKey(options.Folder, header.Filename)

	// Read file content
	fileBytes, err := io.ReadAll(file)
	if err != nil {
		return nil, appErrors.WrapInternalError(err, "Failed to read file content")
	}

	// Detect content type
	contentType := http.DetectContentType(fileBytes)
	if err := a.ValidateFileType("", contentType); err != nil {
		return nil, err
	}

	// Prepare metadata
	metadata := map[string]*string{
		"original-filename": aws.String(header.Filename),
		"upload-timestamp":  aws.String(time.Now().UTC().Format(time.RFC3339)),
	}
	
	// Add custom metadata
	for k, v := range options.Metadata {
		metadata[k] = aws.String(v)
	}

	// Set ACL
	acl := options.ACL
	if acl == "" {
		acl = "public-read"
	}

	// Upload to S3
	result, err := a.uploader.UploadWithContext(ctx, &s3manager.UploadInput{
		Bucket:      aws.String(a.bucket),
		Key:         aws.String(key),
		Body:        bytes.NewReader(fileBytes),
		ContentType: aws.String(contentType),
		ACL:         aws.String(acl),
		Metadata:    metadata,
	})
	if err != nil {
		return nil, appErrors.WrapInternalError(err, "Failed to upload file to S3")
	}

	return &interfaces.FileMetadata{
		Key:      key,
		URL:      result.Location,
		Bucket:   a.bucket,
		Size:     header.Size,
		MimeType: contentType,
	}, nil
}

func (a *AWSStorage) UploadFromReader(ctx context.Context, reader io.Reader, key string, contentType string, size int64, options interfaces.UploadOptions) (*interfaces.FileMetadata, error) {
	// Validate file type
	if err := a.ValidateFileType("", contentType); err != nil {
		return nil, err
	}

	// Validate file size (10MB limit)
	if size > 10*1024*1024 {
		return nil, appErrors.NewValidationError("File too large", "File size must be less than 10MB")
	}

	// Prepare metadata
	metadata := map[string]*string{
		"upload-timestamp": aws.String(time.Now().UTC().Format(time.RFC3339)),
	}
	
	// Add custom metadata
	for k, v := range options.Metadata {
		metadata[k] = aws.String(v)
	}

	// Set ACL
	acl := options.ACL
	if acl == "" {
		acl = "public-read"
	}

	// Upload to S3
	result, err := a.uploader.UploadWithContext(ctx, &s3manager.UploadInput{
		Bucket:      aws.String(a.bucket),
		Key:         aws.String(key),
		Body:        reader,
		ContentType: aws.String(contentType),
		ACL:         aws.String(acl),
		Metadata:    metadata,
	})
	if err != nil {
		return nil, appErrors.WrapInternalError(err, "Failed to upload file to S3")
	}

	return &interfaces.FileMetadata{
		Key:      key,
		URL:      result.Location,
		Bucket:   a.bucket,
		Size:     size,
		MimeType: contentType,
	}, nil
}

func (a *AWSStorage) DeleteFile(ctx context.Context, key string) error {
	_, err := a.s3Service.DeleteObjectWithContext(ctx, &s3.DeleteObjectInput{
		Bucket: aws.String(a.bucket),
		Key:    aws.String(key),
	})
	if err != nil {
		return appErrors.WrapInternalError(err, "Failed to delete file from S3")
	}

	return nil
}

func (a *AWSStorage) FileExists(ctx context.Context, key string) (bool, error) {
	_, err := a.s3Service.HeadObjectWithContext(ctx, &s3.HeadObjectInput{
		Bucket: aws.String(a.bucket),
		Key:    aws.String(key),
	})

	if err != nil {
		if strings.Contains(err.Error(), "404") || strings.Contains(err.Error(), "NotFound") {
			return false, nil
		}
		return false, appErrors.WrapInternalError(err, "Failed to check if file exists")
	}

	return true, nil
}

func (a *AWSStorage) GetFileInfo(ctx context.Context, key string) (*interfaces.FileMetadata, error) {
	result, err := a.s3Service.HeadObjectWithContext(ctx, &s3.HeadObjectInput{
		Bucket: aws.String(a.bucket),
		Key:    aws.String(key),
	})

	if err != nil {
		if strings.Contains(err.Error(), "404") || strings.Contains(err.Error(), "NotFound") {
			return nil, appErrors.NewNotFoundError("File")
		}
		return nil, appErrors.WrapInternalError(err, "Failed to get file info")
	}

	// Convert metadata
	metadata := make(map[string]string)
	for k, v := range result.Metadata {
		if v != nil {
			metadata[k] = *v
		}
	}

	lastModified := result.LastModified
	etag := ""
	if result.ETag != nil {
		etag = *result.ETag
	}

	return &interfaces.FileMetadata{
		Key:          key,
		URL:          a.GetPublicURL(key),
		Bucket:       a.bucket,
		Size:         *result.ContentLength,
		MimeType:     *result.ContentType,
		LastModified: lastModified,
		ETag:         etag,
		Metadata:     metadata,
	}, nil
}

func (a *AWSStorage) GetPresignedURL(ctx context.Context, key string, options interfaces.PresignedURLOptions) (string, error) {
	if options.Expires == 0 {
		options.Expires = 15 * time.Minute
	}

	req, _ := a.s3Service.GetObjectRequest(&s3.GetObjectInput{
		Bucket: aws.String(a.bucket),
		Key:    aws.String(key),
	})

	url, err := req.Presign(options.Expires)
	if err != nil {
		return "", appErrors.WrapInternalError(err, "Failed to generate presigned URL")
	}

	return url, nil
}

func (a *AWSStorage) GetPresignedUploadURL(ctx context.Context, key string, contentType string, options interfaces.PresignedURLOptions) (string, error) {
	if options.Expires == 0 {
		options.Expires = 15 * time.Minute
	}

	req, _ := a.s3Service.PutObjectRequest(&s3.PutObjectInput{
		Bucket:      aws.String(a.bucket),
		Key:         aws.String(key),
		ContentType: aws.String(contentType),
		ACL:         aws.String("public-read"),
	})

	url, err := req.Presign(options.Expires)
	if err != nil {
		return "", appErrors.WrapInternalError(err, "Failed to generate presigned upload URL")
	}

	return url, nil
}

func (a *AWSStorage) CopyFile(ctx context.Context, sourceKey, destinationKey string) error {
	copySource := fmt.Sprintf("%s/%s", a.bucket, sourceKey)

	_, err := a.s3Service.CopyObjectWithContext(ctx, &s3.CopyObjectInput{
		Bucket:     aws.String(a.bucket),
		CopySource: aws.String(copySource),
		Key:        aws.String(destinationKey),
		ACL:        aws.String("public-read"),
	})

	if err != nil {
		return appErrors.WrapInternalError(err, "Failed to copy file")
	}

	return nil
}

func (a *AWSStorage) ListFiles(ctx context.Context, prefix string, maxResults int) ([]*interfaces.FileMetadata, error) {
	if maxResults == 0 {
		maxResults = 100
	}

	result, err := a.s3Service.ListObjectsV2WithContext(ctx, &s3.ListObjectsV2Input{
		Bucket:  aws.String(a.bucket),
		Prefix:  aws.String(prefix),
		MaxKeys: aws.Int64(int64(maxResults)),
	})

	if err != nil {
		return nil, appErrors.WrapInternalError(err, "Failed to list files")
	}

	files := make([]*interfaces.FileMetadata, 0, len(result.Contents))
	for _, obj := range result.Contents {
		files = append(files, &interfaces.FileMetadata{
			Key:          *obj.Key,
			URL:          a.GetPublicURL(*obj.Key),
			Bucket:       a.bucket,
			Size:         *obj.Size,
			LastModified: obj.LastModified,
			ETag:         *obj.ETag,
		})
	}

	return files, nil
}

func (a *AWSStorage) GetPublicURL(key string) string {
	return fmt.Sprintf("https://%s.s3.%s.amazonaws.com/%s", a.bucket, a.region, key)
}

func (a *AWSStorage) GenerateUploadKey(folder, originalFilename string) string {
	ext := filepath.Ext(originalFilename)
	fileName := fmt.Sprintf("%s%s", uuid.New().String(), ext)
	return fmt.Sprintf("%s/%s", strings.Trim(folder, "/"), fileName)
}

func (a *AWSStorage) ValidateFileType(filename string, contentType string) error {
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