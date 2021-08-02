import { AuthAction } from '../actions/auth';
import { LOGIN, LOGOUT } from '../constants/actionTypes';
import { AuthState } from '../types';

/**
 * Initial auth state
 */
const initialState: AuthState = null;

/**
 * Redux auth reducer
 *
 * @param state auth state
 * @param action auth action
 * @returns updated Redux auth state
 */
export const authReducer = (state: AuthState = initialState, action: AuthAction): AuthState => {
  switch (action.type) {
    case LOGIN:
      return action.keycloak;
    case LOGOUT:
      return null;
    default:
      return state;
  }
}