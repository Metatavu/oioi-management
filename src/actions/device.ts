import * as actionTypes from "../constants/actionTypes";
import { Device } from "../generated/client/src";
import { ActionCreator } from "redux";

/**
 * Set device action
 */
export interface SetDeviceAction {
  type: actionTypes.SET_DEVICE;
  device: Device;
}

/**
 * Set device action creator
 *
 * @param device device
 */
export const setDevice: ActionCreator<SetDeviceAction> = (device: Device) => ({
  type: actionTypes.SET_DEVICE,
  device: device
});

export type DeviceAction = SetDeviceAction;