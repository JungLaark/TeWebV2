import { TLayout, ModelType, OrientationType, DirectionType } from '../../types';
import { TemplateType, getDefaultTValue } from '../../types/TemplateEnum';
import React from 'react';
import { createRoot } from 'react-dom/client';
import ContextMenuPopup from '../../components/Popup/ContextMenuPopup/ContextMenuPopup';
import { uniqueCode } from '../commonUtils';

interface AddPageParams {
  tagGuid: string; // tagName 대신 GUID만 사용
  model: ModelType;
  orientation: OrientationType;
  width: number;
  height: number;
  onComplete: (newLayout: TLayout) => void;
  // tagName은 UI 표시용으로만 필요할 때만 별도 전달
}

export const handleAddPage1 = async ({
  tagGuid,
  model,
  orientation,
  width,
  height,
  onComplete,
  parentHasChildren = false,
  tagName // UI 표시용으로만 필요할 때만 전달
}: AddPageParams & { parentHasChildren?: boolean; tagName?: string }) => {
  // 1. 기본 이름 생성 (모델명_방향_)
  let baseName = `${tagName || tagGuid}_${orientation === 0 ? 'Landscape' : 'Portrait'}_`;
  const newName = await openNamePopup(baseName + 'Page1');
  if (!newName) return;

  // 2. TLayout 생성 (부모 템플릿은 항상 TValue: '0')
  const newLayout: TLayout = {
    Guid: uniqueCode(),
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
    ModelName: tagGuid // tagName 대신 GUID 저장
  };

console.log('[handleAddPage1] newLayout:', newLayout);
  // 3. 콜백으로 전달
  onComplete(newLayout);
};

export const handleAddDivisions = async ({
  tagGuid,
  model,
  orientation,
  width,
  height,
  onComplete,
  divisionsType,
  tagName // UI 표시용으로만 필요할 때만 전달
}: AddPageParams & { divisionsType: 2 | 3 | 4; tagName?: string }) => {
  const templateTypes = {
    2: TemplateType.MultiFacing,
    3: TemplateType.TripleFacing,
    4: TemplateType.QuadFacing
  };

  const type = templateTypes[divisionsType];
  const newName = await openNamePopup(`${tagName || tagGuid}_${divisionsType}Divisions`);
  if (!newName) return;

  const newLayout: TLayout = {
    Guid: uniqueCode(),
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
    ParentTag: tagGuid // tagName 대신 GUID 저장
  };

  console.log('[Divisions New Layout]:', newLayout); // 디버깅을 위한 로그 추가

  onComplete(newLayout);
};

export const handleAddPromotion = async ({
  parentLayout,
  allTemplates, //전체 템플릿 배열
  onComplete,
}:{
  parentLayout: TLayout;
  allTemplates: TLayout[]; // 전체 템플릿 배열
  onComplete: (newLayout: TLayout) => void;
}) => {
  const newName = await openNamePopup(parentLayout.Name + '_Promotion');
  if(!newName) return;

  const promotionChildren = allTemplates.filter(
    t => t.Guid === parentLayout.Guid && t.TType === 'Promotion');
  
  let maxTValue = 0;

  promotionChildren.forEach( t => {
    const value = parseInt(t.TValue);
    if(!isNaN(value) && value > maxTValue)
      maxTValue = value;
  });

  const newTValue = (maxTValue + 1).toString();

  const newLayout: TLayout = {
    ...parentLayout,
    Guid: parentLayout.Guid,
    Name: newName,
    Model: parentLayout.Model,
    Default: false,
    TType: 'Promotion',
    TValue: newTValue,
    Direction: parentLayout.Direction,
    Column: parentLayout.Column,
    Row: parentLayout.Row,
    Objects: []
  }

  onComplete(newLayout);
  console.log('[handleAddPromotion] newLayout:', newLayout); // 디버깅을 위한 로그 추가
}



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