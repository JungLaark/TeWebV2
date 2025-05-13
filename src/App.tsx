import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard/index';
import Login from './pages/Login';

// 인증이 필요한 라우트를 위한 래퍼 컴포넌트
const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem('isAuthenticated') === 'true');
  useEffect(() => {
    const onStorage = () => {
      setIsAuthenticated(localStorage.getItem('isAuthenticated') === 'true');
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const RequireNonAuth = ({ children }: { children: JSX.Element }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem('isAuthenticated') === 'true');
  useEffect(() => {
    const onStorage = () => {
      setIsAuthenticated(localStorage.getItem('isAuthenticated') === 'true');
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem('isAuthenticated') === 'true');
  useEffect(() => {
    const onStorage = () => {
      setIsAuthenticated(localStorage.getItem('isAuthenticated') === 'true');
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);
  return (
    <BrowserRouter>
      <Routes>
        {/* 루트 경로 - 인증 상태에 따라 리디렉션 */}
        <Route 
          path="/" 
          element={
            isAuthenticated 
              ? <Navigate to="/dashboard" replace /> 
              : <Navigate to="/login" replace />
          } 
        />
        
        {/* 로그인 페이지 - 인증되지 않은 경우에만 접근 가능 */}
        <Route 
          path="/login" 
          element={
            <RequireNonAuth>
              <Login />
            </RequireNonAuth>
          } 
        />
        
        {/* 대시보드 페이지 - 인증된 경우에만 접근 가능 */}
        <Route 
          path="/dashboard" 
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          } 
        />
        
        {/* 알 수 없는 경로 - 루트로 리디렉션 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
