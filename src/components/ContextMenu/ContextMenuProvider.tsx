import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import ContextMenu from './index';

interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  actions?: {
    tagName: string;
    tagWidth?: number;
    tagHeight?: number;
    tagGuid?: string;
    modelType?: ModelType;
    orientation?: number; // orientation 명시적으로 추가
    onEdit?: () => void;
    onCopy?: () => void;
    onDelete?: () => void;
    onExport?: () => void; 
    onImport?: () => void;
    onAddSubTag?: (parentTagName: string, newLayout: TLayout) => void; // 추가
  };
}

interface ContextMenuContextType {
  showContextMenu: (x: number, y: number, actions: ContextMenuState['actions']) => void;
  hideContextMenu: () => void;
}

const ContextMenuContext = createContext<ContextMenuContextType | null>(null);

export const useContextMenu = () => {
  const context = useContext(ContextMenuContext);
  if (!context) {
    throw new Error('useContextMenu must be used within a ContextMenuProvider');
  }
  return context;
};

export const ContextMenuProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [menuState, setMenuState] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
  });

  const menuRef = useRef<HTMLDivElement | null>(null);

  const showContextMenu = useCallback((x: number, y: number, actions: ContextMenuState['actions']) => {
    setMenuState({
      visible: true,
      x,
      y,
      actions
    });
  }, []);

  const hideContextMenu = useCallback(() => {
    setMenuState(prev => ({ ...prev, visible: false }));
  }, []);

  useEffect(() => {
    if (menuState.visible && menuRef.current) {
      menuRef.current.style.opacity = '1';
      menuRef.current.style.pointerEvents = 'auto';
    } else if (menuRef.current) {
      menuRef.current.style.opacity = '0';
      menuRef.current.style.pointerEvents = 'none';
    }
  }, [menuState.visible]);

  return (
    <ContextMenuContext.Provider value={{ showContextMenu, hideContextMenu }}>
      {children}
      {menuState.visible && (
        <div
          ref={menuRef}
          className={`context-menu-popup${menuState.visible ? ' show' : ''}`}
          style={{
            position: 'fixed',
            top: menuState.y,
            left: menuState.x,
            zIndex: 9999,
            minWidth: 180,
            background: '#23272f',
            borderRadius: 8,
            boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
            opacity: menuState.visible ? 1 : 0,
            pointerEvents: menuState.visible ? 'auto' : 'none',
            transition: 'opacity 0.18s cubic-bezier(0.4,0,0.2,1)',
          }}
        >
          <ContextMenu
            x={menuState.x}
            y={menuState.y}
            onClose={hideContextMenu}
            actions={menuState.actions}
          />
        </div>
      )}
    </ContextMenuContext.Provider>
  );
};
