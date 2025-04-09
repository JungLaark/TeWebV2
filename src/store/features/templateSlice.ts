import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TLayout } from '../../types/TLayout';
import { CSVColumnMatch } from '../../types/CSVColumnMatch';

interface TemplateState {
  currentTemplate: TLayout | null;
  isLoading: boolean;
  error: string | null;
  Matches: {
    Basic: CSVColumnMatch[];
  };
}

const initialState: TemplateState = {
  currentTemplate: null,
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
  addTemplateObjects
} = templateSlice.actions;

export default templateSlice.reducer;
