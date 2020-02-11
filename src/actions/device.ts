import * as actionTypes from '../constants/actionTypes';
import { Device } from '../generated/client/src';

/**
 * Interface for device action type
 */
export interface SetDeviceAction {
  type: actionTypes.SET_DEVICE,
  device: Device,
}

/**
 * Function for dispatching customers
 * 
 * @param device device being dispatched
 */
export function setDevice(device: Device): SetDeviceAction {
  return {
    type: actionTypes.SET_DEVICE,
    device: device,
  }
}

export type DeviceAction = SetDeviceAction;