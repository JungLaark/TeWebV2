import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CSVMatches, CSVColumnMatch } from '../types';

interface CSVMatchState {
  matches: CSVMatches;
}

const initialState: CSVMatchState = {
  matches: {}
};

const csvMatchSlice = createSlice({
  name: 'csvMatch',
  initialState,
  reducers: {
    setMatches(state, action: PayloadAction<CSVMatches>) {
      state.matches = action.payload;
    },
    updateBasicMatches(state, action: PayloadAction<{ matches: CSVColumnMatch[] }>) {
      if (!state.matches['Matches']) {
        state.matches['Matches'] = {};
      }
      state.matches['Matches']['Basic'] = action.payload.matches;
    },
    updateColumnMatch(state, action: PayloadAction<{ index: number; match: Partial<CSVColumnMatch> }>) {
      if (state.matches['Matches']?.['Basic']) {
        const matches = state.matches['Matches']['Basic'];
        matches[action.payload.index] = {
          ...matches[action.payload.index],
          ...action.payload.match
        };
      }
    }
  }
});

export const { setMatches, updateBasicMatches, updateColumnMatch } = csvMatchSlice.actions;
export const csvMatchReducer = csvMatchSlice.reducer;
export default csvMatchReducer;
