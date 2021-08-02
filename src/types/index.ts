import { KeycloakInstance } from "keycloak-js";
import { Customer, Device, Application } from "../generated/client/src";

export type AuthState = KeycloakInstance | null;

export type CustomerState = Customer;

export type DeviceState = Device;

export type ApplicationsState = Application[];

export type DialogType = "edit" | "show" | "new";

/**
 * Configuration
 */
export interface Configuration {
  auth: {
    url: string;
    realm: string;
    clientId: string;
  };
  api: {
    baseUrl: string;
  };
  files: {
    uploadPath: string;
  };
}