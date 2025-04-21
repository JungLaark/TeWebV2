import { configureStore } from '@reduxjs/toolkit';
import templateReducer from './features/templateSlice';
import tagObjectsReducer from './features/tagObjectsSlice';
import selectedTagsReducer from './features/selectedTagsSlice';

export const store = configureStore({
  reducer: {
    template: templateReducer,
    tagObjects: tagObjectsReducer,
    selectedTags: selectedTagsReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // 직렬화 검사에서 제외할 액션 타입
        ignoredActions: ['template/setTemplates', 'template/addTemplateObjects'],
        // 직렬화 검사에서 제외할 경로
        ignoredPaths: ['template.templates', 'template.currentTemplate.Objects'],
      },
      // 큰 payload 경고 임계값 조정
      immutableCheck: { warnAfter: 128 },
      serializableCheck: { warnAfter: 128 }
    })
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
