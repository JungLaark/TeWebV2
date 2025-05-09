import { TLayout, ModelType, OrientationType, DirectionType } from '../../types';
import { TemplateType, getDefaultTValue } from '../../types/TemplateEnum';
import React from 'react';
import { createRoot } from 'react-dom/client';
import ContextMenuPopup from '../../components/Popup/ContextMenuPopup/ContextMenuPopup';
import { uniqueCode } from '../commonUtils';

interface AddPageParams {
  tagName: string;
  model: ModelType;
  orientation: OrientationType;
  width: number;
  height: number;
  onComplete: (newLayout: TLayout) => void;
  tagGuid?: string;  // GUID 파라미터 추가
}

export const handleAddPage1 = async ({
  tagName,
  model,
  orientation,
  width,
  height,
  onComplete,
  tagGuid,
  parentHasChildren = false
}: AddPageParams & { parentHasChildren?: boolean }) => {
  // 1. 기본 이름 생성 (모델명_방향_)
  let baseName = `${tagName}_${orientation === 0 ? 'Landscape' : 'Portrait'}_`;
  const newName = await openNamePopup(baseName + 'Page1');
  if (!newName) return;

  // 2. TLayout 생성 (부모 템플릿은 항상 TValue: '0')
  const newLayout: TLayout = {
    Guid: tagGuid || uniqueCode(),
    Name: newName,
    Model: model,
    Orientation: orientation,
    Width: width,
    Height: height,
    TWidth: width,
    THeight: height,
    Direction: 0,
    Column: 1,
    Row: 1,
    BGColor: 'White',
    Upsidedown: false,
    TType: 'Normal',
    TValue: '0', // 부모 템플릿은 항상 '0'
    Default: !parentHasChildren,
    Bookmark: !parentHasChildren,
    DisplayName: !parentHasChildren ? 'Default' : '',
    Objects: [],
    PValue: '',
    ModelName: tagName
  };

console.log('[handleAddPage1] newLayout:', newLayout);
  // 3. 콜백으로 전달
  onComplete(newLayout);
};

export const handleAddDivisions = async ({
  tagName,
  model,
  orientation,
  width,
  height,
  onComplete,
  tagGuid,
  divisionsType
}: AddPageParams & { divisionsType: 2 | 3 | 4 }) => {
  const templateTypes = {
    2: TemplateType.MultiFacing,
    3: TemplateType.TripleFacing,
    4: TemplateType.QuadFacing
  };

  const type = templateTypes[divisionsType];
  const newName = await openNamePopup(`${tagName}_${divisionsType}Divisions`);
  if (!newName) return;

  const newLayout: TLayout = {
    Guid: tagGuid || uniqueCode(),
    Name: newName,
    Model: model,
    DisplayName: newName,
    Bookmark: false,
    Width: width,
    Height: height,
    Orientation: orientation,
    Direction: DirectionType.Default,
    Upsidedown: false,
    Column: 1,
    Row: 1,
    BGColor: 'White',
    TWidth: width,
    THeight: height,
    Default: false,
    TType: TemplateType.Normal,
    TValue: getDefaultTValue(type),
    PValue: getDefaultTValue(type),
    Objects: [],
    ParentTag: tagName,
  };

  console.log('[Divisions New Layout]:', newLayout); // 디버깅을 위한 로그 추가

  onComplete(newLayout);
};

export const handleAddPop = async ({
  parentGuid,
  onComplete
}: {
  parentGuid: string;
  onComplete: (newLayout: TLayout) => void;
}) => {
  const newName = await openNamePopup('POP');
  if (!newName) return;
  const newLayout: TLayout = {
    Guid: uniqueCode(),
    Name: newName,
    ParentGuid: parentGuid,
    TType: 'POP',
    TValue: '1',
    DisplayName: newName,
    Bookmark: false,
    Model: 0,
    Width: 0,
    Height: 0,
    Orientation: 0,
    Direction: 0,
    Upsidedown: false,
    Column: 1,
    Row: 1,
    BGColor: 'White',
    TWidth: 0,
    THeight: 0,
    Default: false,
    PValue: '',
    Objects: []
  };
  onComplete(newLayout);
};

const openNamePopup = (defaultName: string): Promise<string | null> => {
  return new Promise((resolve) => {
    const popupRoot = document.createElement('div');
    document.body.appendChild(popupRoot);

    const cleanup = () => {
      try {
        root.unmount();
        document.body.removeChild(popupRoot);
      } catch {}
    };

    const handleOk = (name: string) => {
      resolve(name);
      cleanup();
    };
    const handleCancel = () => {
      resolve(null);
      cleanup();
    };

    const root = createRoot(popupRoot);
    root.render(
      <ContextMenuPopup
        isOpen={true}
        onClose={handleCancel}
        onConfirm={handleOk}
        defaultValue={defaultName}
        title="Input page1 name"
      />
    );
  });
};