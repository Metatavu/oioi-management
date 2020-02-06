import { DeviceAction } from '../actions/device';
import { SETDEVICE } from '../constants/actionTypes';
import { DeviceState } from '../types';
import { Device } from '../generated/client/src';

const initialState: DeviceState = {} as Device;

export function deviceReducer(state: DeviceState = initialState, action: DeviceAction) {
  switch (action.type) {
    case SETDEVICE:
      return action.device;
  }
  return state
}