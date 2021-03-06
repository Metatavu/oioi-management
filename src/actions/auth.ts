import { KeycloakInstance } from 'keycloak-js';
import * as actionTypes from '../constants/actionTypes';

/**
 * Interface for login action type
 */
export interface LoginAction {
  type:  actionTypes.LOGIN,
  keycloak: KeycloakInstance
}

/**
 * Interface for logout action type
 */
export interface LogoutAction {
  type: actionTypes.LOGOUT
}

export function login(keycloak: KeycloakInstance): LoginAction {
  return {
    type: actionTypes.LOGIN,
    keycloak: keycloak
  }
}

export function logout(): LogoutAction {
  return {
    type: actionTypes.LOGOUT
  }
}

export type AuthAction = LoginAction | LogoutAction;