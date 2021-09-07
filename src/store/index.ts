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
import { contentVersionReducer } from "../reducers/content-version";
import { ContentVersionAction } from "../actions/content-version";

export const rootReducer = combineReducers({
  auth: authReducer,
  customer: customerReducer,
  device: deviceReducer,
  application: applicationsReducer,
  contentVersion: contentVersionReducer,
  resource: resourcesReducer,
  locale: localeReducer
});

export type ReduxState = ReturnType<typeof rootReducer>;

export type ReduxActions =
  AuthAction |
  CustomerAction |
  DeviceAction |
  ApplicationAction |
  ContentVersionAction |
  ResourceAction |
  LocaleAction;
