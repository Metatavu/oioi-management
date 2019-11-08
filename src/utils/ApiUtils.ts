import { Configuration, CustomersApi } from "../generated/client/src";

const API_BASE_PATH = "https://oioi-api.metatavu.io/v1"

/**
 * Utility class for loading api with predefined configuration
 */
export default class ApiUtils {

  /**
   * Gets initialized customers api
   * 
   * @param token access token
   */
  public static getCustomersApi(token: string) {
    return new CustomersApi(ApiUtils.getConfiguration(token));
  }

  /**
   * Gets api configuration
   * 
   * @param token acess token
   */
  private static getConfiguration(token: string) {
    return new Configuration({
      basePath: API_BASE_PATH,
      accessToken: token
    });
  }

}