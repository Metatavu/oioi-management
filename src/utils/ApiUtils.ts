import { 
  Configuration,
  CustomersApi,
  DevicesApi,
  ApplicationsApi,
  ResourcesApi
} from "../generated/client/src";

const API_BASE_PATH = "https://staging-oioi-api.metatavu.io/v1"

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
   * Gets initialized applications api
   * 
   * @param token access token
   */
  public static getApplicationsApi(token: string) {
    return new ApplicationsApi(ApiUtils.getConfiguration(token));
  }

  /**
   * Gets initialized devices api
   * 
   * @param token access token
   */
  public static getDevicesApi(token: string) {
    return new DevicesApi(ApiUtils.getConfiguration(token));
  }

  /**
   * Gets initialized devices api
   * 
   * @param token access token
   */
  public static getResourcesApi(token: string) {
    return new ResourcesApi(ApiUtils.getConfiguration(token));
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