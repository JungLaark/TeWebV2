import React from 'react';
import { Minus, Square, Circle, Image as ImageIcon, Type, Barcode, QrCode, ArrowRight } from 'lucide-react';
import './DrawingTools.css';

interface DrawingToolsProps {
  onAddShape: (type: string) => void;
  onAddText: () => void;
}

const DrawingTools: React.FC<DrawingToolsProps> = ({ onAddShape, onAddText }) => {
  console.log('DrawingTools rendered', { onAddShape, onAddText });

  const handleShapeClick = (type: string) => {
    console.log('Shape button clicked:', type);
    onAddShape(type);
  };

  const handleTextClick = () => {
    console.log('Text button clicked');
    onAddText();
  };

  return (
    <div className="drawing-tools bg-gray-800 p-2 border-t border-gray-700 flex justify-center space-x-2">
  <button onClick={() => handleShapeClick('line')} className="toolbar-button" title="Line">
    <Minus size={18} />
  </button>
  <button onClick={() => handleShapeClick('rect')} className="toolbar-button" title="Rectangle">
    <Square size={18} />
  </button>
  <button onClick={() => handleShapeClick('roundrect')} className="toolbar-button" title="Rounded Rect">
    <Square size={18} style={{ borderRadius: 4 }} />
  </button>
  <button onClick={() => handleShapeClick('ellipse')} className="toolbar-button" title="Ellipse">
    <Circle size={18} />
  </button>
  <button onClick={() => handleShapeClick('arrow')} className="toolbar-button" title="Arrow">
    <ArrowRight size={18} />
  </button>
  <button onClick={() => handleTextClick()} className="toolbar-button" title="Text">
    <Type size={18} />
  </button>
  <button onClick={() => handleShapeClick('image')} className="toolbar-button" title="Image">
    <ImageIcon size={18} />
  </button>
  <button onClick={() => handleShapeClick('barcode')} className="toolbar-button" title="Barcode">
    <Barcode size={18} />
  </button>
  <button onClick={() => handleShapeClick('qrcode')} className="toolbar-button" title="QRcode">
    <QrCode size={18} />
  </button>
</div>
  );
};

export default DrawingTools;
