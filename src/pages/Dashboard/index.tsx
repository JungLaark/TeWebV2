import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Tag } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { exportTemplate } from '../../utils/templateExport';
import { RootState } from '../../store';
import { addTemplateObjects } from '../../store/templateSlice';
import { updateTagObjects } from '../../store/tagObjectsSlice';  // 추가
import TagList from '../../components/Navbar/TagList'; // 경로 수정
import Canvas from '../../components/Canvas';
import { PropertyPanel } from '../../components/PropertyPanel';
import { Toolbar } from '../../components/Toolbar';
import DrawingTools from '../../components/DrawingTools'; // DrawingTools import 추가
import { TLayout, TObject } from '../../types';  // CanvasObjectProperties를 TObject로 변경
import ManageCSVPopup from '../../components/Popup/ManageCSVPopup';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [selectedTag, setSelectedTag] = useState<TLayout | null>(null);  // TagItem을 TLayout으로 변경
  const [selectedObject, setSelectedObject] = useState<TObject | null>(null); // CanvasObjectProperties를 TObject로 변경
  const [selectedObjectIds, setSelectedObjectIds] = useState<string[]>([]);  // 추가
  const [isCSVPopupOpen, setIsCSVPopupOpen] = useState(false);

  const csvMatches = useSelector((state: RootState) => state.template.Matches);
  const tagObjects = useSelector((state: RootState) => state.tagObjects.tagObjects);
  const templateState = useSelector((state: RootState) => state.template);

  const handleTagSelect = (tag: TLayout) => {  // TagItem을 TLayout으로 변경
    console.log('Selected tag:', tag); // 디버깅용
    setSelectedTag(tag);
    setSelectedObject(null);
  };

  const handleObjectSelect = (object: TObject | null) => { // CanvasObjectProperties를 TObject로 변경
    setSelectedObject(object);
  };

  const handleAddShape = (type: string) => {
    if (!selectedTag) return;

    console.log('Selected tag:', selectedTag);
    const currentObjects = tagObjects[selectedTag.Name] || [];
    console.log('Current tag objects:', currentObjects);

    const newObject: TObject = { // CanvasObjectProperties를 TObject로 변경
      id: `${type}_${Date.now()}`,
      Type: type,
      ZOrder: 0,
      PenWidth: 1,
      PenColor: "Black",
      FillColor: "White",
      IsFilled: false,
      PosX: selectedTag.Width / 2 - 50,  // 중앙 위치
      PosY: selectedTag.Height / 2 - 50,  // 중앙 위치
      PosX1: 0,
      PosY1: 0,
      Height: 100,
      Width: 100,
      Rotation: 0,
      Font: "Arial, 12pt",
      Text: null,
      Align: 0,
      VAlign: 1,
      DataName: null,
      ShowBarcodeLabel: false,
      ShowBoarder: false,
      ArcsWidth: 20,
      Margin: 0,
      Arrow: 0,
      ArrowSize: 5,
      BorderShape: 0,
      Newline: "",
      Subject: "",
      CodeType: 0,
      Reference: 0,
      SizeMode: 2,
      ProductID: 0,
      MultiFacingMode: false,
      SingleLine: true,
      LineHeight: 16,
      ImageBase64: null
    };

    const updatedObjects = [...currentObjects, newObject];
    console.log('Updated objects:', updatedObjects);
    
    // 두 액션을 디스패치
    //태그별 객체 상태 업데이트
    dispatch(updateTagObjects({ 
      tagName: selectedTag.Name, 
      objects: updatedObjects 
    }));
    
    //템플릿 객체 상태 업데이트
    dispatch(addTemplateObjects({ 
      tagName: selectedTag.Name, 
      objects: updatedObjects 
    }));
    
    setSelectedObject(newObject);
    setSelectedObjectIds([newObject.id]);
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
    const updatedObjects = [...currentObjects, newText];
    dispatch(addTemplateObjects({ tagName: selectedTag.name, objects: updatedObjects }));
    setSelectedObject(newText);
    setSelectedObjectIds([newText.id]);
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    window.location.href = '/login';  // navigate 대신 location.href 사용
  };

  const handleManageCSV = () => {
    setIsCSVPopupOpen(true);
  };

  const handleSaveTemplate = () => {
    // tagObjects를 Templates.Objects 형식으로 변환하여 저장
    Object.entries(tagObjects).forEach(([tagName, objects]) => {
      dispatch(addTemplateObjects({ tagName, objects }));
    });

    const exportData = {
      ...templateState,
      Templates: {
        Objects: Object.entries(tagObjects).map(([tagName, objects]) => ({
          tagName,
          objects
        }))
      }
    };

    exportTemplate(exportData);
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
          onSaveTemplate={handleSaveTemplate}
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
                width={selectedTag.Width}
                height={selectedTag.Height}
                tagName={selectedTag.Name}
                objects={tagObjects[selectedTag.Name] || []}
                onUpdateObjects={(updatedObjects) => {
                  // 두 액션 모두 디스패치
                  dispatch(updateTagObjects({ 
                    tagName: selectedTag.Name, 
                    objects: updatedObjects 
                  }));
                  dispatch(addTemplateObjects({ 
                    tagName: selectedTag.Name, 
                    objects: updatedObjects 
                  }));
                }}
                onObjectSelect={handleObjectSelect}
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
            selectedTagName={selectedTag?.Name}  // Name으로 수정
            onUpdateObject={(updatedObject) => {
              if (!selectedTag) return;
              const currentObjects = tagObjects[selectedTag.Name] || [];  // Name으로 수정
              const updatedObjects = currentObjects.map(obj => 
                obj.id === updatedObject.id ? updatedObject : obj
              );

              // 두 액션 모두 디스패치
              dispatch(updateTagObjects({ 
                tagName: selectedTag.Name, 
                objects: updatedObjects 
              }));
              dispatch(addTemplateObjects({ 
                tagName: selectedTag.Name, 
                objects: updatedObjects 
              }));

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
