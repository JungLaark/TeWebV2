import { httpClient } from '../utils/httpClient';
import { ENDPOINTS } from '../index';

// 서버에서 template 정보를 가져오는 함수 (Basic Auth + token 헤더)
export const fetchTemplateData = async (data = {}) => {
  // localStorage에서 토큰을 읽어와 'token' 헤더로 전달
  const token = localStorage.getItem('token');
  const basicAuth = 'Basic ' + btoa('esl:esl');
  const response = await httpClient.post(
    ENDPOINTS.V2.IMPORT_TE_DATA,
    data,
    {
      headers: {
        Authorization: basicAuth,
        token: token
      }
    }
  );
  return response.data;
};

// 템플릿 관련 API