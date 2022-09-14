import { cleanEnv, str, url } from "envalid";
import { Configuration } from "../types";

/**
 * Validates that environment variables are in place and have correct form
 */
const env = cleanEnv(process.env, {
  REACT_APP_KEYCLOAK_URL: url(),
  REACT_APP_KEYCLOAK_REALM: str(),
  REACT_APP_KEYCLOAK_CLIENT_ID: str(),
  REACT_APP_API_BASE_URL: url(),
  REACT_APP_FILE_UPLOAD_PATH: url(),
  REACT_APP_CDN_BASE_URL: url(),
  REACT_APP_MQTT_BROKER_URL: url(),
  REACT_APP_MQTT_USERNAME: str(),
  REACT_APP_MQTT_PASSWORD: str()
});

/**
 * Class providing access to application configuration
 */
export class Config {

  /**
   * Get static application configuration
   *
   * @returns promise of static application configuration
   */
  public static get = (): Configuration => ({
    auth: {
      url: env.REACT_APP_KEYCLOAK_URL,
      realm: env.REACT_APP_KEYCLOAK_REALM,
      clientId: env.REACT_APP_KEYCLOAK_CLIENT_ID,
    },
    api: {
      baseUrl: env.REACT_APP_API_BASE_URL
    },
    files: {
      uploadPath: env.REACT_APP_FILE_UPLOAD_PATH,
      cdnPath: env.REACT_APP_CDN_BASE_URL
    },
    mqtt: {
      brokerUrl: env.REACT_APP_MQTT_BROKER_URL,
      username: env.REACT_APP_MQTT_USERNAME,
      password: env.REACT_APP_MQTT_PASSWORD
    }
  });

}
