import * as actionTypes from '../constants/actionTypes';
import { Device } from '../generated/client/src';

/**
 * Interface for device action type
 */
export interface SetDeviceAction {
  type: actionTypes.SETDEVICE,
  device: Device,
}

export function setDevice(device: Device): SetDeviceAction {
  return {
    type: actionTypes.SETDEVICE,
    device: device,
  }
}

export type DeviceAction = SetDeviceAction;