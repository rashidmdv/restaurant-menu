package redis

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"

	"restaurant-menu-api/internal/config"
	"restaurant-menu-api/pkg/logger"
	appErrors "restaurant-menu-api/pkg/errors"
)

type Client struct {
	rdb    *redis.Client
	logger *logger.Logger
}

type CacheItem struct {
	Key        string        `json:"key"`
	Value      interface{}   `json:"value"`
	Expiration time.Duration `json:"expiration"`
}

func NewClient(cfg *config.RedisConfig, logger *logger.Logger) (*Client, error) {
	opt, err := redis.ParseURL(cfg.URL)
	if err != nil {
		return nil, fmt.Errorf("failed to parse Redis URL: %w", err)
	}

	if cfg.Password != "" {
		opt.Password = cfg.Password
	}

	opt.DB = cfg.DB

	rdb := redis.NewClient(opt)

	// Test connection
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := rdb.Ping(ctx).Err(); err != nil {
		return nil, fmt.Errorf("failed to connect to Redis: %w", err)
	}

	return &Client{
		rdb:    rdb,
		logger: logger,
	}, nil
}

func (c *Client) Set(ctx context.Context, key string, value interface{}, expiration time.Duration) error {
	data, err := json.Marshal(value)
	if err != nil {
		c.logger.LogError(ctx, err, "Failed to marshal value for Redis", map[string]interface{}{
			"key": key,
		})
		return appErrors.WrapInternalError(err, "Failed to serialize data")
	}

	if err := c.rdb.Set(ctx, key, data, expiration).Err(); err != nil {
		c.logger.LogError(ctx, err, "Failed to set value in Redis", map[string]interface{}{
			"key": key,
		})
		return appErrors.WrapInternalError(err, "Failed to cache data")
	}

	return nil
}

func (c *Client) Get(ctx context.Context, key string, dest interface{}) error {
	val, err := c.rdb.Get(ctx, key).Result()
	if err != nil {
		if err == redis.Nil {
			return appErrors.NewNotFoundError("Cache entry")
		}
		c.logger.LogError(ctx, err, "Failed to get value from Redis", map[string]interface{}{
			"key": key,
		})
		return appErrors.WrapInternalError(err, "Failed to retrieve cached data")
	}

	if err := json.Unmarshal([]byte(val), dest); err != nil {
		c.logger.LogError(ctx, err, "Failed to unmarshal Redis value", map[string]interface{}{
			"key": key,
		})
		return appErrors.WrapInternalError(err, "Failed to deserialize cached data")
	}

	return nil
}

func (c *Client) Delete(ctx context.Context, keys ...string) error {
	if len(keys) == 0 {
		return nil
	}

	if err := c.rdb.Del(ctx, keys...).Err(); err != nil {
		c.logger.LogError(ctx, err, "Failed to delete keys from Redis", map[string]interface{}{
			"keys": keys,
		})
		return appErrors.WrapInternalError(err, "Failed to delete cached data")
	}

	return nil
}

func (c *Client) Exists(ctx context.Context, key string) (bool, error) {
	count, err := c.rdb.Exists(ctx, key).Result()
	if err != nil {
		c.logger.LogError(ctx, err, "Failed to check key existence in Redis", map[string]interface{}{
			"key": key,
		})
		return false, appErrors.WrapInternalError(err, "Failed to check cache")
	}

	return count > 0, nil
}

func (c *Client) Expire(ctx context.Context, key string, expiration time.Duration) error {
	if err := c.rdb.Expire(ctx, key, expiration).Err(); err != nil {
		c.logger.LogError(ctx, err, "Failed to set expiration in Redis", map[string]interface{}{
			"key":        key,
			"expiration": expiration,
		})
		return appErrors.WrapInternalError(err, "Failed to set cache expiration")
	}

	return nil
}

func (c *Client) Increment(ctx context.Context, key string) (int64, error) {
	val, err := c.rdb.Incr(ctx, key).Result()
	if err != nil {
		c.logger.LogError(ctx, err, "Failed to increment key in Redis", map[string]interface{}{
			"key": key,
		})
		return 0, appErrors.WrapInternalError(err, "Failed to increment counter")
	}

	return val, nil
}

