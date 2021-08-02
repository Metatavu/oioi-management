import { KeycloakInstance } from 'keycloak-js';
import * as actionTypes from '../constants/actionTypes';

/**
 * Interface for login action type
 */
export interface LoginAction {
  type:  actionTypes.LOGIN;
  keycloak: KeycloakInstance;
}

/**
 * Interface for logout action type
 */
export interface LogoutAction {
  type: actionTypes.LOGOUT;
}

/**
 * Redux login action generator
 *
 * @param keycloak Keycloak instance
 * @returns Redux login action
 */
export const login = (keycloak: KeycloakInstance): LoginAction => ({
  type: actionTypes.LOGIN,
  keycloak: keycloak
});

/**
 * Redux logout action generator
 *
 * @returns logout action
 */
export const logout = (): LogoutAction => ({
  type: actionTypes.LOGOUT
});

/**
 * Union type for all Redux auth actions
 */
export type AuthAction = LoginAction | LogoutAction;
