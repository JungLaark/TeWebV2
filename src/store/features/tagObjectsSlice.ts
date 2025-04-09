import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TObject } from '../../types';

interface TagObjectsState {
  tagObjects: {
    [key: string]: TObject[];  // key는 태그 이름, value는 해당 태그의 객체 배열
  };
}

const initialState: TagObjectsState = {
  tagObjects: {}
};

const tagObjectsSlice = createSlice({
  name: 'tagObjects',
  initialState,
  reducers: {
    updateTagObjects: (
      state,
      action: PayloadAction<{ tagName: string; objects: TObject[] }>
    ) => {
      const { tagName, objects } = action.payload;
      state.tagObjects[tagName] = objects;
    },
    removeTagObjects: (state, action: PayloadAction<string>) => {
      delete state.tagObjects[action.payload];
    },
    clearAllTagObjects: (state) => {
      state.tagObjects = {};
    }
  }
});

export const { updateTagObjects, removeTagObjects, clearAllTagObjects } = tagObjectsSlice.actions;
export default tagObjectsSlice.reducer;
