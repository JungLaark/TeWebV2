import React, { useRef, useEffect, useState } from 'react';
import DrawingTools from '../DrawingTools'; // 추가
import './Canvas.css';
import { TObject } from '../../types';  // CanvasObjectProperties를 TObject로 변경

interface CanvasProps {
  width: number;
  height: number;
  tagName: string;
  objects: TObject[];  // 타입 변경
  onUpdateObjects: (objects: TObject[]) => void;  // 타입 변경
  onObjectSelect: (object: TObject | null) => void;  // 타입 변경
  selectedObjectIds: string[];
  setSelectedObjectIds: (ids: string[]) => void;
  onAddShape: (type: string) => void;
  onAddText: () => void;
}

const Canvas: React.FC<CanvasProps> = ({
  width,
  height,
  tagName,
  objects,
  onUpdateObjects,
  onObjectSelect,
  selectedObjectIds,
  setSelectedObjectIds,
  onAddShape,
  onAddText,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
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

  // 캔버스의 실제 좌표로 변환하는 함수 수정
  const convertToCanvasCoordinates = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  // 마우스 이벤트 핸들러 수정
  const handleMouseDown = (event: React.MouseEvent) => {
    event.preventDefault();
    const mousePos = convertToCanvasCoordinates(event.clientX, event.clientY);
    if (!mousePos) return;

    console.log('Mouse down at:', mousePos);

    // 선택된 객체의 리사이즈 핸들 체크
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
            console.log('Resize handle grabbed:', direction);
            setDraggingMode('resize');
            setResizeStartPos(mousePos);
            setCursorDirection(direction);
            return;
          }
        }
      }
    }

    // 객체 선택 체크
    const hoveredObject = objects.find(obj => isPointInObject(mousePos, obj));
    
    if (hoveredObject) {
      console.log('Object selected:', hoveredObject);
      setSelectedObjectId(hoveredObject.id);
      onObjectSelect(hoveredObject);
      setDraggingMode('object');
      setDragObject({
        id: hoveredObject.id,
        startX: mousePos.x - hoveredObject.PosX,
        startY: mousePos.y - hoveredObject.PosY
      });
      setSelectedObjectIds([hoveredObject.id]);
    } else {
      if (!event.shiftKey) {
        setSelectedObjectIds([]);
        setSelectedObjectId(null);
        onObjectSelect(null);
      }
    }
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    const mousePos = convertToCanvasCoordinates(event.clientX, event.clientY);
    if (!mousePos || !draggingMode) return;

    if (draggingMode === 'resize' && selectedObjectId) {
      const selectedObject = objects.find(obj => obj.id === selectedObjectId);
      if (!selectedObject || !resizeStartPos) return;

      console.log('Resizing:', { direction: cursorDirection, mousePos, selectedObject });

      const dx = mousePos.x - resizeStartPos.x;
      const dy = mousePos.y - resizeStartPos.y;

      let newProps = { ...selectedObject };

      switch (cursorDirection) {
        case 'n':
          newProps.PosY = selectedObject.PosY + dy;
          newProps.Height = Math.max(10, selectedObject.Height - dy);
          break;
        case 's':
          newProps.Height = Math.max(10, selectedObject.Height + dy);
          break;
        case 'e':
          newProps.Width = Math.max(10, selectedObject.Width + dx);
          break;
        case 'w':
          newProps.PosX = selectedObject.PosX + dx;
          newProps.Width = Math.max(10, selectedObject.Width - dx);
          break;
        case 'nw':
          newProps.PosX = selectedObject.PosX + dx;
          newProps.PosY = selectedObject.PosY + dy;
          newProps.Width = Math.max(10, selectedObject.Width - dx);
          newProps.Height = Math.max(10, selectedObject.Height - dy);
          break;
        case 'ne':
          newProps.Width = Math.max(10, selectedObject.Width + dx);
          newProps.PosY = selectedObject.PosY + dy;
          newProps.Height = Math.max(10, selectedObject.Height - dy);
          break;
        case 'sw':
          newProps.PosX = selectedObject.PosX + dx;
          newProps.Width = Math.max(10, selectedObject.Width - dx);
          newProps.Height = Math.max(10, selectedObject.Height + dy);
          break;
        case 'se':
          newProps.Width = Math.max(10, selectedObject.Width + dx);
          newProps.Height = Math.max(10, selectedObject.Height + dy);
          break;
      }

      // 객체 상태 업데이트 및 선택된 객체 정보 갱신
      const updatedObjects = objects.map(obj =>
        obj.id === selectedObjectId ? newProps : obj
      );

      // 상태 업데이트 및 선택된 객체 정보 갱신
      onUpdateObjects(updatedObjects);
      onObjectSelect(newProps);
      setResizeStartPos(mousePos);

      console.log('Resized object:', newProps); // 디버깅용
    }

    console.log('Mouse move:', { draggingMode, mousePos });  // 디버깅 로그 추가

    if (draggingMode === 'object' && dragObject) {
      const newPosX = mousePos.x - dragObject.startX;
      const newPosY = mousePos.y - dragObject.startY;

      const updatedObjects = objects.map(obj => {
        if (obj.id === dragObject.id) {
          const newObj = {
            ...obj,
            PosX: newPosX,
            PosY: newPosY
          };
          // 객체가 이동할 때마다 선택된 객체 업데이트
          if (obj.id === selectedObjectId) {
            onObjectSelect(newObj);
          }
          return newObj;
        }
        return obj;
      });

      onUpdateObjects(updatedObjects);
    }
  };

  // Canvas 렌더링 부분 수정
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    if (!width || !height) {
      console.error('Invalid canvas dimensions:', { width, height });
      return;
    }

    // 캔버스 크기 설정
    canvas.width = width;
    canvas.height = height;
    
    // 배경 초기화
    ctx.fillStyle = '#2D3748';
    ctx.fillRect(0, 0, width, height);

    // 모든 객체 그리기
    objects.forEach(obj => {
      console.log('Drawing object:', obj);
      drawObject(ctx, obj);
    });

    // 선택된 객체 표시
    objects.forEach(obj => {
      if (selectedObjectIds.includes(obj.id)) {
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(obj.PosX, obj.PosY, obj.Width, obj.Height);
        
        if (selectedObjectId === obj.id) {
          drawResizeHandles(ctx, obj);
        }
      }
    });

  }, [width, height, objects, selectedObjectIds, selectedObjectId]);

  // 객체 내부의 점인지 확인하는 헬퍼 함수 수정
  const isPointInObject = (point: { x: number; y: number }, object: TObject) => {
    const { PosX, PosY, Width, Height } = object;
    
    // 디버깅용
    console.log('Checking point:', point, 'against object:', {
      PosX, PosY, Width, Height,
      containsPoint: (
        point.x >= PosX &&
        point.x <= PosX + Width &&
        point.y >= PosY &&
        point.y <= PosY + Height
      )
    });
    
    return (
      point.x >= PosX &&
      point.x <= PosX + Width &&
      point.y >= PosY &&
      point.y <= PosY + Height
    );
  };

  // 커서 스타일 결정 함수
  const getCursor = () => {
    if (draggingMode === 'object') return 'move';
    if (draggingMode === 'canvas') return 'grabbing';
    return 'grab';
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

  // 마우스 위치 계산 함수 수정
  const getCanvasMousePosition = (event: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return null;

    const x = (event.clientX - rect.left) / scale;
    const y = (event.clientY - rect.top) / scale;

    // 디버깅용
    console.log('Mouse position:', { x, y, scale, clientX: event.clientX, clientY: event.clientY, rect });

    return { x, y };
  };

  // 객체 그리기 함수 수정
  const drawObject = (ctx: CanvasRenderingContext2D, object: TObject) => {
    ctx.save();
    
    const { id, PosX, PosY, Width, Height, Rotation = 0, FillColor, PenColor, PenWidth, Type, IsFilled } = object;
    
    // 객체 중심을 기준으로 회전
    ctx.translate(PosX + Width / 2, PosY + Height / 2);
    ctx.rotate(Rotation);
    ctx.translate(-(PosX + Width / 2), -(PosY + Height / 2));

    // 스타일 설정 (색상 적용 부분 수정)
    ctx.fillStyle = FillColor || 'white';
    ctx.strokeStyle = PenColor || 'black';
    ctx.lineWidth = PenWidth || 1;

    // 객체 타입별 그리기
    switch (Type.toLowerCase()) {
      case 'rect':
        if (IsFilled) {
          ctx.fillRect(PosX, PosY, Width, Height);
        }
        ctx.strokeRect(PosX, PosY, Width, Height);
        break;

      case 'circle':
        ctx.beginPath();
        ctx.arc(PosX + Width/2, PosY + Height/2, Math.min(Width, Height)/2, 0, Math.PI * 2);
        if (IsFilled) {
          ctx.fill();
        }
        ctx.stroke();
        break;

      case 'triangle':
        ctx.beginPath();
        ctx.moveTo(PosX + Width/2, PosY);
        ctx.lineTo(PosX, PosY + Height);
        ctx.lineTo(PosX + Width, PosY + Height);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;

      case 'ellipse':
        ctx.beginPath();
        ctx.ellipse(PosX + Width/2, PosY + Height/2, Width/2, Height/2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        break;

      case 'line':
        ctx.beginPath();
        ctx.moveTo(PosX, PosY);
        ctx.lineTo(PosX + Width, PosY + Height);
        ctx.stroke();
        break;

      case 'text':
        const { Text, FontSize, FontFamily, FillColor } = object;
        // 편집 중인 텍스트는 그리지 않음
        if (editingText && object.id === editingText.id) {
          return;
        }
        ctx.fillStyle = FillColor || '#FFFFFF';
        ctx.font = `${FontSize}px ${FontFamily}`;
        ctx.textBaseline = 'top';
        ctx.fillText(Text || '', PosX, PosY);
        
        // 선택된 객체일 때만 경계 상자 표시
        if (selectedObjectIds.includes(object.id)) {
          ctx.strokeStyle = object.PenColor;
          ctx.lineWidth = object.PenWidth;
          ctx.strokeRect(PosX, PosY, Width, Height);
        }
        break;

      case 'polygon':
      case 'polyline':
        if (object.Points) {
          ctx.beginPath();
          object.Points.forEach((point: any, index: number) => {
            if (index === 0) {
              ctx.moveTo(point.x, point.y);
            } else {
              ctx.lineTo(point.x, point.y);
            }
          });
          if (object.Type === 'polygon') {
            ctx.closePath();
          }
          ctx.fill();
          ctx.stroke();

          // 점 편집 핸들 그리기
          if (object.id === selectedObjectId) {
            object.Points.forEach((point: any) => {
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

    // 선택된 객체 표시 강화
    if (selectedObjectIds.includes(id)) {
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 2;
      ctx.strokeRect(PosX, PosY, Width, Height);
      
      // 리사이즈 핸들 그리기
      if (selectedObjectId === id) {
        drawResizeHandles(ctx, object);
      }
    }

    ctx.restore();
  };

  // 리사이즈 핸들 그리기 함수 추가
  const drawResizeHandles = (ctx: CanvasRenderingContext2D, object: TObject) => {
    const handles = getResizeHandles(object);
    
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 1;
    
    Object.values(handles).forEach(handle => {
      ctx.beginPath();
      ctx.arc(handle.x, handle.y, HANDLE_SIZE / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });
  };

  // 리사이즈 핸들 위치 계산
  const getResizeHandles = (object: TObject) => {
    const { PosX, PosY, Width, Height } = object;
    return {
      n: { x: PosX + Width / 2, y: PosY, cursor: 'n-resize' },
      s: { x: PosX + Width / 2, y: PosY + Height, cursor: 's-resize' },
      e: { x: PosX, y: PosY + Height / 2, cursor: 'e-resize' },
      w: { x: PosX, y: PosY + Height / 2, cursor: 'w-resize' },
      nw: { x: PosX, y: PosY, cursor: 'nw-resize' },
      ne: { x: PosX + Width, y: PosY, cursor: 'ne-resize' },
      sw: { x: PosX, y: PosY + Height, cursor: 'sw-resize' },
      se: { x: PosX + Width, y: PosY + Height, cursor: 'se-resize' }
    };
  };

  // 회전 핸들 위치 계산
  const getRotationHandlePosition = (object: TObject) => {
    const { PosX, PosY, Width, Height, Rotation = 0 } = object;
    const centerX = PosX + Width / 2;
    const centerY = PosY + Height / 2;
    const handleDistance = 30; // 회전 핸들과 객체 중심 사이의 거리

    return {
      x: centerX + handleDistance * Math.cos(Rotation),
      y: centerY + handleDistance * Math.sin(Rotation)
    };
  };

  const handleDoubleClick = (event: React.MouseEvent) => {
    const mousePos = getCanvasMousePosition(event);
    if (!mousePos) return;

    const clickedObject = objects.find(obj => {
      if (obj.Type !== 'text') return false;
      const { PosX, PosY, Width, Height } = obj;
      return isPointInObject(mousePos, obj);
    });

    if (clickedObject && clickedObject.Type === 'text') {
      // 선택된 텍스트 객체의 정확한 위치 정보 저장
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      setEditingText({
        id: clickedObject.id,
        x: clickedObject.PosX,
        y: clickedObject.PosY,
        value: clickedObject.Text || ''
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
          x: editedObject.PosX,
          y: editedObject.PosY
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
          Text: e.target.value
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

  // 휠 이벤트 리스너를 상위 컨테이너에 추가
  useEffect(() => {
    const mainContainer = document.querySelector('.flex-1.flex.items-center.justify-center');
    if (!mainContainer) return;

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();

      const delta = event.deltaY;
      const scaleChange = delta > 0 ? 0.9 : 1.1;
      const newScale = Math.min(Math.max(scale * scaleChange, 0.1), 5);

      setScale(newScale);
    };

    mainContainer.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      mainContainer.removeEventListener('wheel', handleWheel);
    };
  }, [scale]);

  // 드래그로 이동 가능하도록 추가
  const handleCanvasMouseDown = (event: React.MouseEvent) => {
    if (event.button === 1 || event.button === 2) { // 중간 버튼 또는 오른쪽 버튼
      setIsDragging(true);
      setStartPos({
        x: event.clientX - position.x,
        y: event.clientY - position.y
      });
    }
  };

  const handleCanvasMouseMove = (event: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: event.clientX - startPos.x,
        y: event.clientY - startPos.y
      });
    }
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
  };

  const calculateFitScale = () => {
    if (!containerRef.current) return 1;
    const container = containerRef.current;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    const scaleX = containerWidth / width;
    const scaleY = containerHeight / height;
    return Math.min(scaleX, scaleY, 1); // 최대값을 1로 제한
  };

  // 컴포넌트 마운트 시 초기 스케일 설정
  useEffect(() => {
    setScale(calculateFitScale());
  }, [width, height]);

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="flex-1 overflow-hidden relative">
        <div 
          className="absolute inset-0 flex items-center justify-center"
          style={{ 
            cursor: isDragging ? 'grabbing' : 'grab',
            transform: `scale(${scale})`,
            transformOrigin: 'center',
            transition: 'transform 0.1s ease-out'
          }}
        >
          <div 
            ref={containerRef}
            className="canvas-container relative"
            style={{ 
              width: `${width}px`,
              height: `${height}px`,
              maxWidth: '100%',
              maxHeight: '100%'
            }}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
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
                  transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px)`
                }}
              />
              {editingText && (
                <div
                  style={{
                    position: 'absolute',
                    left: getTextInputPosition(editingText.x, editingText.y).left,
                    top: getTextInputPosition(editingText.x, editingText.y).top,
                    zIndex: 1000
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
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-4 right-4 bg-gray-800 px-2 py-1 rounded text-sm text-white">
        {Math.round(scale * 100)}%
      </div>
    </div>
  );
};

export default Canvas;
