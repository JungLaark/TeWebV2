import { configureStore } from '@reduxjs/toolkit';
import templateReducer from './templateSlice';
import tagObjectsReducer from './tagObjectsSlice';

export const store = configureStore({
  reducer: {
    template: templateReducer,
    tagObjects: tagObjectsReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
