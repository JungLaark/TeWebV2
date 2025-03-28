import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CanvasObjectProperties } from '../types';

interface TagObjectsState {
  tagObjects: Record<string, CanvasObjectProperties[]>;
}

const initialState: TagObjectsState = {
  tagObjects: {}
};

// 태그 별 객체 상태를 관리하는 전용 슬라이스 
const tagObjectsSlice = createSlice({
  name: 'tagObjects',
  initialState,
  reducers: {
    //태그별 객체 목록을 업데이트 하는 액션
    updateTagObjects(state, action: PayloadAction<{ tagName: string; objects: CanvasObjectProperties[] }>) {
      const { tagName, objects } = action.payload;
      state.tagObjects[tagName] = objects;
    }
  }
});

export const { updateTagObjects } = tagObjectsSlice.actions;
export default tagObjectsSlice.reducer;
