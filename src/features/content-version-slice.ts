import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { ReduxState } from "app/store";
import { ContentVersion } from "types";

/**
 * Content version state
 */
export type ContentVersionState = {
  contentVersions: ContentVersion[];
  selectedContentVersion?: ContentVersion;
};

/**
 * Initial content version state
 */
const initialState: ContentVersionState = {
  contentVersions: [],
  selectedContentVersion: undefined
};

/**
 * Content version slice of Redux store
 */
export const contentVersionSlice = createSlice({
  name: "content-version",
  initialState,
  reducers: {
    setContentVersions: (state: ContentVersionState, { payload }: PayloadAction<ContentVersion[]>) => {
      state.contentVersions = payload;
    },
    selectContentVersion: (state: ContentVersionState, { payload }: PayloadAction<ContentVersion | undefined>) => {
      state.selectedContentVersion = payload;
    },
  }
});

/**
 * Content version actions from created content version slice
 */
export const { setContentVersions, selectContentVersion } = contentVersionSlice.actions;

/**
 * Select content versions selector
 *
 * @param state Redux store root state
 * @returns content versions from Redux store
 */
export const selectContentVersions = (state: ReduxState) => state.contentVersion.contentVersions;

/**
 * Select selected content version selector
 *
 * @param state Redux store root state
 * @returns selected content version from Redux store
 */
export const selectSelectedContentVersion = (state: ReduxState) => state.contentVersion.selectedContentVersion;

/**
 * Reducer for content version slice
 */
export default contentVersionSlice.reducer;