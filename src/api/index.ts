import { Configuration, CustomersApi, DevicesApi, ApplicationsApi, ResourcesApi } from "../generated/client";
import { Config } from "../app/config";

/**
 * Class for loading API with predefined configuration
 */
export default class Api {

  /**
   * Gets initialized customers api
   *
   * @param token access token
   */
  public static getCustomersApi(token: string) {
    return new CustomersApi(Api.getConfiguration(token));
  }

  /**
   * Gets initialized applications api
   *
   * @param token access token
   */
  public static getApplicationsApi(token: string) {
    return new ApplicationsApi(Api.getConfiguration(token));
  }

  /**
   * Gets initialized devices api
   *
   * @param token access token
   */
  public static getDevicesApi(token: string) {
    return new DevicesApi(Api.getConfiguration(token));
  }

  /**
   * Gets initialized devices api
   *
   * @param token access token
   */
  public static getResourcesApi(token: string) {
    return new ResourcesApi(Api.getConfiguration(token));
  }

  /**
   * Gets api configuration
   *
   * @param token access token
   */
  private static getConfiguration(token: string) {
    return new Configuration({
      basePath: Config.get().api.baseUrl,
      accessToken: token,
      middleware: [{ post: async ({ response }) => {
        if (!response.ok) {
          if (response.status === 401) {
            window.location.reload();
          }
        }

        return response;
      }}]
    });
  }

}