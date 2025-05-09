import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TLayout, ModelType, OrientationType, DirectionType, TemplateEnum } from '../../types/TLayout';
import { CSVColumnMatch } from '../../types/CSVColumnMatch';
import tagList from '../../types/tagList';

// Tag[]를 TLayout[]으로 변환
const tLayoutList: TLayout[] = tagList.map(tag => ({
  Guid: tag.name,
  Name: tag.name,
  Model: ModelType.M21, // 임의 기본값
  DisplayName: tag.name,
  Bookmark: false,
  Width: tag.width,
  Height: tag.height,
  Orientation: tag.width > tag.height ? OrientationType.Landscape : OrientationType.Portrait,
  Direction: DirectionType.Default,
  Upsidedown: false,
  Column: 1,
  Row: 1,
  BGColor: 'White',
  TWidth: tag.width,
  THeight: tag.height,
  Default: false,
  TType: TemplateEnum.Normal,
  TValue: '',
  PValue: '',
  Objects: [],
}));

interface TemplateState {
  currentTemplate: TLayout | null;
  templates: TLayout[];
  isLoading: boolean;
  error: string | null;
  Matches: {
    Basic: CSVColumnMatch[];
  };
}

const initialState: TemplateState = {
  currentTemplate: null,
  templates: tLayoutList,
  isLoading: false,
  error: null,
  Matches: {
    Basic: []
  }
};

export const templateSlice = createSlice({
  name: 'template',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setTemplate: (state, action: PayloadAction<TLayout>) => {
      state.currentTemplate = action.payload;
      state.error = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.currentTemplate = null;
    },
    clearTemplate: (state) => {
      state.currentTemplate = null;
      state.error = null;
    },
    setBasicMatches: (state, action: PayloadAction<CSVColumnMatch[]>) => {
      state.Matches.Basic = action.payload;
    },
    updateColumnMatch: (
      state,
      action: PayloadAction<{ 
        index: number; 
        match: Partial<CSVColumnMatch> 
      }>
    ) => {
      const { index, match } = action.payload;
      state.Matches.Basic[index] = {
        ...state.Matches.Basic[index],
        ...match
      };
    },
    addTemplateObjects: (
      state,
      action: PayloadAction<{ 
        tagName: string; 
        objects: TObject[] 
      }>
    ) => {
      if (!state.currentTemplate) return;
      
      if (!state.currentTemplate.Objects) {
        state.currentTemplate.Objects = [];
      }
      
      state.currentTemplate.Objects = action.payload.objects;
    },
    setTemplates: (state, action: PayloadAction<TLayout[]>) => {
      state.templates = action.payload;
    },
    addTemplate: (state, action: PayloadAction<TLayout>) => {
      state.templates.push(action.payload);
    }
  }
});

export const { 
  setLoading, 
  setTemplate, 
  setError, 
  clearTemplate,
  setBasicMatches,
  updateColumnMatch,
  addTemplateObjects,
  setTemplates,
  addTemplate 
} = templateSlice.actions;

export default templateSlice.reducer;
