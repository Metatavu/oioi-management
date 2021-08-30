import { combineReducers } from "redux"
import { authReducer } from "../reducers/auth"
import { customerReducer } from "../reducers/customer"
import { AuthAction } from "../actions/auth";
import { CustomerAction } from "../actions/customer";
import { deviceReducer } from "../reducers/device";
import { applicationsReducer } from "../reducers/applications";
import { DeviceAction } from "../actions/device";
import { ApplicationAction } from "../actions/application";
import { resourcesReducer } from "../reducers/resources";
import { ResourceAction } from "../actions/resources";
import { localeReducer } from "../reducers/locale";
import { LocaleAction } from "../actions/locale";

export const rootReducer = combineReducers({
  auth: authReducer,
  customer: customerReducer,
  device: deviceReducer,
  application: applicationsReducer,
  resource: resourcesReducer,
  locale: localeReducer
});

export type ReduxState = ReturnType<typeof rootReducer>;

export type ReduxActions = AuthAction | CustomerAction | DeviceAction | ApplicationAction | ResourceAction | LocaleAction;
