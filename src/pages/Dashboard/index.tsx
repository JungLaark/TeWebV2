import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Tag } from 'lucide-react';
import TagList from '../../Objects/TagList';
import Canvas from '../../components/Canvas';
import { PropertyPanel } from '../../components/PropertyPanel';
import { Toolbar } from '../../components/Toolbar';
import DrawingTools from '../../components/DrawingTools'; // DrawingTools import 추가
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

  const handleAddShape = (type: string) => {
    if (!selectedTag) return;

    const centerX = selectedTag.width / 2 - 50;
    const centerY = selectedTag.height / 2 - 50;

    const newShape = {
      id: `shape_${Date.now()}`,
      type,
      properties: {
        x: centerX,
        y: centerY,
        width: 100,
        height: 100,
        fillColor: '#FFFFFF',
        strokeColor: '#000000',
        strokeWidth: 2,
        rotation: 0,
        ...(type === 'polygon' || type === 'polyline' ? {
          points: [
            { x: centerX, y: centerY },
            { x: centerX + 100, y: centerY },
            { x: centerX + 50, y: centerY + 100 }
          ]
        } : {})
      }
    };

    const currentObjects = tagObjects[selectedTag.name] || [];
    handleUpdateObjects([...currentObjects, newShape]);
    setSelectedObject(newShape);
    setSelectedObjectIds([newShape.id]);
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
      <div className="w-[200px] h-screen flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Tag size={20} />
            Tag List
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          <TagList 
            onSelectTag={handleTagSelect} 
            selectedTag={selectedTag?.name}
          />
        </div>
      </div>
      <div className="flex-1 flex flex-col">
        <Toolbar
          onAddShape={handleAddShape}
          onAddText={handleAddText}
          onSave={() => console.log('Save clicked', tagObjects)}
          onExport={() => console.log('Export clicked', tagObjects)}
          onLogout={handleLogout}
        />
        <div className="flex-1 flex">
          <div className="flex-1"> {/* relative 제거 */}
            {selectedTag ? (
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
                  onAddShape={handleAddShape}
                  onAddText={handleAddText}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Select a tag to start editing
              </div>
            )}
          </div>
          <PropertyPanel
            selectedObject={selectedObject}
            selectedTagName={selectedTag?.name} // selectedTagName 전달
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
