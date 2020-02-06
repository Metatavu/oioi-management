import { combineReducers } from "redux"
import { authReducer } from "../reducers/auth"
import { customerReducer } from "../reducers/customer"
import { AuthAction } from "../actions/auth";
import { CustomerAction } from "../actions/customer";
import { deviceReducer } from "../reducers/device";
import { applicationsReducer } from "../reducers/applications";
import { DeviceAction } from "../actions/device";
import { ApplicationsAction } from "../actions/applications";

export const rootReducer = combineReducers({
  auth: authReducer,
  customer: customerReducer,
  device: deviceReducer,
  applications: applicationsReducer
});

export type ReduxState = ReturnType<typeof rootReducer>;

export type ReduxActions = AuthAction | CustomerAction | DeviceAction | ApplicationsAction;