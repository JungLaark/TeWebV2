import { httpClient } from '../utils/httpClient';
import { ENDPOINTS } from '../index';

export const v2Service = {
  // System
  getSystemInfo: async () => {
    const response = await httpClient.get(ENDPOINTS.V2.SYSTEM_INFO);
    return response.data;
  },

  heartbeat: async () => {
    const response = await httpClient.post(ENDPOINTS.V2.HEARTBEAT);
    return response.data;
  },

  // Template
  previewTemplate: async () => {
    const response = await httpClient.get(ENDPOINTS.V2.PREVIEW_TE);
    return response.data;
  },

  // Image Management
  queryImages: async () => {
    const response = await httpClient.get(ENDPOINTS.V2.IMAGE.QUERY);
    return response.data;
  },

  addImage: async (imageData: any) => {
    const response = await httpClient.post(ENDPOINTS.V2.IMAGE.ADD, imageData);
    return response.data;
  },

  editImage: async (imageId: string, imageData: any) => {
    const response = await httpClient.put(`${ENDPOINTS.V2.IMAGE.EDIT}/${imageId}`, imageData);
    return response.data;
  },

  // Font Management
  uploadFont: async (fontFile: File) => {
    const formData = new FormData();
    formData.append('file', fontFile);
    const response = await httpClient.post(ENDPOINTS.V2.FONT.UPLOAD, formData);
    return response.data;
  },

  getFontList: async () => {
    const response = await httpClient.get(ENDPOINTS.V2.FONT.LIST);
    return response.data;
  },

  // Core Operations
  restartCore: async () => {
    const response = await httpClient.post(ENDPOINTS.V2.CORE.RESTART);
    return response.data;
  }
};
