import React, { useRef, useEffect, useState, useCallback } from 'react';
import { TObject } from '../../types';
import './Canvas.css';

// JsBarcode와 QRCode 라이브러리 import
import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';

interface CanvasProps {
  width: number;
  height: number;
  tagName: string;
  objects: TObject[];
  onUpdateObjects: (objects: TObject[]) => void;
  onObjectSelect: (object: TObject | null) => void;
  selectedObjectIds: string[];
  setSelectedObjectIds: (ids: string[]) => void;
  onAddShape: (type: string) => void;
  onAddText: () => void;
}

const Canvas: React.FC<CanvasProps> = ({ 
  width, 
  height, 
  objects, 
  onUpdateObjects,
  onObjectSelect,
  selectedObjectIds,
  setSelectedObjectIds 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [selectedObjectsInitialPos, setSelectedObjectsInitialPos] = useState<{[key: string]: {x: number, y: number}}>({});
  const [draggingObjects, setDraggingObjects] = useState<{[key: string]: {x: number, y: number}}>({});

  // 더블 버퍼링을 위한 오프스크린 캔버스 참조 추가
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // 애니메이션 프레임 요청 ID를 저장할 ref 추가
  const rafRef = useRef<number>();

  const renderingRef = useRef<{
    isRendering: boolean;
    pendingRender: boolean;
    lastFrameTime: number;
  }>({
    isRendering: false,
    pendingRender: false,
    lastFrameTime: 0
  });

  // 객체의 고유 식별자 생성 함수
  const getObjectId = (obj: TObject): string => {
    // PosX, PosY, Width, Height, Type을 조합하여 고유 식별자 생성
    return `${obj.Type}_${obj.PosX}_${obj.PosY}_${obj.Width}_${obj.Height}_${obj.ZOrder}`;
  };

  // 객체가 클릭된 위치에 있는지 확인하는 함수
  const isObjectAtPosition = (obj: TObject, x: number, y: number): boolean => {
    // 회전을 고려한 좌표 변환
    if (obj.Rotation) {
      const centerX = obj.PosX + obj.Width / 2;
      const centerY = obj.PosY + obj.Height / 2;
      const cos = Math.cos(-obj.Rotation * Math.PI / 180);
      const sin = Math.sin(-obj.Rotation * Math.PI / 180);
      const dx = x - centerX;
      const dy = y - centerY;
      const rotatedX = centerX + dx * cos - dy * sin;
      const rotatedY = centerY + dx * sin + dy * cos;
      x = rotatedX;
      y = rotatedY;
    }

    return x >= obj.PosX && 
           x <= obj.PosX + obj.Width && 
           y >= obj.PosY && 
           y <= obj.PosY + obj.Height;
  };

  // 마우스 위치를 캔버스 좌표로 변환하는 함수 수정
  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const scaleX = (canvas.width / dpr) / rect.width;
    const scaleY = (canvas.height / dpr) / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  // 마우스 다운 핸들러 수정
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoordinates(e);
    
    // 클릭한 위치의 객체 찾기 (ZOrder가 높은 것부터 검사)
    for (let i = objects.length - 1; i >= 0; i--) {
      const obj = objects[i];
      if (isObjectAtPosition(obj, coords.x, coords.y)) {
        setIsDragging(true);
        setDragStartPos(coords);
        
        const objId = getObjectId(obj);
        
        // 드래그 시작 시 모든 선택된 객체의 초기 위치 저장
        const initialPositions: {[key: string]: {x: number, y: number}} = {};
        if (!selectedObjectIds.includes(objId)) {
          if (!e.ctrlKey) {
            setSelectedObjectIds([objId]);
            onObjectSelect(obj);
            initialPositions[objId] = { x: obj.PosX, y: obj.PosY };
          } else {
            setSelectedObjectIds([...selectedObjectIds, objId]);
            selectedObjectIds.forEach(id => {
              const selectedObj = objects.find(o => getObjectId(o) === id);
              if (selectedObj) {
                initialPositions[id] = { x: selectedObj.PosX, y: selectedObj.PosY };
              }
            });
            initialPositions[objId] = { x: obj.PosX, y: obj.PosY };
          }
        } else {
          // 이미 선택된 객체들의 초기 위치 저장
          selectedObjectIds.forEach(id => {
            const selectedObj = objects.find(o => getObjectId(o) === id);
            if (selectedObj) {
              initialPositions[id] = { x: selectedObj.PosX, y: selectedObj.PosY };
            }
          });
        }
        
        setSelectedObjectsInitialPos(initialPositions);
        return;
      }
    }

    // 빈 영역 클릭 시 선택 해제
    setSelectedObjectIds([]);
    onObjectSelect(null);
  };

  // 이전 드래깅 위치를 저장하는 ref 추가
  const previousDragPositionRef = useRef({ x: 0, y: 0 });
  
  // 마우스 이동 핸들러 최적화
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || selectedObjectIds.length === 0) return;

    e.preventDefault();

    const coords = getCanvasCoordinates(e);
    const dx = coords.x - dragStartPos.x;
    const dy = coords.y - dragStartPos.y;

    // 이전 위치와 현재 위치의 차이를 계산
    const deltaX = dx - previousDragPositionRef.current.x;
    const deltaY = dy - previousDragPositionRef.current.y;

    // 새로운 위치 계산에 델타값 사용
    const newDraggingObjects = Object.fromEntries(
      selectedObjectIds.map(objId => {
        const initialPos = selectedObjectsInitialPos[objId];
        if (!initialPos) return [objId, null];
        return [objId, {
          x: initialPos.x + dx,
          y: initialPos.y + dy
        }];
      }).filter(([_, pos]) => pos !== null)
    );

    setDraggingObjects(newDraggingObjects);
    
    // 현재 드래그 위치를 저장
    previousDragPositionRef.current = { x: dx, y: dy };

    // 렌더링 최적화
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d', { alpha: false });
      if (!ctx || !canvas) return;

      // 드래그 중인 객체들의 임시 상태 생성
      const draggedObjects = objects.map(obj => {
        const draggingPos = newDraggingObjects[getObjectId(obj)];
        if (draggingPos) {
          return {
            ...obj,
            PosX: draggingPos.x,
            PosY: draggingPos.y
          };
        }
        return obj;
      });

      // 렌더링
      renderCanvas(ctx, canvas, draggedObjects);
    });
  }, [isDragging, selectedObjectIds, dragStartPos, selectedObjectsInitialPos, objects]);

  // 마우스 업 핸들러 수정
  const handleMouseUp = () => {
    if (isDragging && Object.keys(draggingObjects).length > 0) {
      const updatedObjects = objects.map(obj => {
        const draggingPos = draggingObjects[getObjectId(obj)];
        if (draggingPos) {
          return {
            ...obj,
            PosX: draggingPos.x,
            PosY: draggingPos.y
          };
        }
        return obj;
      });
      onUpdateObjects(updatedObjects);
    }

    setIsDragging(false);
    setSelectedObjectsInitialPos({});
    setDraggingObjects({});
    previousDragPositionRef.current = { x: 0, y: 0 };
  };

  // 마우스 이벤트 핸들러
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    // 역순으로 순회하여 최상위 객체부터 검사
    for (let i = objects.length - 1; i >= 0; i--) {
      const obj = objects[i];
      if (isObjectAtPosition(obj, x, y)) {
        if (e.ctrlKey || e.metaKey) {
          // Ctrl/Cmd + 클릭: 다중 선택
          const newSelectedIds = [...selectedObjectIds];
          const index = newSelectedIds.indexOf(getObjectId(obj));
          if (index === -1) {
            newSelectedIds.push(getObjectId(obj));
          } else {
            newSelectedIds.splice(index, 1);
          }
          setSelectedObjectIds(newSelectedIds);
        } else {
          // 일반 클릭: 단일 선택
          setSelectedObjectIds([getObjectId(obj)]);
          onObjectSelect(obj);
        }
        return;
      }
    }

    // 빈 영역 클릭: 선택 해제
    setSelectedObjectIds([]);
    onObjectSelect(null);
  };

  // Canvas 요소에 이벤트 리스너 추가
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('click', handleCanvasClick as any);
    canvas.addEventListener('mousedown', handleMouseDown as any);
    canvas.addEventListener('mousemove', handleMouseMove as any);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp);

    return () => {
      canvas.removeEventListener('click', handleCanvasClick as any);
      canvas.removeEventListener('mousedown', handleMouseDown as any);
      canvas.removeEventListener('mousemove', handleMouseMove as any);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseUp);
    };
  }, [objects, scale, selectedObjectIds, isDragging, dragStartPos, selectedObjectsInitialPos, draggingObjects]);

  // 도형 그리기 함수들
  const drawRect = (ctx: CanvasRenderingContext2D, obj: TObject) => {
    ctx.save();
    const rect = {
      left: obj.PosX,
      top: obj.PosY,
      right: obj.PosX + obj.Width,
      bottom: obj.PosY + obj.Height
    };

    try {
      // 회전 처리
      if (obj.Rotation) {
        const centerX = obj.PosX + obj.Width / 2;
        const centerY = obj.PosY + obj.Height / 2;
        ctx.translate(centerX, centerY);
        ctx.rotate((obj.Rotation * Math.PI) / 180);
        ctx.translate(-centerX, -centerY);
      }

      // 특수 채우기 색상 처리
      if (obj.IsFilled) {
        if (obj.FillColor === "Orange") {
          // Orange 패턴 그리기
          for (let y = rect.top; y < rect.bottom; y++) {
            for (let x = rect.left; x < rect.right; x++) {
              const color = (y % 2 === 0)
                ? ((x + y) % 2 === 0 ? "Yellow" : "Red")
                : ((x + y) % 2 === 0 ? "Red" : "Yellow");
              
              ctx.fillStyle = color;
              ctx.fillRect(x, y, 1, 1);
            }
          }
        } 
        else if (obj.FillColor === "LemonChiffon") {
          // LemonChiffon 패턴 그리기
          for (let y = rect.top; y < rect.bottom; y++) {
            for (let x = rect.left; x < rect.right; x++) {
              let color = "Yellow";
              const nColor = (y % 4);
              
              if (nColor === 0) {
                color = ((x + y) % 2 === 0) ? "Yellow" : "White";
              } else if (nColor === 2) {
                color = ((x + y) % 2 === 0) ? "White" : "Yellow";
              }
              
              ctx.fillStyle = color;
              ctx.fillRect(x, y, 1, 1);
            }
          }
        } 
        else {
          // 일반 채우기
          ctx.fillStyle = obj.FillColor;
          if (obj.BorderShape === 1) { // RoundRect
            const radius = obj.ArcsWidth || 5;
            ctx.beginPath();
            ctx.roundRect(rect.left, rect.top, obj.Width, obj.Height, radius);
            ctx.fill();
          } else {
            ctx.fillRect(rect.left, rect.top, obj.Width, obj.Height);
          }
        }
      }

      // 테두리 그리기
      if (obj.ShowBoarder) {
        ctx.strokeStyle = obj.PenColor;
        ctx.lineWidth = obj.PenWidth;
        
        if (obj.BorderShape === 1) { // RoundRect
          const radius = obj.ArcsWidth || 5;
          ctx.beginPath();
          ctx.roundRect(rect.left, rect.top, obj.Width, obj.Height, radius);
          ctx.stroke();
        } else {
          ctx.strokeRect(rect.left, rect.top, obj.Width, obj.Height);
        }
      }

    } catch (error) {
      console.error('Error drawing rect:', error);
    }

    ctx.restore();
  };

  const drawCircle = (ctx: CanvasRenderingContext2D, obj: TObject) => {
    ctx.beginPath();
    
    // 회전 적용
    if (obj.Rotation) {
      const centerX = obj.PosX + obj.Width / 2;
      const centerY = obj.PosY + obj.Height / 2;
      ctx.translate(centerX, centerY);
      ctx.rotate((obj.Rotation * Math.PI) / 180);
      ctx.translate(-centerX, -centerY);
    }

    // 선 스타일 설정
    ctx.strokeStyle = obj.PenColor;
    ctx.lineWidth = obj.PenWidth;
    
    const centerX = obj.PosX + obj.Width / 2;
    const centerY = obj.PosY + obj.Height / 2;
    const radiusX = obj.Width / 2;
    const radiusY = obj.Height / 2;
    
    // 타원 그리기
    ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
    
    // 채우기 설정
    if (obj.IsFilled) {
      ctx.fillStyle = obj.FillColor;
      ctx.fill();
    }

    if (obj.ShowBoarder) {
      ctx.stroke();
    }
  };

  const extractFontInfo = (fontStr: string): { size: number; family: string } => {
    // "morris9, 9pt" 형식 처리
    const match = fontStr.match(/([^,]+),\s*(\d+)pt/);
    if (!match) {
      // 폰트 문자열 파싱 실패 시 기본값 반환
      console.warn('Failed to parse font string:', fontStr);
      return { size: 12, family: 'Arial' };
    }
  
    return {
      size: parseInt(match[2], 10), // 숫자 부분 추출
      family: match[1].trim() // 폰트명 부분 추출
    };
  };

  const drawText = (ctx: CanvasRenderingContext2D, obj: TObject) => {
    console.log('Drawing text object:', obj);
    ctx.save();
    
    // 회전 적용
    if (obj.Rotation) {
      const centerX = obj.PosX + obj.Width / 2;
      const centerY = obj.PosY + obj.Height / 2;
      ctx.translate(centerX, centerY);
      ctx.rotate((obj.Rotation * Math.PI) / 180);
      ctx.translate(-centerX, -centerY);
    }
  
    // 폰트 설정
    try {
      const { size, family } = extractFontInfo(obj.Font);
      ctx.font = `${size}px ${family}`;
      console.log('Applied font:', ctx.font, 'from:', obj.Font);
    } catch(e) {
      console.warn('Font parsing error:', e);
      ctx.font = '16px Arial';
    }
  
    // 정렬 설정
    ctx.textAlign = obj.Align === 1 ? 'center' : obj.Align === 2 ? 'right' : 'left';
    ctx.textBaseline = obj.VAlign === 1 ? 'middle' : obj.VAlign === 2 ? 'bottom' : 'top';
    
    // 배경색 처리
    if (obj.IsFilled) {
      ctx.fillStyle = obj.FillColor || '#FFFFFF';
      ctx.fillRect(obj.PosX, obj.PosY, obj.Width, obj.Height);
    }
  
    // 텍스트 그리기
    if (obj.Text && obj.Text.trim() !== '') {
      ctx.fillStyle = obj.PenColor || '#000000';
      
      if (obj.SingleLine) {
        let textX = obj.PosX;
        if (obj.Align === 1) {
          textX = obj.PosX + (obj.Width / 2);
        } else if (obj.Align === 2) {
          textX = obj.PosX + obj.Width;
        }
  
        const textY = obj.PosY + (obj.VAlign === 1 ? obj.Height / 2 : 
                                 obj.VAlign === 2 ? obj.Height : 
                                 obj.LineHeight || obj.Height / 2);
        
        ctx.fillText(obj.Text, textX, textY);
      } else {
        const lines = obj.Text.split(obj.Newline || '\n');
        const lineHeight = obj.LineHeight || parseInt(obj.Font) || obj.Height;
        
        lines.forEach((line, index) => {
          let x = obj.PosX;
          if (obj.Align === 1) {
            x = obj.PosX + (obj.Width / 2);
          } else if (obj.Align === 2) {
            x = obj.PosX + obj.Width;
          }
          
          const y = obj.PosY + (lineHeight * (index + 0.5)); // 세로 중앙 정렬을 위해 0.5 추가
          ctx.fillText(line, x, y);
        });
      }
    }
  
    // 디버깅용 테두리 (필요시 주석 해제)
    // ctx.strokeStyle = '#FF0000';
    // ctx.strokeRect(obj.PosX, obj.PosY, obj.Width, obj.Height);
  
    ctx.restore();
  };

  // 이미지 그리기 함수 수정
  const drawImage = (ctx: CanvasRenderingContext2D, obj: TObject, img: HTMLImageElement) => {
    try {
      ctx.save();
  
      // 회전 처리
      if (obj.Rotation) {
        const centerX = obj.PosX + obj.Width / 2;
        const centerY = obj.PosY + obj.Height / 2;
        ctx.translate(centerX, centerY);
        ctx.rotate((obj.Rotation * Math.PI) / 180);
        ctx.translate(-centerX, -centerY);
      }
  
      // ImageBase64가 없는 경우 빈 사각형만 그리기
      if (!obj.ImageBase64) {
        if (obj.ShowBoarder) {
          ctx.strokeStyle = obj.PenColor;
          ctx.lineWidth = obj.PenWidth;
          ctx.strokeRect(obj.PosX, obj.PosY, obj.Width, obj.Height);
        }
        ctx.restore();
        return;
      }
  
      // 배경색 처리
      if (obj.IsFilled) {
        ctx.fillStyle = obj.FillColor;
        ctx.fillRect(obj.PosX, obj.PosY, obj.Width, obj.Height);
      }
  
      // SizeMode에 따른 이미지 그리기
      switch (obj.SizeMode) {
        case 0: // Normal - 원본 크기
          ctx.drawImage(img, obj.PosX, obj.PosY);
          break;
  
        case 1: // StretchImage - 영역에 맞게 늘이기
          ctx.drawImage(img, obj.PosX, obj.PosY, obj.Width, obj.Height);
          break;
  
        case 2: // Stretch - 비율 유지하며 맞추기
          {const scale = Math.min(obj.Width / img.width, obj.Height / img.height);
          const scaledWidth = img.width * scale;
          const scaledHeight = img.height * scale;
          const x = obj.PosX + (obj.Width - scaledWidth) / 2;
          const y = obj.PosY + (obj.Height - scaledHeight) / 2;
          
          // 이미지 그리기 전 클리핑 영역 설정
          ctx.beginPath();
          ctx.rect(obj.PosX, obj.PosY, obj.Width, obj.Height);
          ctx.clip();
          
          // 이미지 그리기
          ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
          break;
          }
      }
  
      // 테두리 그리기
      if (obj.ShowBoarder) {
        ctx.strokeStyle = obj.PenColor;
        ctx.lineWidth = obj.PenWidth;
        ctx.strokeRect(obj.PosX, obj.PosY, obj.Width, obj.Height);
      }
  
      ctx.restore();
    } catch (error) {
      console.error('Error drawing image:', error);
      console.log('Image object:', obj);
      console.log('Image element:', img);
    }
  };

  // 바코드 그리기 함수 수정
  const drawBarcode = async (ctx: CanvasRenderingContext2D, obj: TObject) => {
    if (!obj.Text) return;

    const tempCanvas = document.createElement('canvas');
    
    try {
      // 바코드 색상을 PenColor로 설정
      JsBarcode(tempCanvas, obj.Text, {
        format: obj.CodeType === 1 ? "CODE128" : "CODE39",
        width: obj.PenWidth || 2,
        height: obj.Height || 100,
        displayValue: obj.ShowBarcodeLabel,
        font: obj.Font || "Arial",
        fontOptions: obj.Rotation ? `rotate(${obj.Rotation})` : '',
        textAlign: obj.Align === 1 ? "center" : obj.Align === 2 ? "right" : "left",
        textPosition: obj.VAlign === 1 ? "top" : "bottom",
        textMargin: obj.Margin || 2,
        fontSize: parseInt(obj.Font?.split('pt')[0] || "12"),
        background: obj.IsFilled ? (obj.FillColor || "#FFFFFF") : "transparent", // 배경색 처리
        lineColor: obj.PenColor || "#000000", // 바코드 색상
        margin: obj.Margin || 10
      });

      // 회전 처리
      if (obj.Rotation) {
        const centerX = obj.PosX + obj.Width / 2;
        const centerY = obj.PosY + obj.Height / 2;
        ctx.translate(centerX, centerY);
        ctx.rotate((obj.Rotation * Math.PI) / 180);
        ctx.translate(-centerX, -centerY);
      }

      // 크기 조절 적용 (SizeMode 활용)
      switch (obj.SizeMode) {
        case 0: // Normal
          ctx.drawImage(tempCanvas, obj.PosX, obj.PosY);
          break;
        case 1: // StretchImage
          ctx.drawImage(tempCanvas, obj.PosX, obj.PosY, obj.Width, obj.Height);
          break;
        case 2: // Stretch
          const scale = Math.min(obj.Width / tempCanvas.width, obj.Height / tempCanvas.height);
          const scaledWidth = tempCanvas.width * scale;
          const scaledHeight = tempCanvas.height * scale;
          const x = obj.PosX + (obj.Width - scaledWidth) / 2;
          const y = obj.PosY + (obj.Height - scaledHeight) / 2;
          ctx.drawImage(tempCanvas, x, y, scaledWidth, scaledHeight);
          break;
      }

      // 테두리 표시
      if (obj.ShowBoarder) {
        ctx.strokeStyle = obj.PenColor;
        ctx.lineWidth = obj.PenWidth;
        if (obj.BorderShape === 1) { // RoundRect
          const radius = obj.ArcsWidth || 5;
          ctx.beginPath();
          ctx.roundRect(obj.PosX, obj.PosY, obj.Width, obj.Height, radius);
          ctx.stroke();
        } else {
          ctx.strokeRect(obj.PosX, obj.PosY, obj.Width, obj.Height);
        }
      }

    } catch (error) {
      console.error('Barcode generation error:', error);
    }
  };

  // 색상 이름을 hex로 변환하는 함수 추가
  const colorNameToHex = (color: string): string => {
    // CSS 색상 이름을 hex로 변환하는 임시 캔버스 생성
    const ctx = document.createElement('canvas').getContext('2d');
    if (!ctx) return '#000000';
    
    ctx.fillStyle = color;
    return ctx.fillStyle;
  };

  // QR코드 그리기 함수 수정
  const drawQRCode = async (ctx: CanvasRenderingContext2D, obj: TObject) => {
    if (!obj.Text) return;

    try {
      // 색상 변환
      const penColorHex = colorNameToHex(obj.PenColor);
      const fillColorHex = obj.IsFilled ? colorNameToHex(obj.FillColor) : '#FFFFFF';

      // QR 코드 옵션 설정
      const qrOptions = {
        width: obj.Width,
        height: obj.Height,
        margin: obj.Margin || 1,
        color: {
          dark: penColorHex,
          light: fillColorHex
        },
        errorCorrectionLevel: 'H'
      };

      // QR 코드 생성을 위한 임시 캔버스
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = obj.Width;
      tempCanvas.height = obj.Height;
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) return;

      // QR 코드 생성
      const qrDataUrl = await QRCode.toDataURL(obj.Text, qrOptions);
      
      // 이미지 로드 및 그리기
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = qrDataUrl;
      });

      ctx.save();

      // 회전 적용
      if (obj.Rotation) {
        const centerX = obj.PosX + obj.Width / 2;
        const centerY = obj.PosY + obj.Height / 2;
        ctx.translate(centerX, centerY);
        ctx.rotate((obj.Rotation * Math.PI) / 180);
        ctx.translate(-centerX, -centerY);
      }

      // 배경 그리기
      if (obj.IsFilled) {
        ctx.fillStyle = obj.FillColor || '#FFFFFF';
        ctx.fillRect(obj.PosX, obj.PosY, obj.Width, obj.Height);
      }

      // QR 코드 그리기
      ctx.drawImage(img, obj.PosX, obj.PosY, obj.Width, obj.Height);

      // 테두리 그리기
      if (obj.ShowBoarder) {
        ctx.strokeStyle = obj.PenColor || '#000000';
        ctx.lineWidth = obj.PenWidth || 1;
        if (obj.BorderShape === 1) {
          const radius = obj.ArcsWidth || 5;
          ctx.beginPath();
          ctx.roundRect(obj.PosX, obj.PosY, obj.Width, obj.Height, radius);
          ctx.stroke();
        } else {
          ctx.strokeRect(obj.PosX, obj.PosY, obj.Width, obj.Height);
        }
      }

      ctx.restore();
    } catch (error) {
      console.error('QR code generation error:', error, obj);
    }
  };

  const drawSelectionBox = (ctx: CanvasRenderingContext2D, obj: TObject) => {
    // 현재 객체의 ID가 선택된 객체들의 ID 목록에 있는지 확인
    if (selectedObjectIds.includes(getObjectId(obj))) {
      ctx.strokeStyle = '#0066ff';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(
        obj.PosX - 5, 
        obj.PosY - 5, 
        obj.Width + 10, 
        obj.Height + 10
      );
      ctx.setLineDash([]);
    }
  };

  // 렌더링 함수 최적화
  const renderCanvas = useCallback(async (
    ctx: CanvasRenderingContext2D, 
    canvas: HTMLCanvasElement,
    objectsToRender: TObject[]
  ) => {
    const offscreenCanvas = offscreenCanvasRef.current;
    const offscreenCtx = offscreenCanvas?.getContext('2d', { alpha: false });
    
    if (!offscreenCtx || !offscreenCanvas) return;

    // 캔버스 초기화
    offscreenCtx.fillStyle = 'white';
    offscreenCtx.fillRect(0, 0, canvas.width, canvas.height);

    // ZOrder로 정렬된 객체 그리기
    const sortedObjects = [...objectsToRender].sort((a, b) => a.ZOrder - b.ZOrder);
    
    // 모든 객체 렌더링
    for (const obj of sortedObjects) {
      offscreenCtx.save();
      try {
        await drawObject(offscreenCtx, obj);
        if (selectedObjectIds.includes(getObjectId(obj))) {
          drawSelectionBox(offscreenCtx, obj);
        }
      } finally {
        offscreenCtx.restore();
      }
    }

    // 메인 캔버스에 복사
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(offscreenCanvas, 0, 0);
  }, [selectedObjectIds]);

  // 객체 그리기 함수 통합
  const drawObject = async (ctx: CanvasRenderingContext2D, obj: TObject) => {
    switch (obj.Type.toLowerCase()) {
      case 'rect':
        drawRect(ctx, obj);
        break;
      case 'ellipse':
        drawCircle(ctx, obj);
        break;
      case 'text':
        drawText(ctx, obj);
        break;
      case 'image':
        if (obj.ImageBase64) {
          await drawImageWithCache(ctx, obj);
        }
        break;
      case 'barcode':
        await drawBarcode(ctx, obj);
        break;
      case 'qrcode':
        await drawQRCode(ctx, obj);
        break;
    }
  };

  // 이미지 캐싱 처리
  const imageCache = useRef<Map<string, HTMLImageElement>>(new Map());
  
  const drawImageWithCache = async (ctx: CanvasRenderingContext2D, obj: TObject) => {
    const cacheKey = obj.ImageBase64;
    let img = imageCache.current.get(cacheKey);

    if (!img) {
      img = new Image();
      const loadPromise = new Promise<void>((resolve, reject) => {
        img!.onload = () => resolve();
        img!.onerror = reject;
        img!.src = `data:image/png;base64,${obj.ImageBase64}`;
      });
      await loadPromise;
      imageCache.current.set(cacheKey, img);
    }

    drawImage(ctx, obj, img);
  };

  // 렌더링 디바운스 함수
  const scheduleRender = useCallback((ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, objectsToRender: TObject[]) => {
    if (renderingRef.current.isRendering) {
      renderingRef.current.pendingRender = true;
      return;
    }

    const currentTime = performance.now();
    const timeSinceLastFrame = currentTime - renderingRef.current.lastFrameTime;

    if (timeSinceLastFrame < 16) { // 약 60fps
      requestAnimationFrame(() => scheduleRender(ctx, canvas, objectsToRender));
      return;
    }

    renderingRef.current.isRendering = true;
    renderingRef.current.lastFrameTime = currentTime;

    renderCanvas(ctx, canvas, objectsToRender).then(() => {
      renderingRef.current.isRendering = false;
      if (renderingRef.current.pendingRender) {
        renderingRef.current.pendingRender = false;
        scheduleRender(ctx, canvas, objectsToRender);
      }
    });
  }, [renderCanvas]);

  // 캔버스 초기화 및 크기 설정 최적화
  useEffect(() => {
    const canvas = canvasRef.current;
    const offscreenCanvas = offscreenCanvasRef.current;
    
    if (!canvas || !offscreenCanvas) return;

    // 캔버스 크기 설정
    const dpr = window.devicePixelRatio || 1;
    const ctx = canvas.getContext('2d', { alpha: false });
    const offscreenCtx = offscreenCanvas.getContext('2d', { alpha: false });
    
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    offscreenCanvas.width = width * dpr;
    offscreenCanvas.height = height * dpr;

    if (ctx) {
      ctx.scale(dpr, dpr);
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, width, height);
      renderCanvas(ctx, canvas, objects);
    }

    if (offscreenCtx) {
      offscreenCtx.scale(dpr, dpr);
      offscreenCtx.fillStyle = 'white';
      offscreenCtx.fillRect(0, 0, width, height);
    }
  }, [width, height]);

  // 캔버스 렌더링 효과 수정
  useEffect(() => {
    const renderAndUpdate = async () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!ctx || !canvas) return;
  
      await renderCanvas(ctx, canvas, objects);
    };
  
    renderAndUpdate();
  }, [objects, width, height, scale, selectedObjectIds, draggingObjects]);

  // 휠 이벤트 리스너
  useEffect(() => {
    const container = document.querySelector('.canvas-container');
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = -e.deltaY;
      const scaleFactor = 1 + delta / 1000;
      
      setScale(prevScale => {
        const newScale = prevScale * scaleFactor;
        return Math.min(Math.max(0.1, newScale), 5);
      });
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  // 컴포넌트 마운트 시 오프스크린 캔버스 생성
  useEffect(() => {
    offscreenCanvasRef.current = document.createElement('canvas');
    offscreenCanvasRef.current.width = width;
    offscreenCanvasRef.current.height = height;
  }, [width, height]);

  // 컴포넌트 cleanup 시 애니메이션 프레임 취소
  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  // 컴포넌트 마운트 시 리스너 설정
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const mouseMove = (e: MouseEvent) => handleMouseMove(e as any);
    const mouseUp = () => handleMouseUp();

    // 이벤트 리스너를 document에 추가
    document.addEventListener('mousemove', mouseMove);
    document.addEventListener('mouseup', mouseUp);

    return () => {
      document.removeEventListener('mousemove', mouseMove);
      document.removeEventListener('mouseup', mouseUp);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [handleMouseMove, handleMouseUp]);

  return (
    <div className="flex-1 flex items-center justify-center bg-gray-800">
      <div className="canvas-container">
        <canvas
          ref={canvasRef}
          style={{
            width: `${width}px`,
            height: `${height}px`,
            transform: `scale(${scale})`,
            transformOrigin: 'center',
            imageRendering: 'pixelated',
            WebkitFontSmoothing: 'antialiased',
            cursor: isDragging ? 'grabbing' : 'pointer',
            willChange: 'transform'  // 성능 최적화를 위한 속성 추가
          }}
          className="border border-gray-300 shadow-lg"
        />
      </div>
    </div>
  );
};

export default Canvas;
