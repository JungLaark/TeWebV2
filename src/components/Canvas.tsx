import React, { useRef, useEffect, useState } from 'react';

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
}

const Canvas: React.FC<CanvasProps> = ({
  width,
  height,
  tagName,
  objects,
  onUpdateObjects,
  onObjectSelect
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
  const [draggingMode, setDraggingMode] = useState<'canvas' | 'object' | 'resize' | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<{ objectId: string; pointIndex: number } | null>(null);
  const [isRotating, setIsRotating] = useState(false);
  const [rotateStartAngle, setRotateStartAngle] = useState(0);

  // 캔버스 초기화 및 렌더링
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // 캔버스 크기 설정
    canvas.width = width;
    canvas.height = height;

    // 캔버스 클리어
    ctx.clearRect(0, 0, width, height);

    // 저장된 객체들 다시 그리기
    objects.forEach(obj => drawObject(ctx, obj));
  }, [width, height, objects]);

  // 태그 변경 시 상태 저장/복원
  useEffect(() => {
    if (!tagName) return;

    // 현재 상태 저장
    const currentState: CanvasState = {
      objects,
      scale,
      position,
    };

    setCanvasStates(prev => ({
      ...prev,
      [tagName]: currentState
    }));

    // 이전 상태 복원
    const savedState = canvasStates[tagName];
    if (savedState) {
      setScale(savedState.scale);
      setPosition(savedState.position);
    }
  }, [tagName]);

  // 줌 처리
  const handleWheel = (event: WheelEvent) => {
    event.preventDefault();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    const delta = event.deltaY;
    const scaleChange = delta > 0 ? 0.9 : 1.1;

    setScale(prev => {
      const newScale = Math.min(Math.max(prev * scaleChange, 0.1), 5);
      const scaleRatio = 1 - newScale / prev;
      setPosition(prev => ({
        x: prev.x + (mouseX - prev.x) * scaleRatio,
        y: prev.y + (mouseY - prev.y) * scaleRatio
      }));
      return newScale;
    });
  };

  const getMousePosition = (event: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return null;

    // 캔버스의 실제 위치 고려
    return {
      x: (event.clientX - rect.left - rect.width / 2) / scale - position.x,
      y: (event.clientY - rect.top - rect.height / 2) / scale - position.y
    };
  };

  const getCanvasMousePosition = (event: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return null;
    return {
      x: (event.clientX - rect.left) / scale,
      y: (event.clientY - rect.top) / scale
    };
  };

  const handleMouseDown = (event: React.MouseEvent) => {
    event.preventDefault();
    const mousePos = getCanvasMousePosition(event);
    if (!mousePos) return;

    // 회전 핸들 클릭 체크 추가
    if (selectedObjectId) {
      const selectedObject = objects.find(obj => obj.id === selectedObjectId);
      if (selectedObject) {
        const handlePos = getRotationHandlePosition(selectedObject);
        const distance = Math.sqrt(
          Math.pow(mousePos.x - handlePos.x, 2) +
          Math.pow(mousePos.y - handlePos.y, 2)
        );

        if (distance < 10) {
          handleRotateStart(event);
          return;
        }
      }
    }

    // 점 편집 모드 체크
    if (selectedObjectId) {
      const selectedObject = objects.find(obj => obj.id === selectedObjectId);
      if (selectedObject && (selectedObject.type === 'polygon' || selectedObject.type === 'polyline')) {
        const pointIndex = selectedObject.properties.points.findIndex((point: any) => {
          const distance = Math.sqrt(
            Math.pow(mousePos.x - point.x, 2) + 
            Math.pow(mousePos.y - point.y, 2)
          );
          return distance < 5;
        });

        if (pointIndex !== -1) {
          setSelectedPoint({ objectId: selectedObjectId, pointIndex });
          return;
        }
      }
    }

    // 객체 클릭 확인
    const clickedObject = objects.find(obj => {
      const { x, y, width, height } = obj.properties;
      return (
        mousePos.x >= x && 
        mousePos.x <= x + width && 
        mousePos.y >= y &&
        mousePos.y <= y + height
      );
    });

    if (clickedObject) {
      setSelectedObjectId(clickedObject.id);
      onObjectSelect(clickedObject);
      setDraggingMode('object');
      setDragObject({
        id: clickedObject.id,
        startX: mousePos.x - clickedObject.properties.x,
        startY: mousePos.y - clickedObject.properties.y
      });
    } else {
      setSelectedObjectId(null);
      onObjectSelect(null);
    }
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!draggingMode) return;

    if (draggingMode === 'canvas') {
      const deltaX = event.clientX - startPos.x;
      const deltaY = event.clientY - startPos.y;
      setStartPos({ x: event.clientX, y: event.clientY });
      setPosition(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
    } else if (draggingMode === 'object' && dragObject) {
      const mousePos = getCanvasMousePosition(event);
      if (!mousePos) return;

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
    }

    if (selectedPoint) {
      const mousePos = getCanvasMousePosition(event);
      if (!mousePos) return;

      const updatedObjects = objects.map(obj => {
        if (obj.id === selectedPoint.objectId) {
          const newPoints = [...obj.properties.points];
          newPoints[selectedPoint.pointIndex] = { x: mousePos.x, y: mousePos.y };
          return {
            ...obj,
            properties: {
              ...obj.properties,
              points: newPoints
            }
          };
        }
        return obj;
      });

      onUpdateObjects(updatedObjects);
    }

    if (isRotating && selectedObjectId) {
      const mousePos = getCanvasMousePosition(event);
      if (!mousePos) return;

      const selectedObject = objects.find(obj => obj.id === selectedObjectId);
      if (!selectedObject) return;

      const center = {
        x: selectedObject.properties.x + selectedObject.properties.width / 2,
        y: selectedObject.properties.y + selectedObject.properties.height / 2
      };

      const angle = Math.atan2(
        mousePos.y - center.y,
        mousePos.x - center.x
      ) - rotateStartAngle;

      const updatedObjects = objects.map(obj => {
        if (obj.id === selectedObjectId) {
          return {
            ...obj,
            properties: {
              ...obj.properties,
              rotation: angle
            }
          };
        }
        return obj;
      });

      onUpdateObjects(updatedObjects);
    }
  };

  const handleMouseUp = () => {
    setDraggingMode(null);
    setDragObject(null);
    setSelectedPoint(null);
    setIsRotating(false);
  };

  // 객체 선택 처리
  const handleCanvasClick = (event: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (event.clientX - rect.left) / scale - position.x;
    const y = (event.clientY - rect.top) / scale - position.y;
    // 클릭한 위치의 객체 찾기
    const clickedObject = objects.find(obj => {
      const { x: objX, y: objY, width, height } = obj.properties;
      return (
        x >= objX &&
        x <= objX + width &&
        y >= objY &&
        y <= objY + height
      );
    });

    setSelectedObjectId(clickedObject?.id || null);
    onObjectSelect(clickedObject || null);
  };

  // 객체 크기 조절 시작
  const handleResizeStart = (event: React.MouseEvent) => {
    event.stopPropagation();
    setIsResizing(true);
    setResizeStartPos({ x: event.clientX, y: event.clientY });
  };

  // 객체 크기 조절 중
  const handleResizeMove = (event: React.MouseEvent) => {
    if (!isResizing || !selectedObjectId) return;
    const deltaX = (event.clientX - resizeStartPos.x) / scale;
    const deltaY = (event.clientY - resizeStartPos.y) / scale;

    const updatedObjects = objects.map(obj => {
      if (obj.id === selectedObjectId) {
        return {
          ...obj,
          properties: {
            ...obj.properties,
            width: Math.max(10, obj.properties.width + deltaX),
            height: Math.max(10, obj.properties.height + deltaY)
          }
        };
      }
      return obj;
    });

    onUpdateObjects(updatedObjects);
    setResizeStartPos({ x: event.clientX, y: event.clientY });
  };

  // 커서 스타일 결정 함수 추가
  const getCursor = () => {
    if (draggingMode === 'object') return 'move';
    if (draggingMode === 'canvas') return 'grabbing';
    return 'grab';
  };

  // 회전 핸들 위치 계산 함수 추가
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

  const handleRotateStart = (event: React.MouseEvent) => {
    if (!selectedObjectId) return;

    const mousePos = getCanvasMousePosition(event);
    if (!mousePos) return;

    const selectedObject = objects.find(obj => obj.id === selectedObjectId);
    if (!selectedObject) return;

    const center = {
      x: selectedObject.properties.x + selectedObject.properties.width / 2,
      y: selectedObject.properties.y + selectedObject.properties.height / 2
    };

    setIsRotating(true);
    setRotateStartAngle(Math.atan2(
      mousePos.y - center.y,
      mousePos.x - center.x
    ));
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

    // 선택된 객체 표시
    if (object.id === selectedObjectId) {
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 2;
      ctx.strokeRect(x - 2, y - 2, width + 4, height + 4);
      ctx.fillStyle = '#00ff00';
      ctx.fillRect(x + width - 5, y + height - 5, 10, 10);
    }

    ctx.fillStyle = object.properties.fillColor || '#FFFFFF';
    ctx.strokeStyle = object.properties.strokeColor || '#000000';
    ctx.lineWidth = object.properties.strokeWidth || 1;

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
        ctx.fillStyle = object.properties.color || '#FFFFFF';
        ctx.font = `${object.properties.fontSize}px ${object.properties.fontFamily}`;
        ctx.fillText(object.properties.text || '', x, y);
        break;

      case 'polygon':
      case 'polyline':
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
        break;
    }

    // 회전 핸들 그리기
    if (object.id === selectedObjectId) {
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
    }

    ctx.restore();
  };

  return (
    <div 
      ref={containerRef}
      className="canvas-container bg-gray-800 rounded-lg"
      style={{ 
        width: `${width}px`, 
        height: `${height}px`,
        maxWidth: '100%',
        maxHeight: '100%'
      }}
    >
      <div 
        className="canvas-wrapper"
        style={{
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          position: 'relative',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
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
            cursor: getCursor(),
            backgroundColor: '#2D3748',
            border: '1px solid #4A5568'
          }}
        />
        <div className="absolute bottom-4 right-4 bg-gray-700 px-2 py-1 rounded text-sm">
          {Math.round(scale * 100)}%
        </div>
      </div>
    </div>
  );
};

export default Canvas;