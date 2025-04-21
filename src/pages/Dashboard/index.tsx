import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Tag } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { exportTemplate } from '../../utils/templateExport';
import { RootState } from '../../store';
import { addTemplateObjects } from '../../store/features/templateSlice';  // 경로 수정
import { updateTagObjects } from '../../store/features/tagObjectsSlice';  // 경로 수정
import TagList from '../../components/Navbar/TagList'; // 경로 수정
import Canvas from '../../components/Canvas'; // 경로 수정
import { PropertyPanel } from '../../components/PropertyPanel';
import { Toolbar } from '../../components/Toolbar';
import DrawingTools from '../../components/DrawingTools'; // DrawingTools import 추가
import { TLayout, TObject } from '../../types';  // CanvasObjectProperties를 TObject로 변경
import ManageCSVPopup from '../../components/Popup/ManageCSVPopup';
import ManageTagsPopup from '../../components/Popup/ManageTagsPopup';
import { ContextMenuProvider } from '../../components/ContextMenu/ContextMenuProvider';
import { handleTemplateFileLoad } from '../../utils/fileHandlers'; // 경로 수정
import { Navbar } from '../../components/Navbar';
import { isPortrait } from '../../utils/orientationUtils';
import { OrientationType } from '../../types';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [selectedTag, setSelectedTag] = useState<TLayout | null>(null);  // TagItem을 TLayout으로 변경
  const [selectedObject, setSelectedObject] = useState<TObject | null>(null); // CanvasObjectProperties를 TObject로 변경
  const [selectedObjectIds, setSelectedObjectIds] = useState<string[]>([]);  // 추가
  const [isCSVPopupOpen, setIsCSVPopupOpen] = useState(false);
  const [isManageTagsPopupOpen, setIsManageTagsPopupOpen] = useState(false);

  const csvMatches = useSelector((state: RootState) => state.template.Matches);
  const tagObjects = useSelector((state: RootState) => state.tagObjects.tagObjects);
  const templateState = useSelector((state: RootState) => state.template);

  const handleTagSelect = (tag: TLayout) => {
    console.log('handleTagSelect called with:', tag);
    setSelectedTag(tag);
    setSelectedObject(null);
    setSelectedObjectIds([]); // 태그 변경 시 선택 초기화
    // tag.Objects가 존재하고, 1개 이상일 때만 store에 반영
    if (tag.Objects && tag.Objects.length > 0) {
      dispatch(updateTagObjects({
        tagName: tag.Name,
        objects: tag.Objects
      }));
    }
  };

  const handleManageTags = () => {
    setIsManageTagsPopupOpen(true);
  }

  const handleObjectSelect = (object: TObject | null) => { // CanvasObjectProperties를 TObject로 변경
    setSelectedObject(object);
  };

  const handleAddShape = (type: string) => {
    console.log('handleAddShape called with type:', type);
    console.log('selectedTag:', selectedTag);
    
    if (!selectedTag) {
      console.warn('No tag selected, cannot add shape');
      return;
    }

    // ShowBoarder를 true로 설정하여 도형이 잘 보이도록 수정
    // 중앙 위치 계산
    const centerX = (selectedTag.Width - 100) / 2;
    const centerY = (selectedTag.Height - 100) / 2;

    console.log('Selected tag:', selectedTag);
    const currentObjects = tagObjects[selectedTag.Name] || [];
    console.log('Current tag objects:', currentObjects);

    const newObject: TObject = {
      id: `${type}_${Date.now()}`,
      Type: type,
      ZOrder: 0,
      PenWidth: 2, // 선 두께 증가
      PenColor: "Black",
      FillColor: "White",
      IsFilled: false,
      PosX: centerX,
      PosY: centerY,
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
      ShowBoarder: true, // 테두리 표시 활성화
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
    try {
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
      console.log('Shape added successfully:', newObject);
    } catch (error) {
      console.error('Error adding shape:', error);
    }
  };

  const handleAddText = () => {
    console.log('handleAddText called');
    
    if (!selectedTag) {
      console.warn('No tag selected, cannot add text');
      return;
    }

    // 중앙 위치 계산
    const centerX = (selectedTag.Width - 200) / 2;  // 텍스트 기본 너비의 절반을 빼서 중앙 정렬
    const centerY = (selectedTag.Height - 30) / 2;  // 텍스트 기본 높이의 절반을 빼서 중앙 정렬

    const newText: TObject = {
      id: `text_${Date.now()}`,
      Type: 'text',
      ZOrder: 0,
      PenWidth: 1,
      PenColor: "Black",
      FillColor: "White",
      IsFilled: false,
      PosX: centerX,
      PosY: centerY,
      PosX1: 0,
      PosY1: 0,
      Height: 30,
      Width: 200,
      Rotation: 0,
      Font: "Arial, 12pt",
      Text: "Double click to edit",
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

    const currentObjects = tagObjects[selectedTag.Name] || [];
    const updatedObjects = [...currentObjects, newText];
    
    console.log('Adding text object:', newText);
    console.log('Updated objects with text:', updatedObjects);
    
    try {
      // 태그별 객체 상태 업데이트
      dispatch(updateTagObjects({ 
        tagName: selectedTag.Name, 
        objects: updatedObjects 
      }));
      
      // 템플릿 객체 상태 업데이트
      dispatch(addTemplateObjects({ 
        tagName: selectedTag.Name, 
        objects: updatedObjects 
      }));
      
      setSelectedObject(newText);
      setSelectedObjectIds([newText.id]);
      console.log('Text added successfully');
    } catch (error) {
      console.error('Error adding text:', error);
    }
  };

  const handleDeleteObjects = (objectIds: string[]) => {
    console.log('Deleting objects with IDs:', objectIds);
    
    if (!selectedTag) {
      console.warn('No tag selected, cannot delete objects');
      return;
    }

    const currentObjects = tagObjects[selectedTag.Name] || [];
    const updatedObjects = currentObjects.filter(obj => !objectIds.includes(obj.id));
    
    console.log('Updated objects after deletion:', updatedObjects);
    
    try {
      // 태그별 객체 상태 업데이트
      dispatch(updateTagObjects({ 
        tagName: selectedTag.Name, 
        objects: updatedObjects 
      }));
      
      // 템플릿 객체 상태 업데이트
      dispatch(addTemplateObjects({ 
        tagName: selectedTag.Name, 
        objects: updatedObjects 
      }));
      
      // 태그 객체 배열 업데이트 (상태 업데이트 강제를 위해)
      setSelectedTag({
        ...selectedTag,
        Objects: updatedObjects
      });
      
      setSelectedObject(null);
      setSelectedObjectIds([]);
      console.log('Objects deleted successfully');
    } catch (error) {
      console.error('Error deleting objects:', error);
    }
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

  const handleLoadTemplate = async () => {
    const templateData = await handleTemplateFileLoad();
    if (templateData) {
      console.log('Loaded template data:', templateData); // 디버깅용 로그 추가
    }
  };

  return (
    <ContextMenuProvider>
      <div className="flex flex-col h-screen bg-gray-900 text-white">
        {/* Header - 관리 메뉴만 포함 */}
        <header>
          <Toolbar
            onManageCSV={handleManageCSV}
            onManageFonts={() => console.log('Fonts')}
            onManageImageCodes={() => console.log('Images')}
            onManageReservations={() => console.log('Reservations')}
            onLoadTemplate={handleLoadTemplate} // handleLoadTemplate 연결
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
          <div className="w-[260px] flex flex-col border-r border-gray-700">

            <div className="flex-1 overflow-y-auto">
              <Navbar 
                onSelectTag={handleTagSelect} 
                selectedTag={selectedTag?.Name}
                onManageTags={handleManageTags} // 태그 관리 함수 연결
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
                  objects={selectedTag.Objects || tagObjects[selectedTag.Name] || []}
                  onUpdateObjects={(updatedObjects) => {
                    console.log('Updating objects:', updatedObjects);
                    // Objects 업데이트시 Redux store와 selectedTag 모두 업데이트
                    dispatch(updateTagObjects({ 
                      tagName: selectedTag.Name, 
                      objects: updatedObjects 
                    }));
                    setSelectedTag({
                      ...selectedTag,
                      Objects: updatedObjects
                    });
                  }}
                  onObjectSelect={handleObjectSelect}
                  selectedObjectIds={selectedObjectIds}
                  setSelectedObjectIds={setSelectedObjectIds}
                  onAddShape={handleAddShape}
                  onAddText={handleAddText}
                  onDeleteObjects={handleDeleteObjects}
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
        {/* 태그 관리 팝업 */}
        <ManageTagsPopup
          isOpen={isManageTagsPopupOpen}
          onClose={() => setIsManageTagsPopupOpen(false)}
          orientation={
            selectedTag
              ? (isPortrait(selectedTag.Model) ? 'vertical' : 'horizontal')
              : 'horizontal'
          }
        />
      </div>
    </ContextMenuProvider>
  );
};

export default Dashboard;
