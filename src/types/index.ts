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

/**
 * Interface for error context type
 */
export interface ErrorContextType {
  error?: string;
  setError: (message: string, error?: any) => void;
}

/**
 * Pre-signed POST data response from S3
 */
export type PreSignedPostDataResponse =
  { error: false; basePath: string; data: PreSignedPostData; } |
  { error: true; message: string; };

/**
 * Pre-signed POST data for uploading images to S3
 */
export interface PreSignedPostData {
  url: string;
  fields: Record<string, string>;
}

/**
 * Interface for upload data
 */
export interface UploadData {
  xhrRequest: XMLHttpRequest;
  uploadUrl: string;
  key: string;
  formData: FormData;
  cdnBasePath: string;
}