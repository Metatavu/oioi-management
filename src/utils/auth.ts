import { Config } from "../app/config";
import Keycloak from "keycloak-js";
import { KeycloakInstance } from "keycloak-js";

/**
 * Utility class for authentication
 */
export class AuthUtils {

  /**
   * Initializes keycloak instance
   *
   * @param keycloak keycloak instance
   */
  public static keycloakInit = (keycloak: KeycloakInstance) => {
    return new Promise<boolean>((resolve, reject) =>
      keycloak.init({ onLoad: "login-required", checkLoginIframe: false })
        .success(resolve)
        .error(reject)
    );
  }

  /**
   * Loads user profile from Keycloak
   *
   * @param keycloak keycloak instance
   */
  public static loadUserProfile = (keycloak: KeycloakInstance) => {
    return new Promise((resolve, reject) =>
      keycloak.loadUserProfile()
        .success(resolve)
        .error(reject)
    );
  }

  /**
   * Updates keycloak access token
   *
   * @param keycloak Keycloak instance
   * @returns true if token did not need refreshing or refreshing was successful, otherwise false
   */
  private static updateToken = (keycloak: KeycloakInstance): Promise<boolean> => {
    return new Promise<boolean>((resolve, reject) =>
      keycloak.updateToken(70)
        .success(resolve)
        .error(reject)
    );
  }

  /**
   * Initializes authentication flow
   *
   * @returns promise of initialized auth state
   */
  public static initAuth = async (): Promise<KeycloakInstance> => {
    try {
      const keycloak = Keycloak(Config.get().auth);

      await AuthUtils.keycloakInit(keycloak);

      const { token, tokenParsed } = keycloak;
      if (!tokenParsed || !tokenParsed.sub || !token) {
        return Promise.reject("Login failed");
      }

      await AuthUtils.loadUserProfile(keycloak);
      return keycloak;
    } catch (error) {
      return Promise.reject(error);
    }
  }

  /**
   * Refreshes access token
   *
   * @param keycloak keycloak instance
   * @returns refreshed access token or undefined
   */
  public static refreshAccessToken = async (keycloak: KeycloakInstance): Promise<KeycloakInstance> => {
    try {
      await AuthUtils.updateToken(keycloak);
      return keycloak;
    } catch (error) {
      return Promise.reject(error);
    }
  }

}