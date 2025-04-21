import axios from 'axios';

// HTTP 클라이언트 인스턴스 생성
export const httpClient = axios.create({
  baseURL: '/', // 프록시 경로 사용
  headers: {
    'Content-Type': 'application/json',
  },
  // API 요청이 실패했을 때 상세 오류 정보를 얻기 위한 설정
  validateStatus: function (status) {
    // 모든 상태 코드를 성공으로 처리하여 오류를 던지지 않고 응답 객체를 얻을 수 있도록 함
    return true; // status >= 200 && status < 300
  },
});

// CORS 관련 설정
httpClient.defaults.withCredentials = false; // CORS 문제로 인해 credentials 비활성화

// 요청 인터셉터
httpClient.interceptors.request.use(
  config => {
    // 요청 로깅
    console.log('Request:', {
      method: config.method,
      url: config.url,
      baseURL: config.baseURL,
      headers: config.headers,
      data: config.data || null
    });
    
    // 인증 토큰 추가 (Basic Auth)
    // localStorage에서 'token' 키로 값을 읽음
    const token = localStorage.getItem('token');
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = token;
    }
    
    return config;
  },
  error => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터
httpClient.interceptors.response.use(
  response => {
    // 응답 상태 코드 및 데이터 로깅
    console.log(`Response [${response.status}]:`, {
      url: response.config.url,
      data: response.data,
      headers: response.headers
    });
    
    // 401 오류 처리
    if (response.status === 401) {
      console.warn('Authentication failed (401):', response.data);
      // 추가적인 401 처리 로직을 여기에 구현할 수 있습니다.
    }
    
    // 200번대가 아닌 상태 코드는 에러로 처리
    if (response.status < 200 || response.status >= 300) {
      return Promise.reject({
        response: response,
        message: `Request failed with status code ${response.status}`
      });
    }
    
    return response;
  },
  error => {
    console.error('API Error:', error);
    if (error.response) {
      console.error('Error data:', error.response.data);
      console.error('Error status:', error.response.status);
      console.error('Error headers:', error.response.headers);
    } else if (error.request) {
      console.error('Error request:', error.request);
    } else {
      console.error('Error message:', error.message);
    }
    
    return Promise.reject(error);
  }
);