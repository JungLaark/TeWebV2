import React from 'react';
import { 
  Square,
  Circle,
  Triangle,
  Circle as Ellipse,
  Minus,
  Hexagon,
  Pentagon,
  Type,
} from 'lucide-react';
import './DrawingTools.css';

interface DrawingToolsProps {
  onAddShape: (type: string) => void;
  onAddText: () => void;
}

const DrawingTools: React.FC<DrawingToolsProps> = ({ onAddShape, onAddText }) => {
  return (
    <div className="drawing-tools bg-gray-800 p-2 border-t border-gray-700 flex justify-center space-x-2">
      <button onClick={() => onAddShape('rect')} className="toolbar-button" title="Rectangle">
        <Square size={18} />
      </button>
      <button onClick={() => onAddShape('circle')} className="toolbar-button" title="Circle">
        <Circle size={18} />
      </button>
      <button onClick={() => onAddShape('triangle')} className="toolbar-button" title="Triangle">
        <Triangle size={18} />
      </button>
      <button onClick={() => onAddShape('ellipse')} className="toolbar-button" title="Ellipse">
        <Ellipse size={18} />
      </button>
      <button onClick={() => onAddShape('line')} className="toolbar-button" title="Line">
        <Minus size={18} />
      </button>
      <button onClick={() => onAddShape('polygon')} className="toolbar-button" title="Polygon">
        <Hexagon size={18} />
      </button>
      <button onClick={() => onAddShape('polyline')} className="toolbar-button" title="Polyline">
        <Pentagon size={18} />
      </button>
      <button onClick={onAddText} className="toolbar-button" title="Add Text">
        <Type size={18} />
      </button>
    </div>
  );
};

export default DrawingTools;
