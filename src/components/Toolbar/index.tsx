import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import './Toolbar.css';

interface ToolbarProps {
  onAddShape: (type: 'rect' | 'circle' | 'triangle' | 'ellipse' | 'line' | 'polygon' | 'polyline') => void;
  onAddText: () => void;
  onSave: () => void;
  onExport: () => void;
  onLogout: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onAddShape,
  onAddText,
  onSave,
  onExport,
  onLogout
}) => {
  return (
    <div className="bg-gray-800 p-4 border-b border-gray-700 flex items-center justify-between">
      <div className="flex space-x-2">
        <button
          onClick={() => onAddShape('rect')}
          className="p-2 bg-gray-700 rounded hover:bg-gray-600 transition-colors tooltip"
          title="Rectangle"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="4" y="4" width="16" height="16" rx="2" strokeWidth="2"/>
          </svg>
        </button>
        <button
          onClick={() => onAddShape('circle')}
          className="p-2 bg-gray-700 rounded hover:bg-gray-600 transition-colors tooltip"
          title="Circle"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="8" strokeWidth="2"/>
          </svg>
        </button>
        <button
          onClick={() => onAddShape('triangle')}
          className="p-2 bg-gray-700 rounded hover:bg-gray-600 transition-colors tooltip"
          title="Triangle"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M12 3L22 21H2L12 3z" strokeWidth="2"/>
          </svg>
        </button>
        <button
          onClick={() => onAddShape('ellipse')}
          className="p-2 bg-gray-700 rounded hover:bg-gray-600 transition-colors tooltip"
          title="Ellipse"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <ellipse cx="12" cy="12" rx="10" ry="6" strokeWidth="2"/>
          </svg>
        </button>
        <button
          onClick={() => onAddShape('line')}
          className="p-2 bg-gray-700 rounded hover:bg-gray-600 transition-colors tooltip"
          title="Line"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="4" y1="20" x2="20" y2="4" strokeWidth="2"/>
          </svg>
        </button>
        <button
          onClick={() => onAddShape('polygon')}
          className="p-2 bg-gray-700 rounded hover:bg-gray-600 transition-colors tooltip"
          title="Polygon"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M12 2L22 8.5L17 19H7L2 8.5L12 2z" strokeWidth="2"/>
          </svg>
        </button>
        <button
          onClick={() => onAddShape('polyline')}
          className="p-2 bg-gray-700 rounded hover:bg-gray-600 transition-colors tooltip"
          title="Polyline"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polyline points="4,4 8,12 12,4 16,12 20,4" strokeWidth="2"/>
          </svg>
        </button>
        <button
          onClick={onAddText}
          className="p-2 bg-gray-700 rounded hover:bg-gray-600 transition-colors tooltip"
          title="Add Text"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M4 7h16M12 7v10M8 17h8" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
      <div className="flex gap-4">
        <div className="flex space-x-2">
          <button
            onClick={onSave}
            className="p-2 bg-gray-700 rounded hover:bg-gray-600 transition-colors tooltip"
            title="Save"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" strokeWidth="2"/>
              <polyline points="17 21 17 13 7 13 7 21" strokeWidth="2"/>
              <polyline points="7 3 7 8 15 8" strokeWidth="2"/>
            </svg>
          </button>
          <button
            onClick={onExport}
            className="p-2 bg-gray-700 rounded hover:bg-gray-600 transition-colors tooltip"
            title="Export"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeWidth="2"/>
              <polyline points="7 10 12 15 17 10" strokeWidth="2"/>
              <line x1="12" y1="15" x2="12" y2="3" strokeWidth="2"/>
            </svg>
          </button>
        </div>
        <div className="border-l border-gray-600 pl-4">
          <button
            onClick={onLogout}
            className="p-2 bg-red-600 rounded hover:bg-red-700 transition-colors tooltip"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};