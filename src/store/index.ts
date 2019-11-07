import { combineReducers } from "redux"
import { authReducer } from "../reducers/auth"
import { AuthAction } from "../actions/auth";

export const rootReducer = combineReducers({
  auth: authReducer
});

export type ReduxState = ReturnType<typeof rootReducer>;

export type ReduxActions = AuthAction;