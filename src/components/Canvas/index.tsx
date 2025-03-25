import React, { useRef, useEffect, useState } from 'react';
import './Canvas.css';

interface CanvasObject {
  id: string;
  type: string;
  properties: any;
}

interface CanvasState {
  objects: CanvasObject[];
  scale: number;
  position: { x: number; y: number };
}

interface CanvasProps {
  width: number;
  height: number;
  tagName: string;
  objects: CanvasObject[];
  onUpdateObjects: (objects: CanvasObject[]) => void;
  onObjectSelect: (object: CanvasObject | null) => void;
  selectedObjectIds: string[];
  setSelectedObjectIds: (ids: string[]) => void;
}

const Canvas: React.FC<CanvasProps> = ({
  width,
  height,
  tagName,
  objects,
  onUpdateObjects,
  onObjectSelect,
  selectedObjectIds,
  setSelectedObjectIds
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [canvasStates, setCanvasStates] = useState<Record<string, CanvasState>>({});
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStartPos, setResizeStartPos] = useState({ x: 0, y: 0 });
  const [dragObject, setDragObject] = useState<{ id: string; startX: number; startY: number } | null>(null);
  const [isResizingHandle, setIsResizingHandle] = useState(false);
  const [draggingMode, setDraggingMode] = useState<'canvas' | 'object' | 'resize' | 'selection' | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<{ objectId: string; pointIndex: number } | null>(null);
  const [isRotating, setIsRotating] = useState(false);
  const [rotateStartAngle, setRotateStartAngle] = useState(0);
  const [cursorDirection, setCursorDirection] = useState<string | null>(null);
  const [selectionBox, setSelectionBox] = useState<{ start: { x: number; y: number } | null, end: { x: number; y: number } | null}>({ start: null, end: null });
  const [editingText, setEditingText] = useState<{
    id: string;
    x: number;
    y: number;
    value: string;
  } | null>(null);

  // Constants
  const HANDLE_SIZE = 8;
  const HANDLE_HITBOX = 10;

  // 캔버스 초기화 및 렌더링
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, width, height);
    objects.forEach(obj => drawObject(ctx, obj));
  }, [width, height, objects]);

  // 객체 내부의 점인지 확인하는 헬퍼 함수
  const isPointInObject = (point: { x: number; y: number }, object: CanvasObject) => {
    const { x, y, width, height } = object.properties;
    return (
      point.x >= x &&
      point.x <= x + width &&
      point.y >= y &&
      point.y <= y + height
    );
  };

  // 커서 스타일 결정 함수
  const getCursor = () => {
    if (draggingMode === 'object') return 'move';
    if (draggingMode === 'canvas') return 'grabbing';
    return 'grab';
  };

  // 마우스 이벤트 핸들러들
  const handleMouseDown = (event: React.MouseEvent) => {
    event.preventDefault();
    const mousePos = getCanvasMousePosition(event);
    if (!mousePos) return;

    // 리사이즈 핸들 체크를 먼저 수행
    if (selectedObjectId) {
      const selectedObject = objects.find(obj => obj.id === selectedObjectId);
      if (selectedObject) {
        const handles = getResizeHandles(selectedObject);
        for (const [direction, handle] of Object.entries(handles)) {
          const distance = Math.sqrt(
            Math.pow(mousePos.x - handle.x, 2) + 
            Math.pow(mousePos.y - handle.y, 2)
          );
          if (distance < HANDLE_HITBOX) {
            setDraggingMode('resize');
            setResizeStartPos(mousePos);
            setCursorDirection(direction);
            return;
          }
        }
      }
    }

    const hoveredObject = objects.find(obj => isPointInObject(mousePos, obj));
    
    if (!hoveredObject) {
      // 빈 영역 클릭 시 무조건 선택 초기화
      if (!event.shiftKey) {
        setSelectedObjectIds([]);
        setSelectedObjectId(null);
        onObjectSelect(null);
      }
      
      // 드래그 시작 시에만 selection mode 활성화
      if (event.button === 0) { // 좌클릭일 때만
        setDraggingMode('selection');
        setSelectionBox({ 
          start: { x: mousePos.x, y: mousePos.y }, 
          end: { x: mousePos.x, y: mousePos.y } 
        });
      }
      return;
    }

    setSelectedObjectId(hoveredObject.id);
    onObjectSelect(hoveredObject);
    setDraggingMode('object');
    setDragObject({
      id: hoveredObject.id,
      startX: mousePos.x - hoveredObject.properties.x,
      startY: mousePos.y - hoveredObject.properties.y
    });
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    const mousePos = getCanvasMousePosition(event);
    if (!mousePos || !draggingMode) return;

    if (draggingMode === 'selection' && selectionBox.start) {
      setSelectionBox(prev => ({
        ...prev,
        end: { x: mousePos.x, y: mousePos.y }
      }));

      // 선택 영역 내의 객체들 찾기
      const boxLeft = Math.min(selectionBox.start.x, mousePos.x);
      const boxRight = Math.max(selectionBox.start.x, mousePos.x);
      const boxTop = Math.min(selectionBox.start.y, mousePos.y);
      const boxBottom = Math.max(selectionBox.start.y, mousePos.y);

      const selectedIds = objects.filter(obj => {
        const { x, y, width, height } = obj.properties;
        return (
          x < boxRight &&
          x + width > boxLeft &&
          y < boxBottom &&
          y + height > boxTop
        );
      }).map(obj => obj.id);

      if (event.shiftKey) {
        setSelectedObjectIds(prev => 
          Array.from(new Set([...prev, ...selectedIds]))
        );
      } else {
        setSelectedObjectIds(selectedIds);
      }
    } else if (draggingMode === 'object' && dragObject) {
      const updatedObjects = objects.map(obj => {
        if (obj.id === dragObject.id) {
          return {
            ...obj,
            properties: {
              ...obj.properties,
              x: mousePos.x - dragObject.startX,
              y: mousePos.y - dragObject.startY
            }
          };
        }
        return obj;
      });
      onUpdateObjects(updatedObjects);
    } else if (draggingMode === 'resize' && selectedObjectId) {
      const selectedObject = objects.find(obj => obj.id === selectedObjectId);
      if (!selectedObject) return;

      const { x, y, width, height } = selectedObject.properties;
      const dx = mousePos.x - (resizeStartPos?.x || 0);
      const dy = mousePos.y - (resizeStartPos?.y || 0);

      let newProps = { ...selectedObject.properties };

      switch (cursorDirection) {
        case 'n':
          newProps.y = y + dy;
          newProps.height = height - dy;
          break;
        case 's':
          newProps.height = height + dy;
          break;
        case 'e':
          newProps.width = width + dx;
          break;
        case 'w':
          newProps.x = x + dx;
          newProps.width = width - dx;
          break;
        case 'nw':
          newProps.x = x + dx;
          newProps.y = y + dy;
          newProps.width = width - dx;
          newProps.height = height - dy;
          break;
        case 'ne':
          newProps.y = y + dy;
          newProps.width = width + dx;
          newProps.height = height - dy;
          break;
        case 'sw':
          newProps.x = x + dx;
          newProps.width = width - dx;
          newProps.height = height + dy;
          break;
        case 'se':
          newProps.width = width + dx;
          newProps.height = height + dy;
          break;
      }

      // 최소 크기 제한
      newProps.width = Math.max(10, newProps.width);
      newProps.height = Math.max(10, newProps.height);

      const updatedObjects = objects.map(obj =>
        obj.id === selectedObjectId
          ? { ...obj, properties: newProps }
          : obj
      );

      onUpdateObjects(updatedObjects);
      setResizeStartPos(mousePos);
    }
  };

  const handleMouseUp = () => {
    if (draggingMode === 'selection' && selectedObjectIds.length > 0) {
      const firstSelectedObject = objects.find(obj => obj.id === selectedObjectIds[0]);
      if (firstSelectedObject) {
        setSelectedObjectId(firstSelectedObject.id);
        onObjectSelect(firstSelectedObject);
      }
    }
    
    setSelectionBox({ start: null, end: null });
    setDraggingMode(null);
    setDragObject(null);
  };

  // 마우스 위치 계산 함수
  const getCanvasMousePosition = (event: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return null;
    return {
      x: (event.clientX - rect.left) / scale,
      y: (event.clientY - rect.top) / scale
    };
  };

  // 객체 그리기 함수
  const drawObject = (ctx: CanvasRenderingContext2D, object: CanvasObject) => {
    ctx.save();
    
    const { x, y, width, height, rotation = 0 } = object.properties;
    const centerX = x + width / 2;
    const centerY = y + height / 2;

    // 회전 적용
    ctx.translate(centerX, centerY);
    ctx.rotate(rotation);
    ctx.translate(-centerX, -centerY);

    // 선택된 객체 표시를 selectedObjectIds 기반으로 처리
    if (selectedObjectIds.includes(object.id)) {
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 2;
      ctx.strokeRect(x - 2, y - 2, width + 4, height + 4);
      ctx.fillStyle = '#00ff00';
      ctx.fillRect(x + width - 5, y + height - 5, 10, 10);
    }

    // 객체 스타일 설정
    ctx.fillStyle = object.properties.fillColor || '#FFFFFF';
    ctx.strokeStyle = object.properties.strokeColor || '#000000';
    ctx.lineWidth = object.properties.strokeWidth || 1;

    // 객체 타입별 그리기
    switch(object.type) {
      case 'rect':
        ctx.fillRect(x, y, width, height);
        ctx.strokeRect(x, y, width, height);
        break;

      case 'circle':
        ctx.beginPath();
        ctx.arc(x + width/2, y + height/2, Math.min(width, height)/2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        break;

      case 'triangle':
        ctx.beginPath();
        ctx.moveTo(x + width/2, y);
        ctx.lineTo(x, y + height);
        ctx.lineTo(x + width, y + height);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;

      case 'ellipse':
        ctx.beginPath();
        ctx.ellipse(x + width/2, y + height/2, width/2, height/2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        break;

      case 'line':
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + width, y + height);
        ctx.stroke();
        break;

      case 'text':
        const { text, fontSize, fontFamily, fillColor } = object.properties;
        // 편집 중인 텍스트는 그리지 않음
        if (editingText && object.id === editingText.id) {
          return;
        }
        ctx.fillStyle = fillColor || '#FFFFFF';
        ctx.font = `${fontSize}px ${fontFamily}`;
        ctx.textBaseline = 'top';
        ctx.fillText(text || '', x, y);
        
        // 선택된 객체일 때만 경계 상자 표시
        if (selectedObjectIds.includes(object.id)) {
          ctx.strokeStyle = object.properties.strokeColor;
          ctx.lineWidth = object.properties.strokeWidth;
          ctx.strokeRect(x, y, width, height);
        }
        break;

      case 'polygon':
      case 'polyline':
        if (object.properties.points) {
          ctx.beginPath();
          object.properties.points.forEach((point: any, index: number) => {
            if (index === 0) {
              ctx.moveTo(point.x, point.y);
            } else {
              ctx.lineTo(point.x, point.y);
            }
          });
          if (object.type === 'polygon') {
            ctx.closePath();
          }
          ctx.fill();
          ctx.stroke();

          // 점 편집 핸들 그리기
          if (object.id === selectedObjectId) {
            object.properties.points.forEach((point: any) => {
              ctx.beginPath();
              ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
              ctx.fillStyle = '#00ff00';
              ctx.fill();
              ctx.strokeStyle = '#ffffff';
              ctx.stroke();
            });
          }
        }
        break;
    }

    // 선택된 객체일 경우 추가 컨트롤 그리기
    if (object.id === selectedObjectId) {
      // 회전 핸들 그리기
      const handlePos = getRotationHandlePosition(object);
      ctx.beginPath();
      ctx.arc(handlePos.x, handlePos.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#00ff00';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      // 회전 핸들과 객체 중심을 연결하는 선
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(handlePos.x, handlePos.y);
      ctx.strokeStyle = '#00ff00';
      ctx.stroke();

      // 리사이즈 핸들 그리기
      const handles = getResizeHandles(object);
      Object.entries(handles).forEach(([direction, handle]) => {
        ctx.beginPath();
        ctx.rect(
          handle.x - HANDLE_SIZE / 2,
          handle.y - HANDLE_SIZE / 2,
          HANDLE_SIZE,
          HANDLE_SIZE
        );
        ctx.fillStyle = '#00ff00';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();
      });
    }

    ctx.restore();
  };

  // 리사이즈 핸들 위치 계산
  const getResizeHandles = (object: CanvasObject) => {
    const { x, y, width, height } = object.properties;
    return {
      n: { x: x + width / 2, y: y, cursor: 'n-resize' },
      s: { x: x + width / 2, y: y + height, cursor: 's-resize' },
      e: { x: x + width, y: y + height / 2, cursor: 'e-resize' },
      w: { x: x, y: y + height / 2, cursor: 'w-resize' },
      nw: { x: x, y: y, cursor: 'nw-resize' },
      ne: { x: x + width, y: y, cursor: 'ne-resize' },
      sw: { x: x, y: y + height, cursor: 'sw-resize' },
      se: { x: x + width, y: y + height, cursor: 'se-resize' }
    };
  };

  // 회전 핸들 위치 계산
  const getRotationHandlePosition = (object: CanvasObject) => {
    const { x, y, width, height, rotation = 0 } = object.properties;
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const handleDistance = 30; // 회전 핸들과 객체 중심 사이의 거리

    return {
      x: centerX + handleDistance * Math.cos(rotation),
      y: centerY + handleDistance * Math.sin(rotation)
    };
  };

  const handleDoubleClick = (event: React.MouseEvent) => {
    const mousePos = getCanvasMousePosition(event);
    if (!mousePos) return;

    const clickedObject = objects.find(obj => {
      if (obj.type !== 'text') return false;
      const { x, y, width, height } = obj.properties;
      return isPointInObject(mousePos, obj);
    });

    if (clickedObject && clickedObject.type === 'text') {
      // 선택된 텍스트 객체의 정확한 위치 정보 저장
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      setEditingText({
        id: clickedObject.id,
        x: clickedObject.properties.x,
        y: clickedObject.properties.y,
        value: clickedObject.properties.text || ''
      });
    }
  };

  // editingText 상태의 위치를 업데이트하는 useEffect 추가
  useEffect(() => {
    if (editingText) {
      const editedObject = objects.find(obj => obj.id === editingText.id);
      if (editedObject) {
        setEditingText(prev => ({
          ...prev!,
          x: editedObject.properties.x,
          y: editedObject.properties.y
        }));
      }
    }
  }, [objects, editingText?.id]);

  // 텍스트 입력 UI 위치 계산 함수 수정
  const getTextInputPosition = (x: number, y: number) => {
    const canvas = canvasRef.current;
    const wrapper = canvas?.parentElement;
    if (!canvas || !wrapper) return { left: 0, top: 0 };

    const canvasRect = canvas.getBoundingClientRect();
    const wrapperRect = wrapper.getBoundingClientRect();

    // 캔버스의 실제 위치와 스케일을 고려한 계산
    const scaledX = x * scale;
    const scaledY = y * scale;
    
    return {
      left: scaledX + canvasRect.left - wrapperRect.left,
      top: scaledY + canvasRect.top - wrapperRect.top
    };
  };

  // 텍스트 입력 처리 함수 수정
  const handleTextInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingText) return;

    const updatedObjects = objects.map(obj => {
      if (obj.id === editingText.id) {
        return {
          ...obj,
          properties: {
            ...obj.properties,
            text: e.target.value
          }
        };
      }
      return obj;
    });

    onUpdateObjects(updatedObjects);
    setEditingText(prev => ({
      ...prev!,
      value: e.target.value
    }));
  };

  const handleTextInputBlur = () => {
    setEditingText(null);
  };

  // 휠 이벤트 핸들러
  const handleWheel = (event: React.WheelEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const delta = event.deltaY;
    const scaleChange = delta > 0 ? 0.9 : 1.1; // 휠 방향에 따라 축소/확대
    
    // 최소/최대 스케일 제한
    const newScale = Math.min(Math.max(scale * scaleChange, 0.1), 5);
    setScale(newScale);
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
    >
      <div 
        className="canvas-wrapper"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={handleDoubleClick}
      >
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="canvas"
          style={{
            transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px) scale(${scale})`
          }}
          onWheel={handleWheel}
        />
        {editingText && (
          <div
            style={{
              position: 'absolute',
              ...getTextInputPosition(editingText.x, editingText.y),
              zIndex: 1000,
            }}
          >
            <input
              type="text"
              value={editingText.value}
              onChange={handleTextInputChange}
              onBlur={handleTextInputBlur}
              style={{
                position: 'relative',
                background: 'transparent',
                color: '#FFFFFF',
                border: '1px solid #00ff00',
                outline: 'none',
                fontFamily: 'Arial',
                fontSize: `${20}px`,
                padding: '2px',
                margin: 0,
                minWidth: '100px'
              }}
              autoFocus
            />
          </div>
        )}
        {selectionBox.start && selectionBox.end && (
          <div className="selection-box" style={{
            left: Math.min(selectionBox.start.x, selectionBox.end.x),
            top: Math.min(selectionBox.start.y, selectionBox.end.y),
            width: Math.abs(selectionBox.end.x - selectionBox.start.x),
            height: Math.abs(selectionBox.end.y - selectionBox.start.y)
          }} />
        )}
        <div className="scale-indicator">
          {Math.round(scale * 100)}%
        </div>
      </div>
    </div>
  );
};

export default Canvas;
