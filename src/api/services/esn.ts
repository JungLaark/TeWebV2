import { httpClient } from '../utils/httpClient';
import { ENDPOINTS } from '../index';

// ESN check constants
export const CHECK_STATUS = {
  CHECK_OUT: 0,
  CHECK_IN: 1
} as const;

export const esnService = {
  // Template Editor
  teSync: async () => {
    const response = await httpClient.get(ENDPOINTS.ESN.TE.SYNC);
    return response.data;
  },

  // Font Management
  getFontList: async () => {
    const response = await httpClient.get(ENDPOINTS.ESN.TE.FONT_LIST);
    return response.data;
  },

  uploadFont: async (fontFile: File) => {
    const formData = new FormData();
    formData.append('file', fontFile);
    const response = await httpClient.post(ENDPOINTS.ESN.TE.FONT_UPLOAD, formData);
    return response.data;
  },

  // Template Data
  importTemplateData: async (data: any) => {
    const response = await httpClient.post(ENDPOINTS.ESN.TE.IMPORT_TE_DATA, data);
    return response.data;
  },

  exportTemplateData: async (data: any) => {
    const response = await httpClient.post(ENDPOINTS.ESN.TE.EXPORT_TE_DATA, data);
    return response.data;
  },

  previewTemplateData: async (data: any) => {
    const response = await httpClient.post(ENDPOINTS.ESN.TE.PREVIEW_TE_DATA, data);
    return response.data;
  }
};
