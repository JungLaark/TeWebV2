import React from 'react';
import { ModelType, OrientationType } from '../../types';
import { isPortrait } from '../../utils/orientationUtils';
import { handleAddPage1, handleAddDivisions, handleAddPop } from '../../utils/contextMenuHandlers/TagAddHandlers';
import './ContextMenu.css';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  actions?: {
    tagName: string;
    tagWidth?: number;
    tagHeight?: number;
    tagGuid?: string;  // GUID 추가
    modelType?: ModelType;  // ModelType 추가
    orientation?: number; // orientation 추가
    onAddSubTag?: (parentTagName: string, newLayout: any) => void; // 새로운 레이아웃 전달
  };
}

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, onClose, actions }) => {
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Adjust the position of the context menu if it goes out of the viewport
  React.useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      if (rect.bottom > windowHeight) {
        const newY = y - rect.height;
        menuRef.current.style.top = `${newY}px`;
      }
    }
  }, [y]);

  const isPromotion = actions?.TType === 'Promotion' || actions?.data?.TType === 'Promotion';

  const menuItems = isPromotion
    ? [
        {
          label: 'Add a POP',
          onClick: () => {
            if (!actions?.tagGuid) return;
            handleAddPop({
              parentGuid: actions.tagGuid,
              onComplete: (newPopLayout) => {
                if (actions.onAddPop) actions.onAddPop(actions.tagName, newPopLayout);
                onClose();
              }
            });
          }
        }
      ]
    : [
        { 
          label: 'Add a Page 1', 
          onClick: () => {
            if (!actions?.tagName) return;

            handleAddPage1({
              tagName: actions.tagName,
              model: actions.modelType || ModelType.M21,
              //orientation: isPortrait(actions.modelType || ModelType.M21) ? OrientationType.Portrait : OrientationType.Landscape,
              orientation: actions.orientation ?? (isPortrait(actions.modelType || ModelType.M21) ? OrientationType.Portrait : OrientationType.Landscape),
              width: actions.tagWidth || 0,
              height: actions.tagHeight || 0,
              tagGuid: actions.tagGuid,
              onComplete: (newLayout) => {
                if (actions.onAddSubTag) {
                  actions.onAddSubTag(actions.tagName, newLayout);
                }
                onClose();
              }
            });
          }
        },
        { label: 'Add a Page 2', onClick: () => console.log('Add Page 2:', actions?.tagName) },
        { label: 'Add a Page 3', onClick: () => console.log('Add Page 3:', actions?.tagName) },
        { type: 'separator' as const },
        { 
          label: 'Add a 2 Divisions',
          onClick: () => {
            if (!actions?.tagName) return;
            handleAddDivisions({
              tagName: actions.tagName,
              model: actions.modelType || ModelType.M21, // 전달받은 modelType 사용
              orientation: isPortrait(actions.modelType || ModelType.M21) ? OrientationType.Portrait : OrientationType.Landscape,
              width: actions.tagWidth || 0,
              height: actions.tagHeight || 0,
              tagGuid: actions.tagGuid,
              divisionsType: 2,
              onComplete: (newLayout) => {
                console.log('New layout created:', newLayout);
                // TODO: 여기서 부모 컴포넌트에 새로운 레이아웃 전달
                onClose();
              }
            });
          }
        },
        { 
          label: 'Add a 3 Divisions',
          onClick: () => {
            if (!actions?.tagName) return;
            handleAddDivisions({
              tagName: actions.tagName,
              model: actions.modelType || ModelType.M21, // 전달받은 modelType 사용
              orientation: isPortrait(actions.modelType || ModelType.M21) ? OrientationType.Portrait : OrientationType.Landscape,
              width: actions.tagWidth || 0,
              height: actions.tagHeight || 0,
              tagGuid: actions.tagGuid,
              divisionsType: 3,
              onComplete: (newLayout) => {
                console.log('New layout created:', newLayout);
                // TODO: 여기서 부모 컴포넌트에 새로운 레이아웃 전달
                onClose();
              }
            });
          }
        },
        { 
          label: 'Add a 4 Divisions',
          onClick: () => {
            if (!actions?.tagName) return;
            handleAddDivisions({
              tagName: actions.tagName,
              model: actions.modelType || ModelType.M21, // 전달받은 modelType 사용
              orientation: isPortrait(actions.modelType || ModelType.M21) ? OrientationType.Portrait : OrientationType.Landscape,
              width: actions.tagWidth || 0,
              height: actions.tagHeight || 0,
              tagGuid: actions.tagGuid,
              divisionsType: 4,
              onComplete: (newLayout) => {
                console.log('New layout created:', newLayout);
                // TODO: 여기서 부모 컴포넌트에 새로운 레이아웃 전달
                onClose();
              }
            });
          }
        },
        { type: 'separator' as const },
        { label: 'Add a Soldout', onClick: () => console.log('Add Soldout:', actions?.tagName) },
        { label: 'Add a Storage Box', onClick: () => console.log('Add Storage Box:', actions?.tagName) }
      ];

  React.useEffect(() => {
    const handleClick = () => onClose();
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [onClose]);

  return (
    <div 
      ref={menuRef}
      className="context-menu"
      style={{ left: x, top: y }}
      onClick={(e) => e.stopPropagation()}
    >
      {actions && (
        <div className="context-menu-header">
          <span className="tag-name">{actions.tagName}</span>
          {actions.tagWidth && actions.tagHeight && (
            <div className="tag-info">
              <span>{actions.tagWidth}x{actions.tagHeight}</span>
              <span>{isPortrait(actions.modelType || ModelType.M21) ? 'Portrait' : 'Landscape'}</span>
            </div>
          )}
          <button
            className="context-menu-settings-btn"
            onClick={() => {
              if (typeof window !== 'undefined' && (window as any).openTagPropertyModal) {
                (window as any).openTagPropertyModal();
              }
              onClose();
            }}
            title="태그 속성 설정"
            style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#60a5fa', fontSize: 18, cursor: 'pointer' }}
          >
            ⚙️ 설정
          </button>
        </div>
      )}
      {menuItems.map((item, index) => (
        item.type === 'separator' ? (
          <div key={index} className="context-menu-separator" />
        ) : (
          <button
            key={index}
            className="context-menu-item"
            onClick={() => {
              item.onClick();
              onClose();
            }}
          >
            <span>{item.label}</span>
          </button>
        )
      ))}
    </div>
  );
};

export default ContextMenu;
