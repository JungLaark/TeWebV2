import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    username: localStorage.getItem('savedUsername') || '', // 저장된 사용자 이름 불러오기
    password: ''
  });
  const [error, setError] = useState('');
  const [keepUsername, setKeepUsername] = useState(!!localStorage.getItem('savedUsername')); // 체크박스 상태
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    type: 'CORE',  // 'CORE' or 'ESN'
    protocol: 'V1', // 'V1' or 'V2'
    url: ''
  });

  // URL 유효성 검사
  const validateUrl = (url: string, type: string): boolean => {
    if (type === 'CORE') {
      // IP 주소 형식 검사 (192.168.1.10)
      return /^(?:\d{1,3}\.){3}\d{1,3}$/.test(url);
    } else {
      // http://domain:port 형식 검사
      return /^http:\/\/.+:\d+$/.test(url);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings(prev => ({
      ...prev,
      url: e.target.value
    }));
  };

  // 설정 타입 변경 시 URL 초기화
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSettings(prev => ({
      ...prev,
      type: e.target.value,
      url: '' // URL 초기화
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateUrl(settings.url, settings.type)) {
      setError('Invalid URL format');
      return;
    }

    if (credentials.username === 'test' && credentials.password === 'test') {
      // 체크박스 상태에 따라 사용자 이름 저장/삭제
      if (keepUsername) {
        localStorage.setItem('savedUsername', credentials.username);
      } else {
        localStorage.removeItem('savedUsername');
      }
      
      localStorage.setItem('isAuthenticated', 'true');
      window.location.href = '/dashboard'; // 페이지 강제 리로드
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-96">
        <h1 className="text-3xl font-bold text-white mb-6">Template Editor WEB</h1>

        {error && (
          <div className="mb-4 p-2 bg-red-500 text-white rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-300">
              Username
            </label>
            <input
              type="text"
              id="username"
              className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={credentials.username}
              onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              Keep Username
            </label>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Sign In
          </button>

          <div className="pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              className={`
                w-full px-3 py-2 text-sm rounded transition-colors
                ${showSettings 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}
              `}
            >
              {showSettings ? 'Close Settings' : 'Settings'}
            </button>
          </div>
        </form>

        {showSettings && (
          <div className="mt-6 p-4 bg-gray-700 rounded"> {/* mt-6 추가 */}
            <h2 className="text-lg font-medium text-white mb-3">Settings</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Type</label>
                <select
                  value={settings.type}
                  onChange={handleTypeChange}
                  className="w-full bg-gray-600 text-white px-3 py-2 rounded"
                >
                  <option value="CORE">CORE</option>
                  <option value="ESN">ESN</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Protocol</label>
                <select
                  value={settings.protocol}
                  onChange={(e) => setSettings(prev => ({ ...prev, protocol: e.target.value }))}
                  className="w-full bg-gray-600 text-white px-3 py-2 rounded"
                >
                  <option value="V1">V1</option>
                  <option value="V2">V2</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">URL</label>
                <input
                  type="text"
                  value={settings.url}
                  onChange={handleUrlChange}
                  placeholder={settings.type === 'CORE' ? '192.168.1.10' : 'http://domain:port'}
                  className="w-full bg-gray-600 text-white px-3 py-2 rounded"
                />
                <p className="text-xs text-gray-400 mt-1">
                  {settings.type === 'CORE' 
                    ? 'Format: 192.168.1.10'
                    : 'Format: http://domain:port'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
