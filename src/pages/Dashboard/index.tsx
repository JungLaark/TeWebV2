import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import TagList from '../../Objects/TagList';
import Canvas from '../../components/Canvas';
import { PropertyPanel } from '../../components/PropertyPanel';
import { Toolbar } from '../../components/Toolbar';
import { TagItem, CanvasObjectProperties } from '../../types';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [selectedTag, setSelectedTag] = useState<TagItem | null>(null);
  const [selectedObject, setSelectedObject] = useState<CanvasObjectProperties | null>(null);
  const [tagObjects, setTagObjects] = useState<Record<string, CanvasObjectProperties[]>>({});
  const [selectedObjectIds, setSelectedObjectIds] = useState<string[]>([]);  // 추가

  const handleTagSelect = (tag: TagItem) => {
    setSelectedTag(tag);
    setSelectedObject(null);
  };

  const handleObjectSelect = (object: CanvasObjectProperties | null) => {
    setSelectedObject(object);
  };

  const handleUpdateObjects = (newObjects: CanvasObjectProperties[]) => {
    if (!selectedTag) return;
    
    setTagObjects(prev => ({
      ...prev,
      [selectedTag.name]: newObjects
    }));

    if (selectedObject) {
      const updatedSelectedObject = newObjects.find(obj => obj.id === selectedObject.id);
      if (updatedSelectedObject) {
        setSelectedObject(updatedSelectedObject);
      }
    }
  };

  const handleAddShape = (type: 'rect' | 'circle' | 'triangle' | 'ellipse' | 'line' | 'polygon' | 'polyline') => {
    if (!selectedTag) return;

    const newShape = {
      id: `shape_${Date.now()}`,
      type: type,
      properties: {
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        fillColor: '#FFFFFF',
        strokeColor: '#000000',
        strokeWidth: 2,
        rotation: 0,
        ...(type === 'polygon' || type === 'polyline' ? {
          points: [
            { x: 0, y: 0 },
            { x: 100, y: 0 },
            { x: 50, y: 100 }
          ]
        } : {})
      }
    };

    const currentObjects = tagObjects[selectedTag.name] || [];
    handleUpdateObjects([...currentObjects, newShape]);
    setSelectedObject(newShape);
    setSelectedObjectIds([newShape.id]); // 새로운 도형의 ID를 선택된 상태로 설정
  };

  const handleAddText = () => {
    if (!selectedTag) return;

    const newText = {
      id: `text_${Date.now()}`,
      type: 'text',
      properties: {
        x: 0,
        y: 0,
        text: 'Double click to edit',  // 변경된 기본 텍스트
        fontSize: 20,
        fontFamily: 'Arial',
        fillColor: '#FFFFFF',
        strokeColor: '#000000',
        strokeWidth: 1,
        rotation: 0,
        width: 200,  // 텍스트 박스 기본 크기 증가
        height: 30
      }
    };

    const currentObjects = tagObjects[selectedTag.name] || [];
    handleUpdateObjects([...currentObjects, newText]);
    setSelectedObject(newText);
    setSelectedObjectIds([newText.id]);
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    window.location.href = '/login';  // navigate 대신 location.href 사용
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <TagList 
        onSelectTag={handleTagSelect} 
        selectedTag={selectedTag?.name}
      />
      <div className="flex-1 flex flex-col">
        <Toolbar
          onAddShape={handleAddShape}
          onAddText={handleAddText}
          onSave={() => console.log('Save clicked', tagObjects)}
          onExport={() => console.log('Export clicked', tagObjects)}
          onLogout={handleLogout}
        />
        <div className="flex-1 flex">
          <div className="flex-1">
            {selectedTag && (
              <div className="flex items-center justify-center h-full">
                <Canvas
                  width={selectedTag.width}
                  height={selectedTag.height}
                  tagName={selectedTag.name}
                  onObjectSelect={handleObjectSelect}
                  objects={tagObjects[selectedTag.name] || []}
                  onUpdateObjects={handleUpdateObjects}
                  selectedObjectIds={selectedObjectIds}  // Canvas 컴포넌트에 전달
                  setSelectedObjectIds={setSelectedObjectIds}  // Canvas 컴포넌트에 전달
                />
              </div>
            )}
          </div>
          <PropertyPanel
            selectedObject={selectedObject}
            onUpdateObject={(updatedObject) => {
              if (!selectedTag) return;
              const currentObjects = tagObjects[selectedTag.name] || [];
              const updatedObjects = currentObjects.map(obj => 
                obj.id === updatedObject.id ? updatedObject : obj
              );
              handleUpdateObjects(updatedObjects);
              setSelectedObject(updatedObject);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
