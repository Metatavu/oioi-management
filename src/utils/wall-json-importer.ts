import Api from "api";
import { KeyValueProperty, Resource } from "generated/client";
import { ImportedResource, WallJSON } from "types";

/**
 * Initialization arguments
 */
interface InitArgs {
  accessToken: string;
  customerId: string;
  deviceId: string;
  applicationId: string;
  rootResourceId: string;
}

/**
 * Wall JSON importer
 */
export default class WallJSONImporter {
  private accessToken: string;
  private customerId: string;
  private deviceId: string;
  private applicationId: string;
  private rootResourceId: string;

  /**
   * Constructor
   *
   * @param args arguments to initialize the importer
   */
  constructor ({ accessToken, customerId,  deviceId, applicationId, rootResourceId }: InitArgs) {
    this.accessToken = accessToken;
    this.customerId = customerId;
    this.deviceId = deviceId;
    this.applicationId = applicationId;
    this.rootResourceId = rootResourceId;
  }

  /**
   * Import resource structure from JSON format
   *
   * - if includeResources is set to true, returns all created resources
   * - if includeResources if omitted/set to false, returns just created content version
   *
   * @param json JSON structure
   * @param includeResources whether to return all created resources or just created content version
   */
  async import(json: WallJSON): Promise<Resource>;
  async import(json: WallJSON, includeResources: true): Promise<Resource[]>;
  async import(json: WallJSON, includeResources?: boolean): Promise<Resource | Resource[]> {
    if (!json.root) {
      return Promise.reject("Incorrect JSON structure");
    }

    try {
      const contentVersion = await this.createResource(json.root, this.rootResourceId, 1);

      const children = await Promise.all(
        json.root.children.map((child, index) =>
          this.createResourcesFromJson(child, contentVersion.id!, index)
        )
      );

      if (includeResources) {
        return [ contentVersion, ...children.flat() ];
      }

      return contentVersion;
    } catch (error) {
      return Promise.reject(error);
    }
  }

  /**
   * Get flat list of resources from given structure
   *
   * @param importedResource imported resource
   * @param parentId parent ID
   * @param orderNumber order number of resource
   */
  private createResourcesFromJson = async (
    importedResource: ImportedResource,
    parentId: string,
    orderNumber: number = 1
  ): Promise<Resource[]> => {
    const createdResources: Resource[] = [];

    try {
      const createdResource = await this.createResource(importedResource, parentId, orderNumber);

      if (importedResource.children.length) {
        const childResources = await Promise.all(
          importedResource.children.map((child, index) =>
            this.createResourcesFromJson(child, createdResource.id!, index)
          )
        );

        createdResources.push(...childResources.flat());
      }

      return createdResources;
    } catch (error) {
      return Promise.reject(error);
    }
  }

  /**
   * Creates resource from imported resource
   *
   * @param importedResource imported resource
   * @param parentId parent resource ID
   * @param orderNumber resource order number
   */
  private createResource = async (
    importedResource: ImportedResource,
    parentId: string,
    orderNumber: number
  ) => {
    try {
      return await Api.getResourcesApi(this.accessToken).createResource({
        customerId: this.customerId,
        deviceId: this.deviceId,
        applicationId: this.applicationId,
        resource: this.translateToResource(importedResource, parentId, orderNumber)
      });
    } catch (error) {
      return Promise.reject(error);
    }
  }

  /**
   * Translates imported resource to resource
   *
   * @param importedResource imported resource
   * @param parentId parent resource ID
   * @param orderNumber resource order number
   */
  private translateToResource = (
    importedResource: ImportedResource,
    parentId: string,
    orderNumber: number
  ): Resource => ({
    ...importedResource,
    parentId: parentId,
    orderNumber: orderNumber,
    data: importedResource.data ?? undefined,
    properties: this.translateToKeyValuePropertyList(importedResource.properties),
    styles: this.translateToKeyValuePropertyList(importedResource.styles),
    modifiedAt: undefined
  });

  /**
   * Translates given object of key-value pairs to list of key-value properties
   *
   * @param source source object with key-value pairs
   * @returns list of key-value properties
   */
  private translateToKeyValuePropertyList = (source: { [key: string]: string }): KeyValueProperty[] => {
    return Object.entries(source).map(([ key, value ]) => ({ key, value }));
  }
}