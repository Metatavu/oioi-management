import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { ReduxState } from "app/store";
import { Application, Resource } from "generated/client";

/**
 * Application state
 */
export type ApplicationState = {
  application?: Application;
  rootResource?: Resource;
};

/**
 * Initial application state
 */
const initialState: ApplicationState = {
  application: undefined,
  rootResource: undefined
};

/**
 * Application slice of Redux store
 */
export const applicationSlice = createSlice({
  name: "application",
  initialState,
  reducers: {
    setApplication: (state: ApplicationState, { payload }: PayloadAction<Application>) => {
      state.application = payload;
    },
    setRootResource: (state: ApplicationState, { payload }: PayloadAction<Resource>) => {
      state.rootResource = payload;
    }
  }
});

/**
 * Application actions from created application slice
 */
export const { setApplication } = applicationSlice.actions;

/**
 * Select application selector
 *
 * @param state Redux store root state
 * @returns application from Redux store
 */
export const selectApplication = (state: ReduxState) => state.application.application;

/**
 * Select root resource selector
 *
 * @param state Redux store root state
 * @returns root resource from Redux store
 */
export const selectRootResource = (state: ReduxState) => state.application.rootResource;

/**
 * Reducer for application slice
 */
export default applicationSlice.reducer;