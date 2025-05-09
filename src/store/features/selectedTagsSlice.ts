import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import tagList, { Tag } from '../../types/tagList';

interface SelectedTagsState {
  availableTags: Tag[];
  selectedTags: Tag[];
}

// localStorage에서 selectedTags 불러오기
function loadSelectedTagsFromStorage(): Tag[] | null {
  try {
    const data = localStorage.getItem('selectedTags');
    if (!data) return null;
    return JSON.parse(data);
  } catch {
    return null;
  }
}

// localStorage에 selectedTags 저장
function saveSelectedTagsToStorage(tags: Tag[]) {
  try {
    localStorage.setItem('selectedTags', JSON.stringify(tags));
  } catch {}
}

const initialState: SelectedTagsState = {
  availableTags: tagList,
  selectedTags: loadSelectedTagsFromStorage() || tagList, // localStorage 우선
};

const selectedTagsSlice = createSlice({
  name: 'selectedTags',
  initialState,
  reducers: {
    setSelectedTags: (state, action: PayloadAction<Tag[]>) => {
      state.selectedTags = action.payload;
      saveSelectedTagsToStorage(state.selectedTags);
    },
    addSelectedTag: (state, action: PayloadAction<Tag>) => {
      const exists = state.selectedTags.find(tag => tag.width === action.payload.width && tag.height === action.payload.height && tag.guid === action.payload.guid);
      if (!exists) {
        state.selectedTags.push(action.payload);
        saveSelectedTagsToStorage(state.selectedTags);
      }
    },
    removeSelectedTag: (state, action: PayloadAction<string>) => {
      state.selectedTags = state.selectedTags.filter(tag => tag.name !== action.payload);
      saveSelectedTagsToStorage(state.selectedTags);
    },
    //Manage Tags 토글을 위한 액션 수정: guid 비교 제거, name/width/height만 비교
    toggleSelectedTag: (state, action: PayloadAction<{ name: string; width: number; height: number; guid?: string }>) => {
      const { name, width, height } = action.payload;
      const tagIndex = state.selectedTags.findIndex(
        tag => tag.width === width && tag.height === height && tag.name === name
      );
      const tagToToggle = state.availableTags.find(
        tag => tag.width === width && tag.height === height && tag.name === name
      );

      if (tagIndex >= 0) {
        state.selectedTags = state.selectedTags.filter(
          tag => !(tag.width === width && tag.height === height && tag.name === name)
        );
      } else if (tagToToggle) {
        state.selectedTags.push(tagToToggle);
      }
      saveSelectedTagsToStorage(state.selectedTags);
    },
    resetSelectedTags: (state) => {
      state.selectedTags = state.availableTags;
      saveSelectedTagsToStorage(state.selectedTags);
    },
    setAvailableTags: (state, action: PayloadAction<Tag[]>) => {
      state.availableTags = action.payload;
    },
  }
});

export const {
  setSelectedTags,
  addSelectedTag,
  removeSelectedTag,
  toggleSelectedTag,
  resetSelectedTags,
  setAvailableTags // 추가
} = selectedTagsSlice.actions;

export default selectedTagsSlice.reducer;