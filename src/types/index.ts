import { KeyValueProperty, Resource, ResourceType } from "../generated/client";

declare global {
  namespace Keycloak {
    interface KeycloakTokenParsed {
      acr?: string;
      "allowed-origins"?: string[];
      aud?: string;
      auth_time?: number;
      azp?: string;
      email?: string;
      email_verified?: boolean;
      family_name?: string;
      given_name?: string;
      groups?: string[];
      iss?: string;
      jti?: string;
      name?: string;
      preferred_username?: string;
      scope?: string;
      typ?: string;
    }
  }
}

/**
 * Dialog type
 */
export type DialogType = "edit" | "show" | "new";

/**
 * Content version type
 */
export type ContentVersion = Resource;

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
    cdnPath: string;
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
 * Form errors
 */
export type FormErrors<T> = {
  [K in keyof T]?: string;
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
  fileType: string;
}

/**
 * API request metadata
 */
export interface ApiRequestMetadata {
  customerId: string;
  deviceId: string;
  applicationId: string;
}

/**
 * Interface that extends API spec KeyValueProperty.
 * This is needed for material table in order to get typing to work
 */
export interface TablePropertyData extends KeyValueProperty {
  tableData?: any;
}

/**
 * Wall JSON structure
 */
export interface WallJSON {
  root: ImportedResource;
}

/**
 * Resource from imported wall JSON structure
 */
export interface ImportedResource {
  slug: string;
  type: ResourceType;
  name: string;
  data: string | null;
  children: ImportedResource[];
  styles: { [key: string]: string; };
  properties: { [key: string]: string; };
  modifiedAt: string;
};