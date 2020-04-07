import { DeviceAction } from "../actions/device";
import { SET_DEVICE } from "../constants/actionTypes";
import { Device } from "../generated/client/src";
import { Reducer } from "redux";

/**
 * Device state
 */
interface DeviceState {
  device?: Device;
}

const initialState: DeviceState = {
  device: undefined
};

/**
 * Redux reducer for device
 *
 * @param state state of the device
 * @param action action of the device
 */
export const deviceReducer: Reducer<DeviceState, DeviceAction> = (state = initialState, action: DeviceAction): DeviceState => {
  switch (action.type) {
    case SET_DEVICE: {
      return {
        ...state,
        device: action.device
      };
    }
    default:
      return state;
  }
};
