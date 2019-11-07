import { AuthAction } from '../actions/auth';
import { LOGIN, LOGOUT } from '../constants/actionTypes';
import { AuthState } from '../types';

const initialState: AuthState = null

export function authReducer(state: AuthState = initialState, action: AuthAction) {
  switch (action.type) {
    case LOGIN:
      return action.keycloak;
    case LOGOUT:
      return null;
  }

  return state;
}