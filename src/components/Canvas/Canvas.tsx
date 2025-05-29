import React, { useRef, useEffect, useState } from 'react';
import { TObject } from '../../types';
import './Canvas.css';

interface CanvasProps {
  width: number;
  height: number;
  objects: TObject[];
  onUpdateObjects: (objects: TObject[]) => void;
  onObjectSelect: (objectId: string) => void;
  selectedObjectIds: string[];
  setSelectedObjectIds: (ids: string[]) => void;
  editingTextId: string | null;
  editingTextValue: string;
  editingTextPos: {x: number, y: number, width: number, height: number} | null;
  setEditingTextId: (id: string | null) => void;
  setEditingTextValue: (value: string) => void;
  setEditingTextPos: (pos: {x: number, y: number, width: number, height: number} | null) => void;
  onUpdateTextObject: (id: string, text: string) => void;
}

const Canvas: React.FC<CanvasProps> = ({ 
  width, 
  height, 
  objects, 
  onUpdateObjects,
  onObjectSelect,
  selectedObjectIds,
  setSelectedObjectIds,
  editingTextId,
  editingTextValue,
  editingTextPos,
  setEditingTextId,
  setEditingTextValue,
  setEditingTextPos,
  onUpdateTextObject 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [selectionBox, setSelectionBox] = useState<{ start: { x: number, y: number } | null, end: { x: number, y: number } | null }>({ start: null, end: null });
  const isPanning = useRef(false);
  const start = useRef({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && selectedObjectIds.length > 0) {
        const remaining = objects.filter(obj => !selectedObjectIds.includes(String(obj.ZOrder)));
        onUpdateObjects(remaining);
        setSelectedObjectIds([]);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [objects, selectedObjectIds, onUpdateObjects, setSelectedObjectIds]);

  const onMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    isPanning.current = true;
    start.current = {
      x: e.clientX,
      y: e.clientY,
      scrollLeft: containerRef.current?.scrollLeft ?? 0,
      scrollTop: containerRef.current?.scrollTop ?? 0,
    };
    document.body.style.cursor = 'grab';
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isPanning.current || !containerRef.current) return;
    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;
    containerRef.current.scrollLeft = start.current.scrollLeft - dx;
    containerRef.current.scrollTop = start.current.scrollTop - dy;
  };

  const onMouseUp = () => {
    isPanning.current = false;
    document.body.style.cursor = '';
  };

  return (
    <div 
      ref={containerRef}
      className="canvas-container"
      style={{ 
        width: `${width}px`, 
        height: `${height}px`,
        maxWidth: '100%',
        maxHeight: '100%'
      }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      <div 
        className="canvas-wrapper">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: 'center',
            cursor: getCursor()
          }}
        />
        {editingTextId && editingTextPos && (
          <input
            style={{
              position: 'absolute',
              left: editingTextPos.x,
              top: editingTextPos.y,
              width: editingTextPos.width,
              height: editingTextPos.height,
              font: 'inherit',
              zIndex: 100,
              background: 'transparent',
              color: '#000',
              border: '1px solid #888',
            }}
            value={editingTextValue}
            autoFocus
            onChange={e => setEditingTextValue(e.target.value)}
            onBlur={() => {
              onUpdateTextObject(editingTextId, editingTextValue);
              setEditingTextId(null);
              setEditingTextPos(null);

              console.log('onBlur');
            }}
            onKeyDown={e => {
              if(e.key === 'Enter')
                e.currentTarget.blur();

              console.log('onKeyDown');
            }}
            />

        )}
        {selectionBox.start && selectionBox.end && (
          <div
            className="selection-box"
            style={{
              left: Math.min(selectionBox.start.x, selectionBox.end.x),
              top: Math.min(selectionBox.start.y, selectionBox.end.y),
              width: Math.abs(selectionBox.end.x - selectionBox.start.x),
              height: Math.abs(selectionBox.end.y - selectionBox.start.y)
            }}
          />
        )}
        <div className="scale-indicator">
          {Math.round(scale * 100)}%
        </div>
      </div>
    </div>
  );
};

// ...existing drawing functions...

export default Canvas;
