import { 
  Configuration,
  CustomersApi,
  DevicesApi,
  ApplicationsApi,
  ResourcesApi
} from "../generated/client/src";

import Noty from "noty";
import strings from "../localization/strings";

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
      accessToken: token,
      middleware: [{ post: async (context) => {
        if (!context.response.ok) {
          let errorContent = strings.unknownErrorMessage;
          switch (context.response.status) {
            case 400:
              errorContent = strings.badRequestErrorMessage;
            break;
            case 403:
              errorContent = strings.forbiddenErrorMessage;
            break;
            case 404:
              errorContent = strings.notFoundErrorMessage;
            break;
            case 500:
              errorContent = strings.internalErrorMessage;
            break;
            case 502:
            case 503:
            case 504:
              errorContent = strings.unavailableErrorMessage;
            break;
          }
          new Noty({
            type: "error",
            text: errorContent,
            layout: "bottomLeft",
            timeout: 5000
          }).show();
        } else {
          let method = context.init.method || "";
          method = method.toLowerCase();
          let messageContent = undefined;
          switch (method) {
            case "put":
              messageContent = strings.updateSuccessMessage;
            break;
            case "post":
              messageContent = strings.createSuccessMessage;
            break;
            case "delete":
              messageContent = strings.deleteSuccessMessage;
            break;
          }
          if (messageContent) {
            new Noty({
              type: "success",
              text: messageContent,
              layout: "bottomLeft",
              timeout: 3000,
              killer: true
            }).show();
          }
        }
        return context.response;
      }}]
    });
  }

}