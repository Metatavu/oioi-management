import { Configuration, CustomersApi, DevicesApi, ApplicationsApi, ResourcesApi } from "../generated/client/src";
import { Config } from "../app/config";

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
   * TODO: Remove Noty library
   *
   * @param token access token
   */
  private static getConfiguration(token: string) {
    return new Configuration({
      basePath: Config.get().api.baseUrl,
      accessToken: token,
      middleware: [{ post: async (context) => {
        if (!context.response.ok) {
          if (context.response.status === 401) {
            window.location.reload();
          }
        }

        return context.response;
      }}]
    });
  }

}