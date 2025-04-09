import React, { createContext, useContext, useState, useCallback } from 'react';
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

  return (
    <ContextMenuContext.Provider value={{ showContextMenu, hideContextMenu }}>
      {children}
      {menuState.visible && (
        <ContextMenu
          x={menuState.x}
          y={menuState.y}
          onClose={hideContextMenu}
          actions={menuState.actions}
        />
      )}
    </ContextMenuContext.Provider>
  );
};
