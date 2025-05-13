// 인증 관련 API
import { httpClient } from '../utils/httpClient';
import { ENDPOINTS } from '../index';
import { LoginRequest, LoginResponse } from '../types/auth';

export const loginService = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    try {
      console.log('Login request data:', data);
      
      let endpoint = '';
      
      // 엔드포인트 설정
      if (data.type === 'CORE') {
        endpoint = data.protocol === 'V1' 
          ? ENDPOINTS.V1.GET_USER
          : ENDPOINTS.V2.LOGIN;
      } else {
        endpoint = ENDPOINTS.ESN.USER.LOGIN;
      }
      
      console.log('Using endpoint:', endpoint);
      
      // Basic Auth 헤더를 직접 설정
      const basicAuthValue = btoa(`esl:esl`);  // 고정된 Basic Auth 값 사용
      console.log('Basic auth header (encoded):', basicAuthValue);
      
      // 서버 URL 구성
      let serverUrl = data.url;
      if (!serverUrl.includes('http://') && !serverUrl.includes('https://')) {
        serverUrl = `http://${serverUrl}`;
      }
      
      // 포트 추가 (필요한 경우)
      const urlWithoutProtocol = serverUrl.replace(/^https?:\/\//, '');
      if (!urlWithoutProtocol.includes(':')) {
        serverUrl = `${serverUrl}:${data.type === 'CORE' ? '8080' : '8081'}`;
      }
      
      console.log('Full server URL:', serverUrl);
      
      // API 요청 본문 준비 - 중요: 서버가 요구하는 형식에 맞춤
      const requestBody = {
        user_id: data.username,  // 사용자 입력 ID
        user_pw: data.password   // 사용자 입력 비밀번호
      };
      
      console.log('Request body:', requestBody);
      
      // 프록시를 통한 요청 시도
      try {
        // 프록시된 URL 사용
        const response = await httpClient.post(endpoint, requestBody, {
          headers: {
            'Authorization': `Basic ${basicAuthValue}`,
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest', // 브라우저 기본 인증 팝업 방지
            'x-target-server': data.url, // 대상 서버 정보
            'x-server-type': data.type, // 서버 타입
            'x-protocol-version': data.protocol // 프로토콜 버전
          }
        });

        console.log('Login response:', response);
        
        // 성공 응답 처리
        if (response.status >= 200 && response.status < 300) {
          // 서버 응답에서 인증 토큰과 결과 정보 추출

          console.log('response.data: ', response.data);

          const serverToken = response.data?.data?.[0]?.token;
          const serverResult = response.data?.result || 'success';

          // result가 'invalid_token'이면 로그인 실패 처리
          if (serverResult === 'invalid_token') {
            return {
              success: false,
              message: '아이디 또는 비밀번호가 올바르지 않습니다.'
            };
          }
          // 로컬 스토리지에 인증 정보 저장
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('token', serverToken);
          localStorage.setItem('lastLoginTime', new Date().toISOString());
          console.log('Login successful, redirecting to dashboard...');
          return {
            success: true,
            token: serverToken,
            result: serverResult
          };
        } else {
          // 오류 응답 처리
          console.error('API returned error status:', response.status);
          console.error('Error response data:', response.data);
          
          // 사용자에게 표시할 오류 메시지 생성
          let errorMessage = '로그인에 실패했습니다';
          if (response.data?.message) {
            errorMessage = response.data.message;
          } else if (response.status === 401) {
            errorMessage = '아이디 또는 비밀번호가 올바르지 않습니다';
          } else if (response.status === 404) {
            errorMessage = '서버를 찾을 수 없습니다';
          } else if (response.status >= 500) {
            errorMessage = '서버 오류가 발생했습니다';
          }
          
          return {
            success: false,
            message: errorMessage
          };
        }
      } catch (proxyError) {
        console.error('Proxy request failed:', proxyError);
        // 데모/테스트 목적으로 임시 로그인 성공 처리 (실제 서버 연결 불가 시)
        // if (data.username === 'admin' && data.password === 'esl') {
        //   console.log('Using mock login response (for demo/testing)');
        //   localStorage.setItem('isAuthenticated', 'true');
        //   localStorage.setItem('authToken', 'mock-token-for-demo');
        //   localStorage.setItem('lastLoginTime', new Date().toISOString());
        //   return {
        //     success: true,
        //     token: 'mock-token-for-demo',
        //     result: 'success'
        //   };
        // }
        // 실패 처리
        let errorMessage = '서버에 연결할 수 없습니다';
        if (typeof proxyError === 'object' && proxyError && 'message' in proxyError) {
          errorMessage = (proxyError as any).message || errorMessage;
        }
        return {
          success: false,
          message: errorMessage
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const errObj = error as any;
        console.error('Error response status:', errObj.response.status);
        console.error('Error response data:', errObj.response.data);
      }
      return {
        success: false,
        message: (error && typeof error === 'object' && 'response' in error && (error as any).response?.data?.message) || (error as any).message || '로그인 중 오류가 발생했습니다'
      };
    }
  }
};

export const logout = async (): Promise<void> => {
  // 로컬 스토리지에서 인증 정보 제거
  localStorage.removeItem('isAuthenticated');
  localStorage.removeItem('authToken');
  localStorage.removeItem('lastLoginTime');
  
  try {
    // 서버에 로그아웃 요청 (선택적)
    await httpClient.post(ENDPOINTS.V2.LOGOUT);
    console.log('Server logout successful');
  } catch (error) {
    console.warn('Server logout failed, but local session was cleared:', error);
  }
};