import { KeycloakInstance } from 'keycloak-js';
import { ActionCreator } from 'redux';
import * as actionTypes from '../constants/actionTypes';

/**
 * Login action
 */
export interface LoginAction {
  type:  actionTypes.LOGIN;
  keycloak: KeycloakInstance;
}

/**
 * Logout action
 */
export interface LogoutAction {
  type: actionTypes.LOGOUT;
}

/**
 * Login action creator
 *
 * @param keycloak Keycloak instance
 */
export const login: ActionCreator<LoginAction> = (keycloak: KeycloakInstance) => ({
  type: actionTypes.LOGIN,
  keycloak: keycloak
});

/**
 * Logout action creator
 */
export const logout: ActionCreator<LogoutAction> = () => ({
  type: actionTypes.LOGOUT
});

export type AuthAction = LoginAction | LogoutAction;