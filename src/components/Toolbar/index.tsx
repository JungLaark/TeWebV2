import React from 'react';
import { 
  FileText, // CSV
  Type, // Fonts (FontSize 대신 Type 사용)
  Image, // Image Codes
  Calendar, // Reservations
  FolderOpen, // Load Template
  Combine, // Merge Templates
  Save, // Save Template
  Download, // Export Bitmap
  Upload, // Send to CORE/ESN
  Download as DownloadCloud, // Load from CORE/ESN
  Square, // Rectangle
  Circle, // Circle
  Triangle, // Triangle
  Circle as Ellipse, // Ellipse
  Minus, // Line
  Hexagon, // Polygon
  Pentagon, // Polyline
  LogOut 
} from 'lucide-react';
import './Toolbar.css';

interface ToolbarProps {
  onAddShape: (type: 'rect' | 'circle' | 'triangle' | 'ellipse' | 'line' | 'polygon' | 'polyline') => void;
  onAddText: () => void;
  onSave: () => void;
  onExport: () => void;
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
  onAddShape,
  onAddText,
  onSave,
  onExport,
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
  return (
    <div className="bg-gray-800 p-2 border-b border-gray-700 flex items-center">
      {/* 왼쪽 여백 */}
      <div className="w-1/4" />

      {/* 중앙 정렬된 도구 메뉴 */}
      <div className="flex-1 flex justify-center space-x-2">
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
        <button onClick={onLoadTemplate} className="toolbar-button" title="Load Template">
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

      {/* 오른쪽 여백 */}
      <div className="w-1/4 flex justify-end">
        <button onClick={onLogout} className="toolbar-button" title="Logout">
          <LogOut size={18} />
        </button>
      </div>
    </div>
  );
};

export default Toolbar;