import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginService } from '../../api/services/auth';
import { LoginRequest } from '../../api/types/auth';

const Login: React.FC = () => {
  const navigate = useNavigate();
  
  // 로그인 자격 증명 상태
  const [credentials, setCredentials] = useState({
    username: localStorage.getItem('savedUsername') || '',
    password: '',
    url: localStorage.getItem('serverUrl') || '192.168.1.10',
    type: (localStorage.getItem('serverType') || 'CORE') as 'CORE' | 'ESN',
    protocol: (localStorage.getItem('protocol') || 'V2') as 'V1' | 'V2'
  });
  
  const [error, setError] = useState('');
  const [keepUsername, setKeepUsername] = useState(!!localStorage.getItem('savedUsername'));
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // localStorage에 저장된 인증 상태 확인
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [navigate]);

  // API를 통한 로그인 처리
  const handleLogin = async () => {
    if (!credentials.username || !credentials.password) {
      setError('아이디와 비밀번호를 입력해주세요.');
      return;
    }

    if (!credentials.url) {
      setError('서버 URL을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const loginRequest: LoginRequest = {
        username: credentials.username,
        password: credentials.password,
        type: credentials.type,
        protocol: credentials.protocol,
        url: credentials.url
      };

      console.log('로그인 요청:', loginRequest);
      const response = await loginService.login(loginRequest);

      if (response.success) {
        console.log('로그인 성공:', response);
        
        // 로그인 설정 저장
        if (keepUsername) {
          localStorage.setItem('savedUsername', credentials.username);
        } else {
          localStorage.removeItem('savedUsername');
        }
        
        // 서버 설정 저장
        localStorage.setItem('serverUrl', credentials.url);
        localStorage.setItem('serverType', credentials.type);
        localStorage.setItem('protocol', credentials.protocol);
        
        // 인증 상태 저장
        localStorage.setItem('isAuthenticated', 'true');
        if (response.token) {
          localStorage.setItem('authToken', response.token);
        }
        
        // 대시보드로 이동
        navigate('/dashboard');
      } else {
        console.error('로그인 실패:', response.message);
        setError(response.message || '로그인에 실패했습니다. 자격 증명을 확인해주세요.');
      }
    } catch (err) {
      console.error('로그인 오류:', err);
      setError('서버 연결 중 오류가 발생했습니다. 서버 설정을 확인해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin();
  };

  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-[480px]">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">Template Editor WEB</h1>

        {error && (
          <div className="mb-4 p-2 bg-red-500 text-white rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 로그인 입력 필드 */}
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300">
                아이디
              </label>
              <input
                type="text"
                id="username"
                className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-blue-500"
                value={credentials.username}
                onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                비밀번호
              </label>
              <input
                type="password"
                id="password"
                className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-blue-500"
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="keepUsername"
                className="h-4 w-4 text-blue-600 rounded border-gray-600 bg-gray-700"
                checked={keepUsername}
                onChange={(e) => setKeepUsername(e.target.checked)}
              />
              <label htmlFor="keepUsername" className="ml-2 text-sm text-gray-300">
                아이디 저장
              </label>
            </div>

            {/* 서버 설정 토글 버튼 */}
            <div className="pt-2">
              <button
                type="button"
                className="text-sm text-blue-400 hover:text-blue-300"
                onClick={toggleSettings}
              >
                {showSettings ? '서버 설정 닫기' : '서버 설정 열기'}
              </button>
            </div>

            {/* 서버 설정 패널 */}
            {showSettings && (
              <div className="border border-gray-600 rounded-md p-4 mt-2 space-y-3">
                <div>
                  <label htmlFor="serverUrl" className="block text-sm font-medium text-gray-300">
                    서버 URL
                  </label>
                  <input
                    type="text"
                    id="serverUrl"
                    className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white text-sm focus:ring-2 focus:ring-blue-500"
                    value={credentials.url}
                    onChange={(e) => setCredentials(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="예: 192.168.1.10"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="serverType" className="block text-sm font-medium text-gray-300">
                      서버 유형
                    </label>
                    <select
                      id="serverType"
                      className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white text-sm focus:ring-2 focus:ring-blue-500"
                      value={credentials.type}
                      onChange={(e) => setCredentials(prev => ({ ...prev, type: e.target.value as 'CORE' | 'ESN' }))}
                    >
                      <option value="CORE">CORE</option>
                      <option value="ESN">ESN</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="protocol" className="block text-sm font-medium text-gray-300">
                      프로토콜 버전
                    </label>
                    <select
                      id="protocol"
                      className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white text-sm focus:ring-2 focus:ring-blue-500"
                      value={credentials.protocol}
                      onChange={(e) => setCredentials(prev => ({ ...prev, protocol: e.target.value as 'V1' | 'V2' }))}
                      disabled={credentials.type !== 'CORE'}
                    >
                      <option value="V1">V1</option>
                      <option value="V2">V2</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </button>

          <div className="text-center text-sm text-gray-400 mt-2">
            <p>테스트 계정: admin / esl</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
