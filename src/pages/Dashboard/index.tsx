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
  const [objects, setObjects] = useState<CanvasObjectProperties[]>([]);

  const handleTagSelect = (tag: TagItem) => {
    setSelectedTag(tag);
  };

  const handleObjectSelect = (object: CanvasObjectProperties | null) => {
    setSelectedObject(object);
  };

  const handleUpdateObjects = (newObjects: CanvasObjectProperties[]) => {
    setObjects(newObjects);
    if (selectedObject) {
      const updatedSelectedObject = newObjects.find(obj => obj.id === selectedObject.id);
      if (updatedSelectedObject) {
        setSelectedObject(updatedSelectedObject);
      }
    }
  };

  const handleAddShape = (type: 'rect' | 'circle' | 'triangle' | 'ellipse' | 'line' | 'polygon' | 'polyline') => {
    const baseProperties = {
      x: 100,
      y: 100,
      width: 100,
      height: 100,
      fillColor: '#FFFFFF',
      strokeColor: '#000000',
      strokeWidth: 2,
      rotation: 0
    };

    let properties;
    
    if (type === 'polygon' || type === 'polyline') {
      properties = {
        ...baseProperties,
        points: [
          { x: 100, y: 100 },
          { x: 200, y: 100 },
          { x: 150, y: 200 }
        ]
      };
    } else {
      properties = baseProperties;
    }

    const newShape = {
      id: `shape_${Date.now()}`,
      type: type,
      properties: properties
    };

    setObjects(prevObjects => [...prevObjects, newShape]);
  };

  const handleAddText = () => {
    const newText = {
      id: `text_${Date.now()}`,
      type: 'text',
      properties: {
        x: 100,
        y: 100,
        text: 'New Text',
        fontSize: 20,
        fontFamily: 'Arial',
        color: '#FFFFFF',
      }
    };
    setObjects(prevObjects => [...prevObjects, newText]);
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
          onSave={() => console.log('Save clicked', objects)}
          onExport={() => console.log('Export clicked', objects)}
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
                  objects={objects}
                  onUpdateObjects={handleUpdateObjects}
                />
              </div>
            )}
          </div>
          <PropertyPanel
            selectedObject={selectedObject}
            onUpdateObject={(updatedObject) => {
              setSelectedObject(updatedObject);
              setObjects(objects.map(obj => 
                obj.id === updatedObject.id ? updatedObject : obj
              ));
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
