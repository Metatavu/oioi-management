import { combineReducers } from "redux";
import { authReducer } from "../reducers/auth";
import { AuthAction } from "../actions/auth";
import { resourcesReducer } from "../reducers/resources";
import { ResourceAction } from "../actions/resources";

export const rootReducer = combineReducers({
  auth: authReducer,
  resource: resourcesReducer
});

export type ReduxState = ReturnType<typeof rootReducer>;

export type ReduxActions = AuthAction | ResourceAction;
