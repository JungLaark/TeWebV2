import { configureStore } from '@reduxjs/toolkit';
import templateReducer from './features/templateSlice';
import tagObjectsReducer from './features/tagObjectsSlice';

export const store = configureStore({
  reducer: {
    template: templateReducer,
    tagObjects: tagObjectsReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
