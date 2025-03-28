import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TemplateState, CSVColumnMatch, CanvasObjectProperties } from '../types';

const initialState: TemplateState = {
  Matches: {
    Basic: []
  },
  Templates: {
    Objects: []
  }
};

const templateSlice = createSlice({
  name: 'template',
  initialState,
  reducers: {
    setBasicMatches(state, action: PayloadAction<CSVColumnMatch[]>) {
      state.Matches.Basic = action.payload;
    },
    updateColumnMatch(state, action: PayloadAction<{ index: number; match: Partial<CSVColumnMatch> }>) {
      if (state.Matches.Basic[action.payload.index]) {
        state.Matches.Basic[action.payload.index] = {
          ...state.Matches.Basic[action.payload.index],
          ...action.payload.match
        };
      }
    },
    addTemplateObjects(state, action: PayloadAction<{ tagName: string; objects: CanvasObjectProperties[] }>) {
      // 디버깅용 로그 추가
      console.log('Adding objects to template:', action.payload);
      
      const index = state.Templates.Objects.findIndex(t => t.tagName === action.payload.tagName);
      if (index === -1) {
        state.Templates.Objects.push(action.payload);
      } else {
        state.Templates.Objects[index].objects = action.payload.objects;
      }
    }
  }
});

export const { setBasicMatches, updateColumnMatch, addTemplateObjects } = templateSlice.actions;
export const templateReducer = templateSlice.reducer;
export default templateReducer;
