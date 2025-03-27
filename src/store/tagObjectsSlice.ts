import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CanvasObjectProperties } from '../types';

interface TagObjectsState {
  tagObjects: Record<string, CanvasObjectProperties[]>;
}

const initialState: TagObjectsState = {
  tagObjects: {},
};
// tagObjectsSlice는 Redux 스토어의 일부로서 tagObjects 상태를 관리하는 슬라이스입니다
const tagObjectsSlice = createSlice({
  name: 'tagObjects',
  initialState,
  reducers: {
    setTagObjects(state, action: PayloadAction<{ tagName: string; objects: CanvasObjectProperties[] }>) {
      state.tagObjects[action.payload.tagName] = action.payload.objects;
    },
    addObjectToTag(state, action: PayloadAction<{ tagName: string; object: CanvasObjectProperties }>) {
      if (!state.tagObjects[action.payload.tagName]) {
        state.tagObjects[action.payload.tagName] = [];
      }
      state.tagObjects[action.payload.tagName].push(action.payload.object);
    },
    updateObjectInTag(state, action: PayloadAction<{ tagName: string; object: CanvasObjectProperties }>) {
      const objects = state.tagObjects[action.payload.tagName];
      if (objects) {
        const index = objects.findIndex(obj => obj.id === action.payload.object.id);
        if (index !== -1) {
          objects[index] = action.payload.object;
        }
      }
    },
  },
});

export const { setTagObjects, addObjectToTag, updateObjectInTag } = tagObjectsSlice.actions;
export default tagObjectsSlice.reducer;
