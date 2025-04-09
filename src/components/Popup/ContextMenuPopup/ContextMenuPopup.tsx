import React, { useState } from 'react';
import './ContextMenuPopup.css';

interface ContextMenuPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (value: string) => void;
  defaultValue: string;
  title: string;
}

const ContextMenuPopup: React.FC<ContextMenuPopupProps> = ({
  isOpen,
  onClose,
  onConfirm,
  defaultValue,
  title
}) => {
  const [inputValue, setInputValue] = useState(defaultValue);

  const handleConfirm = () => {
    if (inputValue.trim()) {
      onConfirm(inputValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleConfirm();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-container">
        <div className="popup-header">
          <h2>{title}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="popup-content">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="popup-input"
            autoFocus
          />
          <div className="popup-buttons">
            <button 
              className="popup-button confirm" 
              onClick={handleConfirm}
            >
              OK
            </button>
            <button 
              className="popup-button cancel" 
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContextMenuPopup;