func (c *Client) IncrementWithExpiry(ctx context.Context, key string, expiration time.Duration) (int64, error) {
	pipe := c.rdb.Pipeline()
	incrCmd := pipe.Incr(ctx, key)
	pipe.Expire(ctx, key, expiration)

	if _, err := pipe.Exec(ctx); err != nil {
		c.logger.LogError(ctx, err, "Failed to increment with expiry in Redis", map[string]interface{}{
			"key":        key,
			"expiration": expiration,
		})
		return 0, appErrors.WrapInternalError(err, "Failed to increment counter with expiry")
	}

	return incrCmd.Val(), nil
}

func (c *Client) SetNX(ctx context.Context, key string, value interface{}, expiration time.Duration) (bool, error) {
	data, err := json.Marshal(value)
	if err != nil {
		c.logger.LogError(ctx, err, "Failed to marshal value for Redis SetNX", map[string]interface{}{
			"key": key,
		})
		return false, appErrors.WrapInternalError(err, "Failed to serialize data")
	}

	result, err := c.rdb.SetNX(ctx, key, data, expiration).Result()
	if err != nil {
		c.logger.LogError(ctx, err, "Failed to execute SetNX in Redis", map[string]interface{}{
			"key": key,
		})
		return false, appErrors.WrapInternalError(err, "Failed to set cache if not exists")
	}

	return result, nil
}

func (c *Client) GetTTL(ctx context.Context, key string) (time.Duration, error) {
	ttl, err := c.rdb.TTL(ctx, key).Result()
	if err != nil {
		c.logger.LogError(ctx, err, "Failed to get TTL from Redis", map[string]interface{}{
			"key": key,
		})
		return 0, appErrors.WrapInternalError(err, "Failed to get cache TTL")
	}

	return ttl, nil
}

func (c *Client) FlushPattern(ctx context.Context, pattern string) error {
	keys, err := c.rdb.Keys(ctx, pattern).Result()
	if err != nil {
		c.logger.LogError(ctx, err, "Failed to get keys by pattern from Redis", map[string]interface{}{
			"pattern": pattern,
		})
		return appErrors.WrapInternalError(err, "Failed to find keys by pattern")
	}

	if len(keys) > 0 {
		if err := c.rdb.Del(ctx, keys...).Err(); err != nil {
			c.logger.LogError(ctx, err, "Failed to delete keys by pattern from Redis", map[string]interface{}{
				"pattern": pattern,
				"keys":    keys,
			})
			return appErrors.WrapInternalError(err, "Failed to delete keys by pattern")
		}
	}

	return nil
}

func (c *Client) Close() error {
	return c.rdb.Close()
}

func (c *Client) HealthCheck() error {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	return c.rdb.Ping(ctx).Err()
}

func (c *Client) GetStats() map[string]interface{} {
	stats := c.rdb.PoolStats()
	return map[string]interface{}{
		"hits":         stats.Hits,
		"misses":       stats.Misses,
		"timeouts":     stats.Timeouts,
		"total_conns":  stats.TotalConns,
		"idle_conns":   stats.IdleConns,
		"stale_conns":  stats.StaleConns,
	}
}

// Cache key helpers
func GenerateCacheKey(prefix string, parts ...string) string {
	key := prefix
	for _, part := range parts {
		key += ":" + part
	}
	return key
}

// Common cache operations
func (c *Client) CacheMenuData(ctx context.Context, key string, data interface{}, expiration time.Duration) error {
	return c.Set(ctx, GenerateCacheKey("menu", key), data, expiration)
}

func (c *Client) GetMenuData(ctx context.Context, key string, dest interface{}) error {
	return c.Get(ctx, GenerateCacheKey("menu", key), dest)
}

func (c *Client) InvalidateMenuCache(ctx context.Context) error {
	return c.FlushPattern(ctx, "menu:*")
}

func (c *Client) CacheItemData(ctx context.Context, key string, data interface{}, expiration time.Duration) error {
	return c.Set(ctx, GenerateCacheKey("item", key), data, expiration)
}

func (c *Client) GetItemData(ctx context.Context, key string, dest interface{}) error {
	return c.Get(ctx, GenerateCacheKey("item", key), dest)
}

func (c *Client) InvalidateItemCache(ctx context.Context, itemID string) error {
	return c.FlushPattern(ctx, fmt.Sprintf("item:*%s*", itemID))
}