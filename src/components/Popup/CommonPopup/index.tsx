import React from 'react';
import { X } from 'lucide-react';
import './CommonPopup.css';

interface CommonPopupProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: number;
  height?: number;
}

const CommonPopup: React.FC<CommonPopupProps> = ({
  isOpen,
  onClose,
  title,
  children,
  width = 600,
  height = 400,
}) => {
  if (!isOpen) return null;

  return (
    <div className="popup-overlay">
      <div 
        className="popup-content"
        style={{ width: `${width}px`, height: `${height}px` }}
      >
        <div className="popup-header">
          <h2>{title}</h2>
          <button onClick={onClose} className="close-button">
            <X size={20} />
          </button>
        </div>
        <div className="popup-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default CommonPopup;
