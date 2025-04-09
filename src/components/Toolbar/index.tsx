import React from 'react';
import { 
  FileText, // CSV
  Type, // Fonts
  Image, // Image Codes
  Calendar, // Reservations
  FolderOpen, // Load Template
  Combine, // Merge Templates
  Save, // Save Template
  Download, // Export Bitmap
  Upload, // Send to CORE/ESN
  Download as DownloadCloud, // Load from CORE/ESN
  LogOut 
} from 'lucide-react';
import './Toolbar.css';
import { handleTemplateFileLoad } from '../../utils/fileHandlers';

interface ToolbarProps {
  onLogout: () => void;
  onManageCSV: () => void;
  onManageFonts: () => void;
  onManageImageCodes: () => void;
  onManageReservations: () => void;
  onLoadTemplate: () => void;
  onMergeTemplates: () => void;
  onSaveTemplate: () => void;
  onExportBitmap: () => void;
  onSendToCoreESN: () => void;
  onLoadFromCoreESN: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onLogout,
  onManageCSV,
  onManageFonts,
  onManageImageCodes,
  onManageReservations,
  onLoadTemplate,
  onMergeTemplates,
  onSaveTemplate,
  onExportBitmap,
  onSendToCoreESN,
  onLoadFromCoreESN
}) => {
  const handleLoadTemplate = async () => {
    const template = await handleTemplateFileLoad();
    if (template) {
      onLoadTemplate();  // 부모 컴포넌트에 알림
    }
  };

  return (
    <div className="bg-gray-800 p-2 border-b border-gray-700 flex justify-between items-center">
      {/* 왼쪽 여백 */}
      <div className="w-[250px] flex items-center">
        <span className="text-xl font-bold">Template Editor WEB</span>
      </div>

      {/* 중앙 관리 메뉴 */}
      <div className="flex space-x-2">
        <button onClick={onManageCSV} className="toolbar-button" title="Manage CSV">
          <FileText size={18} />
        </button>
        <button onClick={onManageFonts} className="toolbar-button" title="Manage Fonts">
          <Type size={18} />  {/* FontSize를 Type으로 변경 */}
        </button>
        <button onClick={onManageImageCodes} className="toolbar-button" title="Manage Image Codes">
          <Image size={18} />
        </button>
        <button onClick={onManageReservations} className="toolbar-button" title="Manage Reservations">
          <Calendar size={18} />
        </button>
        <div className="h-6 w-px bg-gray-600 mx-2" /> {/* 구분선 */}
        <button onClick={handleLoadTemplate} className="toolbar-button" title="Load Template">
          <FolderOpen size={18} />
        </button>
        <button onClick={onMergeTemplates} className="toolbar-button" title="Merge Templates">
          <Combine size={18} />
        </button>
        <button onClick={onSaveTemplate} className="toolbar-button" title="Save Template">
          <Save size={18} />
        </button>
        <button onClick={onExportBitmap} className="toolbar-button" title="Export Bitmap">
          <Download size={18} />
        </button>
        <div className="h-6 w-px bg-gray-600 mx-2" /> {/* 구분선 */}
        <button onClick={onSendToCoreESN} className="toolbar-button" title="Send to CORE/ESN">
          <Upload size={18} />
        </button>
        <button onClick={onLoadFromCoreESN} className="toolbar-button" title="Load from CORE/ESN">
          <DownloadCloud size={18} />
        </button>
      </div>

      {/* 오른쪽 로그아웃 */}
      <div className="w-[250px] flex justify-end">
        <button onClick={onLogout} className="toolbar-button" title="Logout">
          <LogOut size={18} />
        </button>
      </div>
    </div>
  );
};

export default Toolbar;