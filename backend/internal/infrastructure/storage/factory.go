package storage

import (
	"context"
	"fmt"

	"restaurant-menu-api/internal/config"
	"restaurant-menu-api/internal/domain/interfaces"
)

// StorageFactory creates storage clients based on provider configuration
type StorageFactory struct {
	cfg *config.Config
}

// NewStorageFactory creates a new storage factory
func NewStorageFactory(cfg *config.Config) *StorageFactory {
	return &StorageFactory{
		cfg: cfg,
	}
}

// CreateStorageClient creates a storage client based on the configured provider
func (f *StorageFactory) CreateStorageClient(ctx context.Context) (interfaces.StorageInterface, error) {
	switch f.cfg.Storage.Provider {
	case "aws":
		return f.createAWSStorage()
	case "gcp":
		return f.createGCPStorage(ctx)
	default:
		return nil, fmt.Errorf("unsupported storage provider: %s", f.cfg.Storage.Provider)
	}
}

// createAWSStorage creates an AWS S3 storage client
func (f *StorageFactory) createAWSStorage() (interfaces.StorageInterface, error) {
	return NewAWSStorage(&f.cfg.AWS)
}

// createGCPStorage creates a GCP Cloud Storage client
func (f *StorageFactory) createGCPStorage(ctx context.Context) (interfaces.StorageInterface, error) {
	return NewGCPStorage(ctx, &f.cfg.GCP)
}

// GetStorageProvider returns the configured storage provider
func (f *StorageFactory) GetStorageProvider() interfaces.StorageProvider {
	switch f.cfg.Storage.Provider {
	case "aws":
		return interfaces.StorageProviderAWS
	case "gcp":
		return interfaces.StorageProviderGCP
	default:
		return interfaces.StorageProviderAWS // default fallback
	}
}