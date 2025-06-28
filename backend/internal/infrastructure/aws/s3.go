package aws

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
	appErrors "restaurant-menu-api/pkg/errors"
)

type S3Client struct {
	session    *session.Session
	s3Service  *s3.S3
	uploader   *s3manager.Uploader
	downloader *s3manager.Downloader
	bucket     string
	region     string
}

type UploadResult struct {
	Key      string `json:"key"`
	URL      string `json:"url"`
	Bucket   string `json:"bucket"`
	Size     int64  `json:"size"`
	MimeType string `json:"mime_type"`
}

type PresignedURLOptions struct {
	Expires    time.Duration
	UploadType string
}

func NewS3Client(cfg *config.AWSConfig) (*S3Client, error) {
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

	client := &S3Client{
		session:    sess,
		s3Service:  s3Service,
		uploader:   uploader,
		downloader: downloader,
		bucket:     cfg.S3Bucket,
		region:     cfg.S3Region,
	}

	return client, nil
}

func (c *S3Client) UploadFile(ctx context.Context, file multipart.File, header *multipart.FileHeader, folder string) (*UploadResult, error) {
	// Validate file type
	if !c.isValidImageType(header.Filename) {
		return nil, appErrors.NewValidationError("Invalid file type", "Only JPEG, PNG, and WebP images are allowed")
	}

	// Validate file size (10MB limit)
	if header.Size > 10*1024*1024 {
		return nil, appErrors.NewValidationError("File too large", "File size must be less than 10MB")
	}

	// Generate unique filename
	ext := filepath.Ext(header.Filename)
	fileName := fmt.Sprintf("%s%s", uuid.New().String(), ext)
	key := fmt.Sprintf("%s/%s", strings.Trim(folder, "/"), fileName)

	// Read file content
	fileBytes, err := io.ReadAll(file)
	if err != nil {
		return nil, appErrors.WrapInternalError(err, "Failed to read file content")
	}

	// Detect content type
	contentType := http.DetectContentType(fileBytes)
	if !c.isValidContentType(contentType) {
		return nil, appErrors.NewValidationError("Invalid content type", "File must be a valid image")
	}

	// Upload to S3
	result, err := c.uploader.UploadWithContext(ctx, &s3manager.UploadInput{
		Bucket:      aws.String(c.bucket),
		Key:         aws.String(key),
		Body:        bytes.NewReader(fileBytes),
		ContentType: aws.String(contentType),
		ACL:         aws.String("public-read"),
		Metadata: map[string]*string{
			"original-filename": aws.String(header.Filename),
			"upload-timestamp":  aws.String(time.Now().UTC().Format(time.RFC3339)),
		},
	})
	if err != nil {
		return nil, appErrors.WrapInternalError(err, "Failed to upload file to S3")
	}

	return &UploadResult{
		Key:      key,
		URL:      result.Location,
		Bucket:   c.bucket,
		Size:     header.Size,
		MimeType: contentType,
	}, nil
}

func (c *S3Client) DeleteFile(ctx context.Context, key string) error {
	_, err := c.s3Service.DeleteObjectWithContext(ctx, &s3.DeleteObjectInput{
		Bucket: aws.String(c.bucket),
		Key:    aws.String(key),
	})
	if err != nil {
		return appErrors.WrapInternalError(err, "Failed to delete file from S3")
	}

	return nil
}

func (c *S3Client) GetPresignedURL(ctx context.Context, key string, options PresignedURLOptions) (string, error) {
	if options.Expires == 0 {
		options.Expires = 15 * time.Minute
	}

	req, _ := c.s3Service.GetObjectRequest(&s3.GetObjectInput{
		Bucket: aws.String(c.bucket),
		Key:    aws.String(key),
	})

	url, err := req.Presign(options.Expires)
	if err != nil {
		return "", appErrors.WrapInternalError(err, "Failed to generate presigned URL")
	}

	return url, nil
}

func (c *S3Client) GetPresignedUploadURL(ctx context.Context, key string, contentType string, options PresignedURLOptions) (string, error) {
	if options.Expires == 0 {
		options.Expires = 15 * time.Minute
	}

	req, _ := c.s3Service.PutObjectRequest(&s3.PutObjectInput{
		Bucket:      aws.String(c.bucket),
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

func (c *S3Client) FileExists(ctx context.Context, key string) (bool, error) {
	_, err := c.s3Service.HeadObjectWithContext(ctx, &s3.HeadObjectInput{
		Bucket: aws.String(c.bucket),
		Key:    aws.String(key),
	})

	if err != nil {
		// Check if it's a 404 error (file not found)
		if strings.Contains(err.Error(), "404") || strings.Contains(err.Error(), "NotFound") {
			return false, nil
		}
		return false, appErrors.WrapInternalError(err, "Failed to check if file exists")
	}

	return true, nil
}

func (c *S3Client) GetFileInfo(ctx context.Context, key string) (*s3.HeadObjectOutput, error) {
	result, err := c.s3Service.HeadObjectWithContext(ctx, &s3.HeadObjectInput{
		Bucket: aws.String(c.bucket),
		Key:    aws.String(key),
	})

	if err != nil {
		// Check if it's a 404 error (file not found)
		if strings.Contains(err.Error(), "404") || strings.Contains(err.Error(), "NotFound") {
			return nil, appErrors.NewNotFoundError("File")
		}
		return nil, appErrors.WrapInternalError(err, "Failed to get file info")
	}

	return result, nil
}

func (c *S3Client) CopyFile(ctx context.Context, sourceKey, destinationKey string) error {
	copySource := fmt.Sprintf("%s/%s", c.bucket, sourceKey)

	_, err := c.s3Service.CopyObjectWithContext(ctx, &s3.CopyObjectInput{
		Bucket:     aws.String(c.bucket),
		CopySource: aws.String(copySource),
		Key:        aws.String(destinationKey),
		ACL:        aws.String("public-read"),
	})

	if err != nil {
		return appErrors.WrapInternalError(err, "Failed to copy file")
	}

	return nil
}

func (c *S3Client) ListFiles(ctx context.Context, prefix string, maxKeys int64) ([]*s3.Object, error) {
	if maxKeys == 0 {
		maxKeys = 100
	}

	result, err := c.s3Service.ListObjectsV2WithContext(ctx, &s3.ListObjectsV2Input{
		Bucket:  aws.String(c.bucket),
		Prefix:  aws.String(prefix),
		MaxKeys: aws.Int64(maxKeys),
	})

	if err != nil {
		return nil, appErrors.WrapInternalError(err, "Failed to list files")
	}

	return result.Contents, nil
}

func (c *S3Client) isValidImageType(filename string) bool {
	ext := strings.ToLower(filepath.Ext(filename))
	validExtensions := []string{".jpg", ".jpeg", ".png", ".webp", ".gif"}
	
	for _, validExt := range validExtensions {
		if ext == validExt {
			return true
		}
	}
	
	return false
}

func (c *S3Client) isValidContentType(contentType string) bool {
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

func (c *S3Client) GenerateUploadKey(folder, originalFilename string) string {
	ext := filepath.Ext(originalFilename)
	fileName := fmt.Sprintf("%s%s", uuid.New().String(), ext)
	return fmt.Sprintf("%s/%s", strings.Trim(folder, "/"), fileName)
}

func (c *S3Client) GetPublicURL(key string) string {
	return fmt.Sprintf("https://%s.s3.%s.amazonaws.com/%s", c.bucket, c.region, key)
}