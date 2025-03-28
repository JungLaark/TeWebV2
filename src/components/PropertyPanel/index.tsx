import React from 'react';
import { CanvasObjectProperties } from '../../types';

interface PropertyPanelProps {
  selectedObject: CanvasObjectProperties | null;
  selectedTagName: string | undefined;
  onUpdateObject: (updatedObject: CanvasObjectProperties) => void;
}

export const PropertyPanel: React.FC<PropertyPanelProps> = ({
  selectedObject,
  selectedTagName,
  onUpdateObject
}) => {
  // 색상 옵션 결정 함수 수정
  const getColorOptions = () => {
    const baseOptions = [
      { value: '#000000', label: 'Black' },
      { value: '#FFFFFF', label: 'White' }
    ];
    
    if (!selectedTagName) return baseOptions;

    if (selectedTagName.includes('R') && selectedTagName.includes('Y')) {
      // 4Color: 검정, 흰색, 빨강, 노랑
      return [
        baseOptions[0], // Black
        baseOptions[1], // White
        { value: '#FF0000', label: 'Red' },
        { value: '#FFFF00', label: 'Yellow' }
      ];
    } else if (selectedTagName.includes('R')) {
      // 3Color: 검정, 흰색, 빨강
      return [
        baseOptions[0], // Black
        baseOptions[1], // White
        { value: '#FF0000', label: 'Red' }
      ];
    }
    
    return baseOptions; // 2Color: 검정, 흰색
  };

  const handleCoordinateChange = (property: 'PosX' | 'PosY', value: number) => {
    if (!selectedObject) return;

    // 상태 업데이트 즉시 반영
    onUpdateObject({
      ...selectedObject,
      [property]: value
    });
  };

  if (!selectedObject) {
    return (
      <div className="p-4 text-gray-300">
        <h2 className="text-lg font-semibold mb-4">Properties</h2>
        <p>No object selected</p>
      </div>
    );
  }

  // color 선택 UI 수정
  const renderColorSelect = (label: string, value: string | undefined, onChange: (color: string) => void) => {
    const options = getColorOptions();
    const currentValue = value || options[0].value;

    return (
      <div>
        <label className="text-xs block mb-1">{label}:</label>
        <div className="flex items-center gap-2">
          <select
            value={currentValue}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1"
          >
            {options.map((color) => (
              <option key={color.value} value={color.value}>
                {color.label}
              </option>
            ))}
          </select>
          <div 
            className="w-6 h-6 border border-gray-600 rounded"
            style={{ backgroundColor: currentValue }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 text-gray-300">
      <h2 className="text-lg font-semibold mb-4">Properties</h2>
      
      <div className="space-y-4">
        {/* 위치 속성 */}
        <div>
          <label className="block text-sm font-medium mb-1">Position</label>
          <div className="grid grid-cols-2 gap-2">
            {/* X, Y 좌표 입력 필드 */}
            <div>
              <label className="text-xs">X:</label>
              <input
                type="number"
                value={Math.round(selectedObject.PosX)}
                onChange={(e) => handleCoordinateChange('PosX', parseFloat(e.target.value) || 0)}
                onBlur={(e) => handleCoordinateChange('PosX', parseFloat(e.target.value) || 0)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1"
              />
            </div>
            <div>
              <label className="text-xs">Y:</label>
              <input
                type="number"
                value={Math.round(selectedObject.PosY)}
                onChange={(e) => handleCoordinateChange('PosY', parseFloat(e.target.value) || 0)}
                onBlur={(e) => handleCoordinateChange('PosY', parseFloat(e.target.value) || 0)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1"
              />
            </div>
          </div>
        </div>

        {/* 크기 속성 */}
        <div>
          <label className="block text-sm font-medium mb-1">Size</label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs">Width:</label>
              <input
                type="number"
                value={Math.round(selectedObject.Width)}
                onChange={(e) => onUpdateObject({
                  ...selectedObject,
                  Width: Math.max(1, parseFloat(e.target.value) || 0)
                })}
                className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1"
              />
            </div>
            <div>
              <label className="text-xs">Height:</label>
              <input
                type="number"
                value={Math.round(selectedObject.Height)}
                onChange={(e) => onUpdateObject({
                  ...selectedObject,
                  Height: Math.max(1, parseFloat(e.target.value) || 0)
                })}
                className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1"
              />
            </div>
          </div>
        </div>

        {/* 채우기 여부 */}
        <div>
          <label className="block text-sm font-medium mb-1">Fill</label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectedObject.IsFilled}
              onChange={(e) => onUpdateObject({
                ...selectedObject,
                IsFilled: e.target.checked
              })}
              className="form-checkbox bg-gray-700 border-gray-600"
            />
            <span className="text-sm">Fill Shape</span>
          </label>
        </div>

        {/* 색상 속성 */}
        <div>
          <label className="block text-sm font-medium mb-1">Colors</label>
          <div className="space-y-2">
            {selectedObject.IsFilled && (
              renderColorSelect('Fill Color', selectedObject.FillColor, (color) => 
                onUpdateObject({
                  ...selectedObject,
                  FillColor: color
                })
              )
            )}
            {renderColorSelect('Pen Color', selectedObject.PenColor, (color) => 
              onUpdateObject({
                ...selectedObject,
                PenColor: color
              })
            )}
          </div>
        </div>

        {/* 선 두께 */}
        <div>
          <label className="block text-sm font-medium mb-1">Pen Width:</label>
          <input
            type="number"
            value={selectedObject.PenWidth}
            onChange={(e) => onUpdateObject({
              ...selectedObject,
              PenWidth: parseFloat(e.target.value) || 1
            })}
            min="1"
            className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1"
          />
        </div>
      </div>
    </div>
  );
};