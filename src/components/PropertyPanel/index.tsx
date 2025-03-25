import React from 'react';
import { Settings2 } from 'lucide-react';
import { CanvasObjectProperties } from '../../types';
import './PropertyPanel.css';

interface PropertyPanelProps {
  selectedObject: CanvasObjectProperties | null;
  onUpdateObject: (object: CanvasObjectProperties) => void;
  selectedTagName?: string; // 새로운 prop 추가
}

export const PropertyPanel: React.FC<PropertyPanelProps> = ({
  selectedObject,
  onUpdateObject,
  selectedTagName // 새로운 prop
}) => {
  // 색상 옵션 결정 함수 수정
  const getColorOptions = () => {
    if (!selectedTagName) {
      return [
        { value: '#000000', label: 'Black' },
        { value: '#FFFFFF', label: 'White' },
      ];
    }

    // 선택된 태그 이름으로 색상 옵션 결정
    const hasRY = selectedTagName.includes('RY');
    const hasR = selectedTagName.includes('R');

    const baseColors = [
      { value: '#000000', label: 'Black' },
      { value: '#FFFFFF', label: 'White' },
    ];

    if (hasRY) {
      return [
        ...baseColors,
        { value: '#FF0000', label: 'Red' },
        { value: '#FFFF00', label: 'Yellow' },
      ];
    } else if (hasR) {
      return [
        ...baseColors,
        { value: '#FF0000', label: 'Red' },
      ];
    }

    return baseColors;
  };

  const handlePropertyChange = (property: string, value: any) => {
    if (!selectedObject) return;

    const updatedObject = {
      ...selectedObject,
      properties: {
        ...selectedObject.properties,
        [property]: value
      }
    };
    onUpdateObject(updatedObject);
  };

  const handlePointChange = (index: number, coord: 'x' | 'y', value: number) => {
    if (!selectedObject?.properties.points) return;

    const newPoints = [...selectedObject.properties.points];
    newPoints[index][coord] = value;

    handlePropertyChange('points', newPoints);
  };

  const renderShapeSpecificProperties = () => {
    if (!selectedObject) return null;

    switch (selectedObject.type) {
      case 'circle':
        return (
          <div>
            <label className="block text-sm font-medium text-white">Radius</label>
            <input
              type="number"
              value={selectedObject.properties.radius}
              onChange={(e) => handlePropertyChange('radius', Number(e.target.value))}
              className="w-full bg-gray-700 text-white px-2 py-1 rounded"
            />
          </div>
        );

      case 'ellipse':
        return (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-400">Radius X</label>
              <input
                type="number"
                value={selectedObject.properties.rx}
                onChange={(e) => handlePropertyChange('rx', Number(e.target.value))}
                className="w-full bg-gray-700 text-white px-2 py-1 rounded"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400">Radius Y</label>
              <input
                type="number"
                value={selectedObject.properties.ry}
                onChange={(e) => handlePropertyChange('ry', Number(e.target.value))}
                className="w-full bg-gray-700 text-white px-2 py-1 rounded"
              />
            </div>
          </div>
        );

      case 'polygon':
      case 'polyline':
        return (
          <div>
            <label className="block text-sm font-medium text-white">Points</label>
            <div className="max-h-40 overflow-y-auto">
              {selectedObject.properties.points.map((point: any, index: number) => (
                <div key={index} className="grid grid-cols-2 gap-2 mt-1">
                  <input
                    type="number"
                    value={point.x}
                    onChange={(e) => handlePointChange(index, 'x', Number(e.target.value))}
                    className="w-full bg-gray-700 text-white px-2 py-1 rounded"
                  />
                  <input
                    type="number"
                    value={point.y}
                    onChange={(e) => handlePointChange(index, 'y', Number(e.target.value))}
                    className="w-full bg-gray-700 text-white px-2 py-1 rounded"
                  />
                </div>
              ))}
            </div>
          </div>
        );
    }
  };

  // 색상 선택 UI 렌더링 함수
  const renderColorSelect = (property: string, label: string) => {
    const colorOptions = getColorOptions();
    return (
      <div>
        <label className="text-xs text-gray-400">{label}</label>
        <select
          value={selectedObject?.properties[property] || '#000000'}
          onChange={(e) => handlePropertyChange(property, e.target.value)}
          className="block w-full bg-gray-700 text-white px-2 py-1 rounded mt-1"
        >
          {colorOptions.map(color => (
            <option key={color.value} value={color.value}>
              {color.label}
            </option>
          ))}
        </select>
      </div>
    );
  };

  // Colors 섹션 수정
  const renderColorsSection = () => (
    <div>
      <label className="block text-sm font-medium text-white">Colors</label>
      <div className="grid grid-cols-2 gap-2 mt-1">
        {renderColorSelect('penColor', 'Pen Color')}
        {renderColorSelect('fillColor', 'Fill Color')}
      </div>
    </div>
  );

  if (!selectedObject) {
    return (
      <div className="w-64 bg-gray-50 p-4 border-l border-gray-200">
        <div className="text-gray-500 text-center">
          Select an object to edit its properties
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 bg-gray-800 p-4 border-l border-gray-700">
      <div className="flex items-center gap-2 mb-4">
        <Settings2 className="w-5 h-5 text-white" />
        <h2 className="text-lg font-semibold text-white">Properties</h2>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-white">Position</label>
          <div className="grid grid-cols-2 gap-2 mt-1">
            <div>
              <label className="text-xs text-gray-400">X</label>
              <input
                type="number"
                value={selectedObject.properties.x}
                onChange={(e) => handlePropertyChange('x', Number(e.target.value))}
                className="w-full bg-gray-700 text-white px-2 py-1 rounded"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400">Y</label>
              <input
                type="number"
                value={selectedObject.properties.y}
                onChange={(e) => handlePropertyChange('y', Number(e.target.value))}
                className="w-full bg-gray-700 text-white px-2 py-1 rounded"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-white">Size</label>
          <div className="grid grid-cols-2 gap-2 mt-1">
            <div>
              <label className="text-xs text-gray-400">Width</label>
              <input
                type="number"
                value={selectedObject.properties.width}
                onChange={(e) => handlePropertyChange('width', Number(e.target.value))}
                className="w-full bg-gray-700 text-white px-2 py-1 rounded"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400">Height</label>
              <input
                type="number"
                value={selectedObject.properties.height}
                onChange={(e) => handlePropertyChange('height', Number(e.target.value))}
                className="w-full bg-gray-700 text-white px-2 py-1 rounded"
              />
            </div>
          </div>
        </div>

        {renderColorsSection()}

        <div>
          <label className="block text-sm font-medium text-white">Rotation</label>
          <input
            type="number"
            value={selectedObject.properties.rotation}
            onChange={(e) =>
              handlePropertyChange('rotation', Number(e.target.value))
            }
            className="block w-full bg-gray-700 text-white px-2 py-1 rounded mt-1"
          />
        </div>

        {selectedObject.type === 'text' && (
          <>
            <div>
              <label className="block text-sm font-medium text-white">Text Content</label>
              <input
                type="text"
                value={selectedObject.properties.text || ''}
                onChange={(e) => handlePropertyChange('text', e.target.value)}
                className="block w-full bg-gray-700 text-white px-2 py-1 rounded mt-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white">Font Size</label>
              <input
                type="number"
                value={selectedObject.properties.fontSize || 20}
                onChange={(e) => handlePropertyChange('fontSize', Number(e.target.value))}
                className="block w-full bg-gray-700 text-white px-2 py-1 rounded mt-1"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white">Font Family</label>
              <select
                value={selectedObject.properties.fontFamily || 'Arial'}
                onChange={(e) => handlePropertyChange('fontFamily', e.target.value)}
                className="block w-full bg-gray-700 text-white px-2 py-1 rounded mt-1"
              >
                <option value="Arial">Arial</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Courier New">Courier New</option>
                <option value="Georgia">Georgia</option>
                <option value="Verdana">Verdana</option>
              </select>
            </div>
          </>
        )}
        {renderShapeSpecificProperties()}
      </div>
    </div>
  );
}