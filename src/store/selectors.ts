import { createSelector } from '@reduxjs/toolkit';
import { RootState } from './index';

// Base selector
const selectTemplateState = (state: RootState) => state.template;

// Memoized selector for Basic matches
export const selectBasicMatches = createSelector(
  [selectTemplateState],
  (template) => template.Matches.Basic
);

// Memoized selector for Template objects
export const selectTemplateObjects = createSelector(
  [selectTemplateState],
  (template) => template.Templates.Objects
);

// Memoized selector for specific template objects by tag
export const makeSelectTemplateObjectsByTag = (tagName: string) => 
  createSelector(
    [selectTemplateObjects],
    (objects) => objects.find(obj => obj.tagName === tagName)?.objects || []
  );
