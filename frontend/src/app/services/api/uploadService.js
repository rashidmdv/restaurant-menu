import apiClient from './client';
import API_CONFIG from './config';

class UploadService {
  async uploadImage(file, additionalData = {}) {
    return apiClient.uploadFile(`${API_CONFIG.ENDPOINTS.UPLOAD}/image`, file, additionalData);
  }

  async getPresignedUrl(filename, contentType) {
    return apiClient.get(`${API_CONFIG.ENDPOINTS.UPLOAD}/presigned-url`, {
      filename,
      content_type: contentType
    });
  }

  async deleteImage(imageKey) {
    return apiClient.delete(`${API_CONFIG.ENDPOINTS.UPLOAD}/image/${imageKey}`);
  }

  async getImageInfo(imageKey) {
    return apiClient.get(`${API_CONFIG.ENDPOINTS.UPLOAD}/image/${imageKey}`);
  }
}

const uploadService = new UploadService();
export default uploadService;