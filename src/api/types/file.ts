// 파일 관련 타입

export interface FileUploadRequest {
  file: File;
}

export interface FileUploadResponse {
  fileId: string;
  fileName: string;
}