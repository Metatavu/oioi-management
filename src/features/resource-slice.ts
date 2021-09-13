import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { ReduxState } from "app/store";
import { Resource } from "generated/client";

/**
 * Resource state
 */
export type ResourceState = {
  resources: Resource[];
  selectedResource?: Resource;
};

/**
 * Initial resource state
 */
const initialState: ResourceState = {
  resources: [],
  selectedResource: undefined
};

/**
 * Resource slice of Redux store
 */
export const resourceSlice = createSlice({
  name: "resource",
  initialState,
  reducers: {
    setResources: (state: ResourceState, { payload }: PayloadAction<Resource[]>) => {
      state.resources = payload;
    },
    addResources: (state: ResourceState, { payload }: PayloadAction<Resource[]>) => {
      state.resources = [ ...state.resources, ...payload ];
    },
    updateResources: (state: ResourceState, { payload }: PayloadAction<Resource[]>) => {
      state.resources = state.resources.map(resource =>
        payload.find(payloadResource => payloadResource.id === resource.id) ?? resource
      );
    },
    deleteResources: (state: ResourceState, { payload }: PayloadAction<Resource[]>) => {
      state.resources = state.resources.filter(resource => payload.every(payloadResource => payloadResource.id !== resource.id));

      if (state.selectedResource && !state.resources.some(resource => resource.id === state.selectedResource?.id)) {
        state.selectedResource = undefined;
      }
    },
    selectResource: (state: ResourceState, { payload }: PayloadAction<Resource | undefined>) => {
      state.selectedResource = payload;
    },
  }
});

/**
 * Resource actions from created resource slice
 */
export const { setResources, addResources, updateResources, deleteResources, selectResource } = resourceSlice.actions;

/**
 * Select resources selector
 *
 * @param state Redux store root state
 * @returns resources from Redux store
 */
export const selectResources = (state: ReduxState) => state.resource.resources;

/**
 * Select selected resource selector
 *
 * @param state Redux store root state
 * @returns selected resource from Redux store
 */
export const selectSelectedResource = (state: ReduxState) => state.resource.selectedResource;

/**
 * Reducer for resource slice
 */
export default resourceSlice.reducer;