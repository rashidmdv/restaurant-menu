import apiClient from './client';
import API_CONFIG from './config';

class MenuService {
  async getCompleteMenu() {
    return apiClient.get(API_CONFIG.ENDPOINTS.MENU);
  }

  async getCategories(params = {}) {
    const defaultParams = {
      active: true,
      order_by: 'display_order',
      order_dir: 'ASC'
    };
    return apiClient.get(API_CONFIG.ENDPOINTS.CATEGORIES, { ...defaultParams, ...params });
  }

  async getCategoryById(id) {
    return apiClient.get(`${API_CONFIG.ENDPOINTS.CATEGORIES}/${id}`);
  }

  async getSubCategories(params = {}) {
    const defaultParams = {
      active: true,
      order_by: 'display_order',
      order_dir: 'ASC'
    };
    return apiClient.get(API_CONFIG.ENDPOINTS.SUBCATEGORIES, { ...defaultParams, ...params });
  }

  async getSubCategoriesByCategory(categoryId, params = {}) {
    const defaultParams = {
      category_id: categoryId,
      active: true,
      order_by: 'display_order',
      order_dir: 'ASC'
    };
    return apiClient.get(API_CONFIG.ENDPOINTS.SUBCATEGORIES, { ...defaultParams, ...params });
  }

  async getSubCategoryById(id) {
    return apiClient.get(`${API_CONFIG.ENDPOINTS.SUBCATEGORIES}/${id}`);
  }

  async getItems(params = {}) {
    const defaultParams = {
      available: true,
      order_by: 'display_order',
      order_dir: 'ASC'
    };
    return apiClient.get(API_CONFIG.ENDPOINTS.ITEMS, { ...defaultParams, ...params });
  }

  async getItemsBySubCategory(subCategoryId, params = {}) {
    const defaultParams = {
      sub_category_id: subCategoryId,
      available: true,
      order_by: 'display_order',
      order_dir: 'ASC'
    };
    return apiClient.get(API_CONFIG.ENDPOINTS.ITEMS, { ...defaultParams, ...params });
  }

  async getItemsByCategory(categoryId, params = {}) {
    const defaultParams = {
      category_id: categoryId,
      available: true,
      order_by: 'display_order',
      order_dir: 'ASC'
    };
    return apiClient.get(API_CONFIG.ENDPOINTS.ITEMS, { ...defaultParams, ...params });
  }

  async getItemById(id) {
    return apiClient.get(`${API_CONFIG.ENDPOINTS.ITEMS}/${id}`);
  }

  async searchItems(query, params = {}) {
    const defaultParams = {
      search: query,
      available: true,
      limit: 20
    };
    return apiClient.get(`${API_CONFIG.ENDPOINTS.ITEMS}/search`, { ...defaultParams, ...params });
  }

  async getFeaturedItems(params = {}) {
    const defaultParams = {
      available: true,
      limit: 8
    };
    return apiClient.get(`${API_CONFIG.ENDPOINTS.ITEMS}/featured`, { ...defaultParams, ...params });
  }
}

const menuService = new MenuService();
export default menuService;