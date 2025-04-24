import React from 'react';
import './CommonPopup.css';

interface LoadingOverlayProps {
  isOpen: boolean;
  message?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isOpen, message }) => {
  if (!isOpen) return null;
  return (
    <div className="popup-overlay">
      <div className="loading-popup-content">
        <div className="loader" />
        <div className="mt-2 text-white text-lg font-semibold">{message || '로딩 중입니다...'}</div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
