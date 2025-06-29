import apiClient from './client';
import API_CONFIG from './config';

class HealthService {
  async checkHealth() {
    return apiClient.get(API_CONFIG.ENDPOINTS.HEALTH);
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