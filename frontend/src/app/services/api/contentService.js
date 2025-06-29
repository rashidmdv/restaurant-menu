import apiClient from './client';
import API_CONFIG from './config';

class ContentService {
  async getAllContent(params = {}) {
    const defaultParams = {
      active: true
    };
    return apiClient.get(API_CONFIG.ENDPOINTS.CONTENT, { ...defaultParams, ...params });
  }

  async getContentByKey(sectionName) {
    return apiClient.get(`${API_CONFIG.ENDPOINTS.CONTENT}/by-key/${sectionName}`);
  }

  async getContentById(id) {
    return apiClient.get(`${API_CONFIG.ENDPOINTS.CONTENT}/${id}`);
  }

  async getHeroContent() {
    return this.getContentByKey('hero');
  }

  async getStoryContent() {
    return this.getContentByKey('story');
  }

  async getPeopleContent() {
    return this.getContentByKey('people');
  }

  async getLocationContent() {
    return this.getContentByKey('location');
  }
}

const contentService = new ContentService();
export default contentService;