import apiClient from './client';
import API_CONFIG from './config';

class HealthService {
  async checkHealth() {
    // Health endpoint is not under /api/, so use absolute URL
    const baseUrl = API_CONFIG.BASE_URL.replace('/api', '');
    const fullUrl = `${baseUrl}${API_CONFIG.ENDPOINTS.HEALTH}`;
    return fetch(fullUrl).then(res => res.json());
  }

  async checkReady() {
    return apiClient.get('/ready');
  }

  async checkLive() {
    return apiClient.get('/live');
  }

  async getStatus() {
    return apiClient.get('/status');
  }
}

const healthService = new HealthService();
export default healthService;