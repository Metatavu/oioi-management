import { Configuration, CustomersApi } from "../generated/client/src";

const API_BASE_PATH = "https://oioi-api.metatavu.io/v1"

/**
 * Utility class for loading api with predefined configuration
 */
export default class ApiUtils {

  public static getCustomersApi(token: string) {
    return new CustomersApi(ApiUtils.getConfiguration(token));
  }

  private static getConfiguration(token: string) {
    return new Configuration({
      basePath: API_BASE_PATH,
      accessToken: token
    });
  }

}