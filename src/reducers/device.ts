import { DeviceAction } from '../actions/device';
import { SET_DEVICE } from '../constants/actionTypes';
import { DeviceState } from '../types';
import { Device } from '../generated/client/src';

const initialState: DeviceState = {} as Device;

/**
 * Redux reducer for device
 * 
 * @param state state of the device
 * @param action action of the device
 */
export function deviceReducer(state: DeviceState = initialState, action: DeviceAction) {
  switch (action.type) {
    case SET_DEVICE:
      return action.device;
  }
  return state
}