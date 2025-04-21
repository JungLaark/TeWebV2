import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import tagList, { Tag } from '../../types/tagList';

interface SelectedTagsState {
  availableTags: Tag[];
  selectedTags: Tag[];
}

const initialState: SelectedTagsState = {
  availableTags: tagList,
  selectedTags: tagList, // 기본적으로 모든 태그가 선택됨
};

const selectedTagsSlice = createSlice({
  name: 'selectedTags',
  initialState,
  reducers: {
    setSelectedTags: (state, action: PayloadAction<Tag[]>) => {
      state.selectedTags = action.payload;
    },
    addSelectedTag: (state, action: PayloadAction<Tag>) => {
      const exists = state.selectedTags.find(tag => tag.name === action.payload.name);
      if (!exists) {
        state.selectedTags.push(action.payload);
      }
    },
    removeSelectedTag: (state, action: PayloadAction<string>) => {
      state.selectedTags = state.selectedTags.filter(tag => tag.name !== action.payload);
    },
    toggleSelectedTag: (state, action: PayloadAction<string>) => {
      const tagIndex = state.selectedTags.findIndex(tag => tag.name === action.payload);
      const tagToToggle = state.availableTags.find(tag => tag.name === action.payload);
      
      if (tagIndex >= 0) {
        state.selectedTags = state.selectedTags.filter(tag => tag.name !== action.payload);
      } else if (tagToToggle) {
        state.selectedTags.push(tagToToggle);
      }
    },
    resetSelectedTags: (state) => {
      state.selectedTags = state.availableTags;
    }
  }
});

export const {
  setSelectedTags,
  addSelectedTag,
  removeSelectedTag,
  toggleSelectedTag,
  resetSelectedTags
} = selectedTagsSlice.actions;

export default selectedTagsSlice.reducer;