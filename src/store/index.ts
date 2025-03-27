import { configureStore } from '@reduxjs/toolkit';
import tagObjectsReducer from './tagObjectsSlice';

export const store = configureStore({
  reducer: {
    tagObjects: tagObjectsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
