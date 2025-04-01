import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TObject } from '../types';  // CanvasObjectProperties를 TObject로 변경

interface TagObjectsState {
  tagObjects: Record<string, TObject[]>;  // 타입 변경
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
    updateTagObjects(state, action: PayloadAction<{ tagName: string; objects: TObject[] }>) {
      const { tagName, objects } = action.payload;
      state.tagObjects[tagName] = objects;
    }
  }
});

export const { updateTagObjects } = tagObjectsSlice.actions;
export default tagObjectsSlice.reducer;
