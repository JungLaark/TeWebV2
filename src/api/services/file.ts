// 파일 관련 API
import { httpClient } from '../utils/httpClient';
import { ENDPOINTS } from '../index';
import { FileUploadRequest, FileUploadResponse } from '../types/file';

export const uploadFile = async (data: FileUploadRequest): Promise<FileUploadResponse> => {
  const response = await httpClient.post(ENDPOINTS.FILE.UPLOAD, data);
  return response.data;
};

export const downloadFile = async (fileId: string): Promise<Blob> => {
  const response = await httpClient.get(`${ENDPOINTS.FILE.DOWNLOAD}/${fileId}`, {
    responseType: 'blob',
  });
  return response.data;
};