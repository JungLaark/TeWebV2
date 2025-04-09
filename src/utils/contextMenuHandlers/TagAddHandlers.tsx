import { TLayout, ModelType, OrientationType, DirectionType } from '../../types';
import { TemplateType, getDefaultTValue } from '../../types/TemplateEnum';
import React from 'react';
import ReactDOM from 'react-dom';
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
  tagGuid  // GUID 파라미터 추가
}: AddPageParams) => {
  const newName = await openNamePopup(tagName + "_Page1");
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
    TType: TemplateType.Reserved,
    TValue: '1',
    PValue: '1',
    Objects: [],
    ParentName: tagName // 부모 태그와의 연결을 위한 속성 추가
  };

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
    TType: type,
    TValue: getDefaultTValue(type),
    PValue: getDefaultTValue(type),
    Objects: [],
    ParentTag: tagName,
  };

  onComplete(newLayout);
};

const openNamePopup = (defaultName: string): Promise<string | null> => {
  return new Promise((resolve) => {
    const popupRoot = document.createElement('div');
    document.body.appendChild(popupRoot);

    const cleanup = () => {
      try {
        // 컴포넌트 언마운트
        ReactDOM.unmountComponentAtNode(popupRoot);
        // popupRoot가 실제로 document.body의 자식인지 확인
        if (document.body.contains(popupRoot)) {
          document.body.removeChild(popupRoot);
        }
      } catch (error) {
        console.error('Cleanup error:', error);
      }
    };

    const handleConfirm = (value: string) => {
      cleanup();
      resolve(value);
    };

    const handleClose = () => {
      cleanup();
      resolve(null);
    };

    ReactDOM.render(
      <ContextMenuPopup
        isOpen={true}
        onClose={handleClose}
        onConfirm={handleConfirm}
        defaultValue={defaultName}
        title="Input page1 name"
      />,
      popupRoot
    );
  });
};