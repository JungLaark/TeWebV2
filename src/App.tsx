import React, { useState } from 'react';
import TagList from './Objects/TagList';
import Canvas from './components/Canvas';
import { PropertyPanel } from './components/PropertyPanel';
import { Toolbar } from './components/Toolbar';
import { TagItem, CanvasObjectProperties } from './types';

const App: React.FC = () => {
  const [selectedTag, setSelectedTag] = useState<TagItem | null>(null);
  const [selectedObject, setSelectedObject] = useState<CanvasObjectProperties | null>(null);
  const [objects, setObjects] = useState<CanvasObjectProperties[]>([]);

  const handleTagSelect = (tag: TagItem) => {
    setSelectedTag(tag);
  };

  const handleObjectSelect = (object: CanvasObjectProperties | null) => {
    setSelectedObject(object);
  };

  const handleUpdateObject = (updatedObject: CanvasObjectProperties) => {
    setObjects(prev => 
      prev.map(obj => obj.id === updatedObject.id ? updatedObject : obj)
    );
    setSelectedObject(updatedObject);
  };

  const handleAddShape = (type: 'rect' | 'circle' | 'triangle' | 'ellipse' | 'line' | 'polygon' | 'polyline') => {
    const newShape = {
      id: `shape_${Date.now()}`,
      type: type,
      properties: {
        x: 100,
        y: 100,
        width: 100,
        height: 100,
        fillColor: '#FFFFFF',
        strokeColor: '#000000',
        strokeWidth: 2,
        rotation: 0
      }
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
                  onUpdateObjects={setObjects}
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

export default App;
