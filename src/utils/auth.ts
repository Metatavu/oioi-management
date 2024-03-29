import { Config } from "../app/config";
import Keycloak from "keycloak-js";

/**
 * Utility class for authentication
 */
export class AuthUtils {

  /**
   * Initializes keycloak instance
   *
   * @param keycloak keycloak instance
   */
  public static keycloakInit = (keycloak: Keycloak) => {
    return new Promise<boolean>((resolve, reject) =>
      keycloak.init({ onLoad: "login-required", checkLoginIframe: false })
        .then(resolve)
        .catch(reject)
    );
  }

  /**
   * Loads user profile from Keycloak
   *
   * @param keycloak keycloak instance
   */
  public static loadUserProfile = (keycloak: Keycloak) => {
    return new Promise((resolve, reject) =>
      keycloak.loadUserProfile()
        .then(resolve)
        .catch(reject)
    );
  }

  /**
   * Updates keycloak access token
   *
   * @param keycloak Keycloak instance
   * @returns true if token did not need refreshing or refreshing was successful, otherwise false
   */
  private static updateToken = (keycloak: Keycloak): Promise<boolean> => {
    return new Promise<boolean>((resolve, reject) =>
      keycloak.updateToken(70)
        .then(resolve)
        .catch(reject)
    );
  }

  /**
   * Initializes authentication flow
   *
   * @returns promise of initialized auth state
   */
  public static initAuth = async (): Promise<Keycloak> => {
    try {
      const keycloak = new Keycloak(Config.get().auth);

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
  public static refreshAccessToken = async (keycloak: Keycloak): Promise<Keycloak> => {
    try {
      await AuthUtils.updateToken(keycloak);
      return keycloak;
    } catch (error) {
      return Promise.reject(error);
    }
  }

}