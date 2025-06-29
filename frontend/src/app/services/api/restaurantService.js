import apiClient from './client';
import API_CONFIG from './config';

class RestaurantService {
  async getRestaurantInfo() {
    return apiClient.get(`${API_CONFIG.ENDPOINTS.RESTAURANTS}/info`);
  }

  async getOperatingHours() {
    return apiClient.get(`${API_CONFIG.ENDPOINTS.RESTAURANTS}/hours`);
  }
}

const restaurantService = new RestaurantService();
export default restaurantService;