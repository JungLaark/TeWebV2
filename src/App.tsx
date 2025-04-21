import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard/index';
import Login from './pages/Login';

// 인증이 필요한 라우트를 위한 래퍼 컴포넌트
const RequireAuth = ({ children }: { children: JSX.Element }) => {
  // localStorage에서 인증 상태 직접 확인
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  
  if (!isAuthenticated) {
    // 인증되지 않은 경우 로그인 페이지로 리디렉션
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// 인증된 상태에서 로그인 페이지 접근 방지
const RequireNonAuth = ({ children }: { children: JSX.Element }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  
  if (isAuthenticated) {
    // 이미 인증된 경우 대시보드로 리디렉션
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* 루트 경로 - 인증 상태에 따라 리디렉션 */}
        <Route 
          path="/" 
          element={
            localStorage.getItem('isAuthenticated') === 'true' 
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
