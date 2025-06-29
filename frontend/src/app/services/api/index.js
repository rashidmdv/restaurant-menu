import menuService from './menuService';
import restaurantService from './restaurantService';
import contentService from './contentService';
import uploadService from './uploadService';
import healthService from './healthService';
import apiClient, { APIError } from './client';
import API_CONFIG from './config';

export {
  menuService,
  restaurantService,
  contentService,
  uploadService,
  healthService,
  apiClient,
  APIError,
  API_CONFIG
};

const apiServices = {
  menu: menuService,
  restaurant: restaurantService,
  content: contentService,
  upload: uploadService,
  health: healthService,
  client: apiClient,
  config: API_CONFIG
};

export default apiServices;