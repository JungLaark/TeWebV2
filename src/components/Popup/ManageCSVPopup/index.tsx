import React from 'react';
import CommonPopup from '../CommonPopup';
import './ManageCSVPopup.css';

interface ManageCSVPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const ManageCSVPopup: React.FC<ManageCSVPopupProps> = ({ isOpen, onClose }) => {
  return (
    <CommonPopup
      isOpen={isOpen}
      onClose={onClose}
      title="Manage CSV"
      width={800}
      height={600}
    >
      <div className="csv-popup-content">
        {/* CSV 관리 UI 내용 */}
        <div className="csv-tools">
          <button className="tool-button">Import CSV</button>
          <button className="tool-button">Export CSV</button>
        </div>
        <div className="csv-list">
          {/* CSV 목록이 들어갈 자리 */}
        </div>
      </div>
    </CommonPopup>
  );
};

export default ManageCSVPopup;
