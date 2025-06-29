const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000',
  ENDPOINTS: {
    HEALTH: '/health',
    MENU: '/api/v1/menu',
    CATEGORIES: '/api/v1/categories',
    SUBCATEGORIES: '/api/v1/subcategories',
    ITEMS: '/api/v1/items',
    RESTAURANTS: '/api/v1/restaurants',
    CONTENT: '/api/v1/content',
    UPLOAD: '/api/v1/upload'
  },
  TIMEOUT: 10000,
  RETRY_CONFIG: {
    attempts: 3,
    delayMs: 1000,
    backoffFactor: 2
  },
  CACHE_TTL: 5 * 60 * 1000
};

export default API_CONFIG;