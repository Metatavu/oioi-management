import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { ReduxState } from "app/store";
import { Device } from "generated/client";

/**
 * Device state
 */
export type DeviceState = {
  device?: Device;
};

/**
 * Initial device state
 */
const initialState: DeviceState = {
  device: undefined
};

/**
 * Device slice of Redux store
 */
export const deviceSlice = createSlice({
  name: "device",
  initialState,
  reducers: {
    setDevice: (state: DeviceState, { payload }: PayloadAction<Device>) => {
      state.device = payload;
    }
  }
});

/**
 * Device actions from created device slice
 */
export const { setDevice } = deviceSlice.actions;

/**
 * Select device selector
 *
 * @param state Redux store root state
 * @returns device from Redux store
 */
export const selectDevice = (state: ReduxState) => state.device.device;

/**
 * Reducer for device slice
 */
export default deviceSlice.reducer;