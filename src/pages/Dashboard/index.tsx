import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { setTagObjects, addObjectToTag } from '../../store/tagObjectsSlice';
import { LogOut, Tag } from 'lucide-react';
import TagList from '../../Objects/TagList';
import Canvas from '../../components/Canvas';
import { PropertyPanel } from '../../components/PropertyPanel';
import { Toolbar } from '../../components/Toolbar';
import DrawingTools from '../../components/DrawingTools';
import { TagItem, CanvasObjectProperties } from '../../types';
import ManageCSVPopup from '../../components/Popup/ManageCSVPopup';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const tagObjects = useSelector((state: RootState) => state.tagObjects.tagObjects);

  const [selectedTag, setSelectedTag] = useState<TagItem | null>(null);
  const [selectedObject, setSelectedObject] = useState<CanvasObjectProperties | null>(null);
  const [selectedObjectIds, setSelectedObjectIds] = useState<string[]>([]);
  const [isCSVPopupOpen, setIsCSVPopupOpen] = useState(false);

  const handleTagSelect = (tag: TagItem) => {
    setSelectedTag(tag);
    setSelectedObject(null);
  };

  const handleObjectSelect = (object: CanvasObjectProperties | null) => {
    setSelectedObject(object);
  };

  const handleUpdateObjects = (newObjects: CanvasObjectProperties[]) => {
    if (!selectedTag) return;
    dispatch(setTagObjects({ tagName: selectedTag.name, objects: newObjects }));

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

    dispatch(addObjectToTag({ tagName: selectedTag.name, object: newShape }));
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
        text: 'Double click to edit',
        fontSize: 20,
        fontFamily: 'Arial',
        fillColor: '#FFFFFF',
        strokeColor: '#000000',
        strokeWidth: 1,
        rotation: 0,
        width: 200,
        height: 30,
      },
    };

    dispatch(addObjectToTag({ tagName: selectedTag.name, object: newText }));
    setSelectedObject(newText);
    setSelectedObjectIds([newText.id]);
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    window.location.href = '/login';
  };

  const handleManageCSV = () => {
    setIsCSVPopupOpen(true);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {/* Header - 관리 메뉴만 포함 */}
      <header>
        <Toolbar
          onManageCSV={handleManageCSV}
          onManageFonts={() => console.log('Fonts')}
          onManageImageCodes={() => console.log('Images')}
          onManageReservations={() => console.log('Reservations')}
          onLoadTemplate={() => console.log('Load')}
          onMergeTemplates={() => console.log('Merge')}
          onSaveTemplate={() => console.log('Save')}
          onExportBitmap={() => console.log('Export')}
          onSendToCoreESN={() => console.log('Send')}
          onLoadFromCoreESN={() => console.log('Load')}
          onLogout={handleLogout}
        />
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - TagList */}
        <div className="w-[250px] flex flex-col border-r border-gray-700">
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

        {/* Center - Canvas */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 flex items-center justify-center">
            {selectedTag ? (
              <Canvas
                width={selectedTag.width}
                height={selectedTag.height}
                tagName={selectedTag.name}
                onObjectSelect={handleObjectSelect}
                objects={tagObjects[selectedTag.name] || []}
                onUpdateObjects={handleUpdateObjects}
                selectedObjectIds={selectedObjectIds}
                setSelectedObjectIds={setSelectedObjectIds}
                onAddShape={handleAddShape}
                onAddText={handleAddText}
              />
            ) : (
              <div className="text-gray-500">
                Select a tag to start editing
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - PropertyPanel */}
        <div className="w-[250px] border-l border-gray-700">
          <PropertyPanel
            selectedObject={selectedObject}
            selectedTagName={selectedTag?.name}
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

      {/* Footer */}
      <footer className="border-t border-gray-700">
        <DrawingTools 
          onAddShape={handleAddShape}
          onAddText={handleAddText}
        />
      </footer>

      {/* Add CSV Popup */}
      <ManageCSVPopup 
        isOpen={isCSVPopupOpen}
        onClose={() => setIsCSVPopupOpen(false)}
      />
    </div>
  );
};

export default Dashboard;
