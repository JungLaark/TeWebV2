// API 요청 및 응답 타입 정의
// 인증 관련 타입

export interface LoginRequest {
  username: string;
  password: string;
  type: 'CORE' | 'ESN';
  protocol?: 'V1' | 'V2';  // CORE일 때만 필요
  url: string;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  token?: string;
  result?: string;  // API.Result.V2 상수값들
  loginResult?: string;  // API.Result.V2.Login 상수값들
}

// API 응답 상수
export const API_RESULT = {
  V2: {
    SUCCESS: 'success',
    INVALID_TOKEN: 'invalid_token',
    LOGIN: {
      PWD_SHOULD_BE_CHANGED: 'password_should_be_changed',
      PWD_SHOULD_BE_MODIFIED: 'password_should_be_modified',
      USER_ID_LOCKED: 'user_id_locked',
      PWD_INCORRECT: 'password_incorrect',
      UNAUTH_USER: 'unauthenticated_user'
    }
  }
};