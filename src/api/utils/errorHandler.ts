// API 유틸리티 함수
// 공통 에러 처리 로직

export const handleApiError = (error: any): string => {
  if (error.response) {
    return error.response.data.message || 'An error occurred';
  }
  if (error.request) {
    return 'No response from server';
  }
  return error.message || 'An unknown error occurred';
};