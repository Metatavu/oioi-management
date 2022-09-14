import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { ReduxState } from "app/store";
import { ContentVersion } from "types";

/**
 * Content version state
 */
export type ContentVersionState = {
  contentVersions: ContentVersion[];
  selectedContentVersionId?: string;
};

/**
 * Initial content version state
 */
const initialState: ContentVersionState = {
  contentVersions: [],
  selectedContentVersionId: undefined
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
    addContentVersion: (state: ContentVersionState, { payload }: PayloadAction<ContentVersion>) => {
      state.contentVersions.push(payload);
    },
    updateContentVersion: (state: ContentVersionState, { payload }: PayloadAction<ContentVersion>) => {
      state.contentVersions = state.contentVersions.map(contentVersion =>
        contentVersion.id === payload.id ? payload : contentVersion
      );
    },
    deleteContentVersion: (state: ContentVersionState, { payload }: PayloadAction<ContentVersion>) => {
      state.contentVersions = state.contentVersions.filter(contentVersion => contentVersion.id !== payload.id);

      if (state.selectedContentVersionId === payload.id) {
        state.selectedContentVersionId = state.contentVersions.length ?
          state.contentVersions[0]?.id :
          undefined;
      }
    },
    selectContentVersionId: (state: ContentVersionState, { payload }: PayloadAction<string | undefined>) => {
      state.selectedContentVersionId = payload;
    }
  }
});

/**
 * Content version actions from created content version slice
 */
export const {
  setContentVersions,
  addContentVersion,
  updateContentVersion,
  deleteContentVersion,
  selectContentVersionId
} = contentVersionSlice.actions;

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
export const selectSelectedContentVersionId = (state: ReduxState) => state.contentVersion.selectedContentVersionId;

/**
 * Reducer for content version slice
 */
export default contentVersionSlice.reducer;