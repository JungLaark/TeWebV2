import React from 'react';
import './CommonPopup.css';

interface AlertDialogProps {
  isOpen: boolean;
  message: string;
  onClose: () => void;
}

const AlertDialog: React.FC<AlertDialogProps> = ({ isOpen, message, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <div className="text-white text-lg font-semibold mb-4 text-nowrap">{message}</div>
        <button className="common-popup-btn" onClick={onClose}>확인</button>
      </div>
    </div>
  );
};

export default AlertDialog;
