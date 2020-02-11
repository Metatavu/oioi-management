import { combineReducers } from "redux"
import { authReducer } from "../reducers/auth"
import { customerReducer } from "../reducers/customer"
import { AuthAction } from "../actions/auth";
import { CustomerAction } from "../actions/customer";
import { deviceReducer } from "../reducers/device";
import { applicationsReducer } from "../reducers/applications";
import { DeviceAction } from "../actions/device";
import { ApplicationsAction } from "../actions/applications";
import { resourcesReducer } from "../reducers/resources";
import { ResourceAction } from "../actions/resources";

export const rootReducer = combineReducers({
  auth: authReducer,
  customer: customerReducer,
  device: deviceReducer,
  applications: applicationsReducer,
  resource: resourcesReducer
});

export type ReduxState = ReturnType<typeof rootReducer>;

export type ReduxActions = AuthAction | CustomerAction | DeviceAction | ApplicationsAction | ResourceAction;
