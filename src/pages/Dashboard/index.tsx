import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Tag } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { exportTemplate } from '../../utils/templateExport';
import { RootState } from '../../store';
import { addTemplateObjects, setTemplates, setLoading, setError } from '../../store/features/templateSlice';  // 경로 수정
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
import { fetchTemplateData } from '../../api/services/template';
import LoadingOverlay from '../../components/Popup/CommonPopup/LoadingOverlay';
import TagPropertyPanel from '../../components/PropertyPanel/TagPropertyPanel';
import TagPropertyModal from '../../components/PropertyPanel/TagPropertyModal';
import { exportTemplateData } from '../../api/services/template';
import { setAvailableTags, setSelectedTags } from '../../store/features/selectedTagsSlice';
import { setBasicMatches } from '../../store/features/templateSlice';
import { ModelTypeDescription } from '../../types/TLayout';
import AlertDialog from '../../components/Popup/CommonPopup/AlertDialog';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [selectedTag, setSelectedTag] = useState<TLayout | null>(null);  // TagItem을 TLayout으로 변경
  const [selectedObject, setSelectedObject] = useState<TObject | null>(null); // CanvasObjectProperties를 TObject로 변경
  const [selectedObjectIds, setSelectedObjectIds] = useState<string[]>([]);  // 추가
  const [isCSVPopupOpen, setIsCSVPopupOpen] = useState(false);
  const [isManageTagsPopupOpen, setIsManageTagsPopupOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  // draggingObjects 타입 확장: width, height 포함
  const [draggingObjects, setDraggingObjects] = useState<{[key: string]: {x: number, y: number, width?: number, height?: number}}>({});
  const [isTagPropertyModalOpen, setIsTagPropertyModalOpen] = useState(false);
  const currentObjectsRef = useRef<TObject[]>([]);
  const [currentObjects, setCurrentObjects] = useState<TObject[]>([]);

  const csvMatches = useSelector((state: RootState) => state.template.Matches);
  const tagObjects = useSelector((state: RootState) => state.tagObjects.tagObjects);
  const templateState = useSelector((state: RootState) => state.template);
  const isLoading = useSelector((state: RootState) => state.template.isLoading);

  const [alertMessage, setAlertMessage] = useState('');
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        dispatch(setLoading(true));
        const res = await fetchTemplateData();
        console.log('[서버에서 받아온 res]:', res);
        // 응답 구조에 맞게 데이터 추출
        const templates = res?.data?.[0]?.Templates || [];
        const matches = res?.data?.[0]?.Matches?.Basic || [];
        console.log('[서버에서 받아온 templates]:', templates);

        dispatch(setTemplates(templates));
        dispatch(setBasicMatches(matches));

        // tagObjectsSlice도 동기화
        templates.forEach(t => {
          dispatch(updateTagObjects({
            tagName: `${t.Guid}__${t.Name}`,
            objects: t.Objects || []
          }));
        });

        if (templates.length > 0) {
          setSelectedTag(templates[0]);
          setCurrentObjects(templates[0].Objects || []);
          setSelectedObject(null);
          setSelectedObjectIds([]);
        } else {
          setSelectedTag(null);
          setCurrentObjects([]);
          setSelectedObject(null);
          setSelectedObjectIds([]);
        }

        console.log('currentObjects:', currentObjects);
        console.log('selectedTag:', selectedTag);
        console.log('tagObjects:', tagObjects);

        setAlertMessage('Core/ESN에서 템플릿을 불러왔습니다.');
        setIsAlertOpen(true);
        
      } catch (error) {
        setAlertMessage('Core/ESN에서 템플릿 불러오기에 실패했습니다.');
        setIsAlertOpen(true);
      }finally{
        dispatch(setLoading(false));
      }
    };
    
    loadTemplates();
  }, [dispatch]);

  useEffect(() => {
    (window as any).openTagPropertyModal = handleOpenTagPropertyModal;
    return () => {
      (window as any).openTagPropertyModal = undefined;
    };
  }, []);

  useEffect(() => {
    if (isLoading) {
      document.body.classList.add('loading-overlay-active');
    } else {
      document.body.classList.remove('loading-overlay-active');
    }
    return () => {
      document.body.classList.remove('loading-overlay-active');
    };
  }, [isLoading]);

  useEffect(() => {
    currentObjectsRef.current = currentObjects;
  }, [currentObjects]);

  // selectedTag가 바뀔 때만 currentObjects를 동기화 (tagObjects 의존성 제거)
  useEffect(() => {
    if (selectedTag) {
      const newObjects =
        (selectedTag.Objects && [...selectedTag.Objects]) ||
        [];
      setCurrentObjects(newObjects);
    }
  }, [selectedTag]);

  // 태그의 유니크 키 생성 함수
  const getTagKey = (tag: TLayout) => `${tag.Guid}__${tag.Name}`;

  const handleTagSelect = (tag: TLayout) => {
    if (selectedTag) {
      dispatch(updateTagObjects({
        tagName: getTagKey(selectedTag),
        objects: currentObjectsRef.current // 항상 최신값!
      }));
    }
    setSelectedTag(tag);
    setSelectedObject(null);
    setSelectedObjectIds([]);
    // 항상 새로운 배열로 초기화하여 참조 꼬임 방지
    setCurrentObjects(
      (tagObjects[getTagKey(tag)] && [...tagObjects[getTagKey(tag)]]) ||
      (tag.Objects && [...tag.Objects]) ||
      []
    );

    console.log('handleTagSelect - currentObjects:', 
      (tagObjects[getTagKey(tag)] && [...tagObjects[getTagKey(tag)]]) ||
      (tag.Objects && [...tag.Objects]) ||
      []
    );

  };

  const handleManageTags = () => {
    setIsManageTagsPopupOpen(true);
  }

  const handleObjectSelect = (object: TObject | null) => { // CanvasObjectProperties를 TObject로 변경
    setSelectedObject(object);
  };

  // 객체의 고유 식별자: id가 있으면 id, 없으면 ZOrder(string)
  const getObjectId = (obj: TObject) => (String(obj.ZOrder));

  // 파스칼케이스 변환 함수
  const toPascalCase = (str: string) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

  const handleAddShape = (type: string) => {
    if (!selectedTag) return;
    const newObject: TObject = {
      Type: toPascalCase(type),
      ZOrder: currentObjects.length,
      PenWidth: 2,
      PenColor: "Black",
      FillColor: "White",
      IsFilled: false,
      PosX: (selectedTag.Width - 100) / 2,
      PosY: (selectedTag.Height - 100) / 2,
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
      ShowBoarder: true,
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
    setCurrentObjects(updatedObjects);
    setSelectedTag({
      ...selectedTag!,
      Objects: updatedObjects
    });
    dispatch(updateTagObjects({ tagName: getTagKey(selectedTag!), objects: updatedObjects }));
    dispatch(addTemplateObjects({ tagName: getTagKey(selectedTag!), objects: updatedObjects }));
  };

  const handleAddText = () => {
    if (!selectedTag) return;
    const centerX = (selectedTag.Width - 200) / 2;
    const centerY = (selectedTag.Height - 30) / 2;
    const newText: TObject = {
      Type: "Text",
      ZOrder: currentObjects.length,
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
    const updatedObjects = [...currentObjects, newText];
    setCurrentObjects(updatedObjects);
    setSelectedTag({
      ...selectedTag!,
      Objects: updatedObjects
    });
    dispatch(updateTagObjects({ tagName: getTagKey(selectedTag!), objects: updatedObjects }));
    dispatch(addTemplateObjects({ tagName: getTagKey(selectedTag!), objects: updatedObjects }));
  };

  const handleDeleteObjects = (objectIds: string[]) => {
    if (!selectedTag) return;
    const updatedObjects = currentObjects.filter(obj => !objectIds.includes(String(obj.ZOrder)));
    setCurrentObjects(updatedObjects);
    dispatch(updateTagObjects({ tagName: getTagKey(selectedTag), objects: updatedObjects }));
    setSelectedObject(null);
    setSelectedObjectIds([]);
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    //window.location.href = '/login';  // navigate 대신 location.href 사용
    navigate('/login');  // navigate 사용
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

  // PropertyPanel에 넘길 객체를 드래그 중이면 draggingObjects의 좌표로 가공
  const getPanelObject = () => {
    if (!selectedObject) return null;
    if (isDragging && draggingObjects && selectedObject.id && draggingObjects[selectedObject.id]) {
      return {
        ...selectedObject,
        PosX: draggingObjects[selectedObject.id].x,
        PosY: draggingObjects[selectedObject.id].y
      };
    }
    return selectedObject;
  };

  // 드래그 중 selectedObject의 좌표를 실시간으로 갱신
  useEffect(() => {
    if (
      isDragging &&
      selectedObject &&
      draggingObjects[selectedObject.ZOrder]
    ) {
      setSelectedObject({
        ...selectedObject,
        PosX: draggingObjects[selectedObject.ZOrder].x,
        PosY: draggingObjects[selectedObject.ZOrder].y,
      });
    }
  }, [isDragging, draggingObjects, selectedObject]);

  // 태그 속성 패널에서 값 변경 시 처리
  const handleUpdateTag = (updated: TLayout) => {
    setSelectedTag(updated);
    // 템플릿/스토어에도 반영
    dispatch(setTemplates(
      templateState.templates.map(t => t.Guid === updated.Guid ? updated : t)
    ));
  };

  const handleOpenTagPropertyModal = () => {
    setIsTagPropertyModalOpen(true);
  };
  const handleCloseTagPropertyModal = () => {
    setIsTagPropertyModalOpen(false);
  };

  const handleAddSubTag = (parentTagName: string, newLayout: TLayout) => {
    dispatch(setTemplates([...templateState.templates, newLayout]));
    setSelectedTag(newLayout);
    setSelectedObject(null);
    setSelectedObjectIds([]);
    dispatch(updateTagObjects({ tagName: getTagKey(newLayout), objects: [] }));
  };

  // Toolbar의 "Send to Core/ESN"와 "Load from Core/ESN" 버튼 기능 구현
  // 1. Load: fetchTemplateData 사용
  const handleLoadFromCoreESN = async () => {
    try {
      dispatch(setLoading(true));
      const res = await fetchTemplateData();
      const templates = res?.data?.[0]?.Templates || [];
      const matches = res?.data?.[0]?.Matches?.Basic || [];

      dispatch(setTemplates(templates));
      dispatch(setBasicMatches(matches));

      console.log('[Dashboard] 서버에서 받아온 templates:', templates);

      // tagObjects 동기화 후 selectedTag/currentObjects 세팅
      templates.forEach(t => {
        console.log('[서버에서 받아온 objects]', t.Name, t.Objects); // ← 여기!
        dispatch(updateTagObjects({
          tagName: `${t.Guid}__${t.Name}`,
          objects: t.Objects || []
        }));
      });

      // TagList/selectedTagsSlice 동기화
      const tagArr = templates.map(t => ({
        name: ModelTypeDescription[t.Model], // ModelTypeDescription 값으로 name 세팅
        width: t.Width,
        height: t.Height
      }));
      dispatch(setAvailableTags(tagArr));
      dispatch(setSelectedTags(tagArr));

      // tagObjects 동기화가 완료된 후 selectedTag/currentObjects 세팅을 보장하기 위해 setTimeout 사용
      setTimeout(() => {
        if (templates.length > 0) {
          setSelectedTag(templates[0]);
          setCurrentObjects(templates[0].Objects || []);
          setSelectedObject(null);
          setSelectedObjectIds([]);
        } else {
          setSelectedTag(null);
          setCurrentObjects([]);
          setSelectedObject(null);
          setSelectedObjectIds([]);
        }
      }, 0);

      setAlertMessage('Core/ESN에서 템플릿을 불러왔습니다.');
      setIsAlertOpen(true);
    } catch (error) {
      setAlertMessage('Core/ESN에서 템플릿 불러오기에 실패했습니다.');
      setIsAlertOpen(true);
      console.log('Error loading template from Core/ESN:', error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  // 2. Send: MakeExportJson 구조 참고하여 exportTemplateData로 전송
  const handleSendToCoreESN = async () => {
    try {

      const fixNumber = (v: any) => (typeof v === 'number' && isFinite(v) ? Math.round(Math.max(0, v)) : 0);

      const syncedTemplates = templateState.templates.map(t => {
        const tagKey = `${t.Guid}__${t.Name}`;
        const objects = (tagObjects[tagKey] ?? t.Objects).map(obj => ({
          ...obj,
          PosX: fixNumber(obj.PosX),
          PosY: fixNumber(obj.PosY),
          //PosX1: fixNumber(obj.PosX1),
          //PosY1: fixNumber(obj.PosY1),
          Width: fixNumber(obj.Width),
          Height: fixNumber(obj.Height),
          // 필요하다면 PosX1, PosY1 등도 보정
        }));
        return {
          ...t,
          Objects: objects
        };
      });

      // MakeExportJson 구조 참고: Matches, Templates 포함
      const exportPayload = {
        Matches: {
          Basic: templateState.Matches?.Basic ?? [],
          Special: templateState.Matches?.Special ?? []
        },
        //Templates: templateState.templates
        Templates: syncedTemplates
      };

      console.log('[템플릿 전송 데이터]:',JSON.stringify(exportPayload));

      await exportTemplateData(exportPayload);
      setAlertMessage('템플릿이 Core/ESN으로 전송되었습니다.');
      setIsAlertOpen(true);
    } catch (error) {
      setAlertMessage('템플릿 전송에 실패했습니다.');
      setIsAlertOpen(true);
      console.error('Error sending template to Core/ESN:', error);
    }
  };

  console.log('Canvas에 전달되는 currentObjects:', currentObjects);

  // 드래그 종료(마우스 업) 시 Redux에 동기화
  const handleCanvasMouseUp = (updatedObjects: TObject[]) => {
    if (selectedTag) {
      setCurrentObjects(updatedObjects); // 1. 로컬 상태 먼저 갱신
      setSelectedTag({
        ...selectedTag,
        Objects: updatedObjects
      });
      dispatch(updateTagObjects({ tagName: getTagKey(selectedTag), objects: updatedObjects }));
      dispatch(addTemplateObjects({ tagName: getTagKey(selectedTag), objects: updatedObjects }));
    }
    setIsDragging(false);
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
            onSendToCoreESN={handleSendToCoreESN} // Toolbar에 연결
            onLoadFromCoreESN={handleLoadFromCoreESN} // Toolbar에 연결
            onLogout={handleLogout}
          />
        </header>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - TagList */}
          <div className="w-[340px] flex flex-col border-r border-gray-700">
            <div className="flex-1 overflow-y-auto">
              <Navbar 
                onSelectTag={handleTagSelect} 
                selectedTag={selectedTag?.Name}
                onManageTags={handleManageTags} // 태그 관리 함수 연결
                handleAddSubTag={handleAddSubTag} // 전달 (props로 내려주기)
              />
            </div>
          </div>

          {/* Right - Canvas */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 flex items-center justify-center">
              
              {selectedTag ? (  
                <Canvas
                  width={selectedTag.Width}
                  height={selectedTag.Height}
                  tagName={selectedTag.Name}
                  objects={currentObjects}
                  onUpdateObjects={(updatedObjects) => {
                    setCurrentObjects(updatedObjects);
                    setSelectedTag({
                      ...selectedTag!,
                      Objects: updatedObjects
                    });
                    // Redux 동기화는 드래그 종료 시에만 수행
                  }}
                  onObjectSelect={handleObjectSelect}
                  selectedObjectIds={selectedObjectIds}
                  setSelectedObjectIds={setSelectedObjectIds}
                  onAddShape={handleAddShape}
                  onAddText={handleAddText}
                  onDeleteObjects={handleDeleteObjects}
                  isDragging={isDragging}
                  setIsDragging={setIsDragging}
                  draggingObjects={draggingObjects}
                  setDraggingObjects={setDraggingObjects}
                  onMouseUp={handleCanvasMouseUp}
                />
              ) : (
                <div className="text-gray-500">Select a tag to start editing</div>
              )}
            </div>
          </div>
          <div className="w-[340px] border-l border-gray-700">
            <PropertyPanel
              selectedObject={getPanelObject()}
              selectedTagName={selectedTag?.Name}
              onUpdateObject={(updatedObject) => {
                if (!selectedTag) return;
                const currentObjects = tagObjects[getTagKey(selectedTag)] || [];
                const updatedObjects = currentObjects.map(obj =>
                  getObjectId(obj) === getObjectId(updatedObject) ? updatedObject : obj
                );
                dispatch(updateTagObjects({ 
                  tagName: getTagKey(selectedTag), 
                  objects: updatedObjects 
                }));
                dispatch(addTemplateObjects({ 
                  tagName: getTagKey(selectedTag), 
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
        <LoadingOverlay isOpen={isLoading} />
        {/* TagPropertyModal 팝업 추가 */}
        <TagPropertyModal
          open={isTagPropertyModalOpen}
          selectedTag={selectedTag}
          onUpdateTag={handleUpdateTag}
          onClose={handleCloseTagPropertyModal}
        />
        {/* AlertDialog 팝업 추가 */}
        <AlertDialog
          isOpen={isAlertOpen}
          message={alertMessage}
          onClose={() => setIsAlertOpen(false)}
        />
      </div>
    </ContextMenuProvider>
  );
};

export default Dashboard;
