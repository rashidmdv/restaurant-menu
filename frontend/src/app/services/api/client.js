import API_CONFIG from './config';

class APIError extends Error {
  constructor(message, status, code, details) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

class APIClient {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
    this.retryConfig = API_CONFIG.RETRY_CONFIG;
    this.cache = new Map();
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getCacheKey(url, options = {}) {
    return `${url}_${JSON.stringify(options)}`;
  }

  setCache(key, data, ttl = API_CONFIG.CACHE_TTL) {
    this.cache.set(key, {
      data,
      expires: Date.now() + ttl
    });
  }

  getCache(key) {
    const cached = this.cache.get(key);
    if (cached && cached.expires > Date.now()) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  clearCache() {
    this.cache.clear();
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const cacheKey = this.getCacheKey(url, options);
    
    if (options.method === 'GET' || !options.method) {
      const cached = this.getCache(cacheKey);
      if (cached) {
        return cached;
      }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    const requestOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers
      },
      signal: controller.signal,
      ...options
    };

    if (options.body && typeof options.body === 'object') {
      requestOptions.body = JSON.stringify(options.body);
    }

    for (let attempt = 1; attempt <= this.retryConfig.attempts; attempt++) {
      try {
        const response = await fetch(url, requestOptions);
        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await this.parseErrorResponse(response);
          throw new APIError(
            errorData.message || `HTTP ${response.status}`,
            response.status,
            errorData.code,
            errorData.details
          );
        }

        const data = await response.json();
        
        if (options.method === 'GET' || !options.method) {
          this.setCache(cacheKey, data);
        }

        return data;

      } catch (error) {
        clearTimeout(timeoutId);
        
        if (error.name === 'AbortError') {
          throw new APIError('Request timeout', 408, 'timeout');
        }

        if (attempt === this.retryConfig.attempts || error instanceof APIError) {
          throw error;
        }

        const delay = this.retryConfig.delayMs * Math.pow(this.retryConfig.backoffFactor, attempt - 1);
        await this.sleep(delay);
      }
    }
  }

  async parseErrorResponse(response) {
    try {
      const errorData = await response.json();
      return errorData.error || errorData;
    } catch {
      return {
        message: response.statusText || 'Unknown error',
        code: 'unknown_error'
      };
    }
  }

  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url);
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: data
    });
  }

  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: data
    });
  }

  async patch(endpoint, data) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: data
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE'
    });
  }

  async uploadFile(endpoint, file, additionalData = {}) {
    const formData = new FormData();
    formData.append('file', file);
    
    Object.keys(additionalData).forEach(key => {
      formData.append(key, additionalData[key]);
    });

    return this.request(endpoint, {
      method: 'POST',
      body: formData,
      headers: {}
    });
  }
}

const apiClient = new APIClient();
export { APIError };
export default apiClient;