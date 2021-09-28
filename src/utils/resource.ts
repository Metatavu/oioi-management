import { IconKeys } from "commons/iconTypeHelper";
import { KeyValueProperty, Resource, ResourceType } from "generated/client";
import { TablePropertyData } from "types";

/**
 * Utility class for resources
 */
export class ResourceUtils {

  /**
   * Returns if resource type is valid parent type
   *
   * @param parentType parent resource type
   * @param childType child resource type
   * @returns is resource type valid parent
   */
  static isValidParentType = (parentType?: ResourceType, childType?: ResourceType) => {
    if (parentType && childType) {
      return !!ALLOWED_CHILD_RESOURCE_TYPES.get(parentType)?.includes(childType);
    } else if (childType) {
      return ALLOWED_ROOT_RESOURCE_TYPES.includes(childType);
    } else {
      return false;
    }
  }

  /**
   * Returns resource type from given file type or undefined if file type is unexpected
   *
   * @param fileType file type
   */
  static getResourceTypeFromFileType = (fileType?: string) => {
    if (fileType?.startsWith("image/")) return ResourceType.IMAGE;
    if (fileType?.startsWith("video/")) return ResourceType.VIDEO;
    return undefined;
  }

  /**
   * Returns list of pre-defined page child resources
   *
   * @param parentId parent ID
   * @returns list of child resources
   */
  static getPagePredefinedResources = (parentId: string): Resource[] => [
    {
      name: "title",
      slug: "title",
      type: ResourceType.TEXT,
      parentId: parentId,
      orderNumber: 1
    }, {
      name: "text_content",
      slug: "text_content",
      type: ResourceType.TEXT,
      parentId: parentId,
      orderNumber: 2
    }, {
      name: "background",
      slug: "background",
      type: ResourceType.IMAGE,
      parentId: parentId,
      orderNumber: 3
    }
  ];

  /**
   * Adds required material table data to given resource
   *
   * @param resource resource to process
   * @returns modified resource
   */
  public static getMaterialTableResourceData = (resource: Resource): Resource => {
    const { properties, styles } = resource;

    const _properties: TablePropertyData[] = (properties || []).map(p => ({ ...p, tableData: {} }));
    const _styles: TablePropertyData[] = ( styles || []).map(s => ({ ...s, tableData: {} }));
    return {
      ...resource,
      properties: _properties,
      styles: _styles
    };
  }

  /**
   * Updates property list of given resource
   *
   * @param resourceData resource data
   * @param key key
   * @param value value
   * @returns updated resource
   */
  public static updatePropertyList = (resourceData: Resource, key: string, value: string) => {
    const tempResourceData = { ...resourceData } as Resource;

    if (!tempResourceData.properties) {
      return;
    }

    const propertyList = tempResourceData.properties.map(p => ({ ...p }));
    const index = propertyList.findIndex(property => property.key === key);

    if (index < 0) {
      propertyList.push({ key: key, value: value })
    } else {
      propertyList[index] = { key: key, value: value };
    }

    tempResourceData.properties = propertyList;
    return tempResourceData;
  }

  /**
   * Updates material table resource property data
   *
   * @param resourceData resource data
   * @param currentData current key value pair data from material table
   * @param updatedData updated key value pair data from material table
   * @returns updated resource
   */
  public static updateMaterialTableProperty = (resourceData: Resource, currentData: KeyValueProperty, updatedData?: KeyValueProperty) => {
    const tempResourceData = { ...resourceData } as Resource;

    if (!tempResourceData.properties) {
      return;
    }

    const propertyList = tempResourceData.properties.map(p => ({ ...p }));
    const index = propertyList.findIndex(property => property.key === currentData.key);

    if (index < 0) {
      propertyList.push({ key: currentData.key, value: currentData.value })
    } else if (updatedData) {
      propertyList[index] = { key: updatedData.key, value: updatedData.value };
    }

    tempResourceData.properties = propertyList;
    return tempResourceData;
  }

  /**
   * Deletes property from resource
   *
   * @param resourceData resource
   * @param key key of deleted property
   * @returns update resource
   */
  public static deleteFromPropertyList = (resourceData: Resource, key: string) => {
    const tempResourceData = { ...resourceData } as Resource;

    if (!tempResourceData.properties) {
      return;
    }

    const propertyList = tempResourceData.properties.map(p => ({ ...p }));
    tempResourceData.properties = propertyList.filter(property => property.key !== key);

    return tempResourceData;
  }

  /**
   * Updates material table resource style data
   *
   * @param resourceData resource data
   * @param currentData current key value pair data from material table
   * @param updatedData updated key value pair data from material table
   * @returns updated resource
   */
  public static updateMaterialTableStyle = (resourceData: Resource, currentData: KeyValueProperty, updatedData?: KeyValueProperty) => {
    const tempResourceData = { ...resourceData } as Resource;

    if (!tempResourceData.styles) {
      return;
    }

    const styleList = tempResourceData.styles.map(p => ({ ...p }));
    const index = styleList.findIndex(style => style.key === currentData.key);

    if (index < 0) {
      styleList.push({ key: currentData.key, value: currentData.value })
    } else if (updatedData) {
      styleList[index] = { key: updatedData.key, value: updatedData.value };
    }

    tempResourceData.styles = styleList;
    return tempResourceData;
  }

  /**
   * Deletes style from resource
   *
   * @param resourceData resource
   * @param key key of deleted style
   * @returns update resource
   */
  public static deleteFromStyleList = (resourceData: Resource, key: string) => {
    const tempResourceData = { ...resourceData } as Resource;

    if (!tempResourceData.styles) {
      return;
    }

    const styleList = tempResourceData.styles.map(p => ({ ...p }));
    tempResourceData.styles = styleList.filter(style => style.key !== key);

    return tempResourceData;
  }

  /**
   * Push all property key value pairs from state maps to properties array
   * 
   * TODO: Remove maps once AppSettingsView is changed to use resource instead of maps
   *
   * @param resourceMap resource map
   * @param iconsMap icons map
   * @returns list of property key value pairs
   */
  public static getPropertiesToUpdate = (resourceMap: Map<string, string>, iconsMap: Map<string, string>): KeyValueProperty[] => {
    const properties: KeyValueProperty[] = [];

    resourceMap.forEach((value: string, key: string) => {
      const index = properties.findIndex((p: KeyValueProperty) => p.key === key);
      if (index > -1) {
        properties[index] = { key: key, value: value || "" };
      } else {
        properties.push({ key: key, value: value || "" });
      }
    });

    iconsMap.forEach((value: string, key: string) => {
      const index = properties.findIndex((p: KeyValueProperty) => p.key === key);
      if (index > -1) {
        properties[index] = { key: key, value: value || "" };
      } else {
        properties.push({ key: key, value: value || "" });
      }
    });

    return properties;
  }

  /**
   * Update map values based on new and old value.
   * 
   * TODO: Remove maps once AppSettingsView is changed to use resource instead of maps
   *
   * @param oldData old data from table
   * @param newData new data from table
   * @returns updated maps for resources and icons
   */
  public static updateMapsOnTableDataChange = (
    oldData: ({ key: string; } & { value: string; }) | undefined,
    newData: { key: string; } & { value: string; },
    resourceMap: Map<string, string>,
    iconsMap: Map<string, string>
  ) => {

    if (oldData) {
      const keyChanged = oldData.key !== newData.key;
      const valueChanged = oldData.value !== newData.value;
      const inResourceMap = resourceMap.has(oldData.key);
      const inIconsMap = iconsMap.has(oldData.key);

      if (keyChanged) {
        if (inResourceMap) {
          resourceMap.delete(oldData.key);
          resourceMap.set(newData.key, newData.value);
        } else if (inIconsMap) {
          iconsMap.delete(oldData.key);
          iconsMap.set(newData.key, newData.value);
        }
      } else if (valueChanged) {
        if (inResourceMap) {
          resourceMap.set(oldData.key, newData.value);
        } else if (inIconsMap) {
          iconsMap.set(oldData.key, newData.value);
        }
      }
    } else {
      return ResourceUtils.addResourceToMap(newData, iconsMap, resourceMap);
    }

    return { updatedResourceMap: resourceMap, updatedIconsMap: iconsMap };
  }

    /**
   * Adds resource to map
   * 
   * TODO: Remove maps once AppSettingsView is changed to use resource instead of maps
   *
   * @param newData new data
   * @param iconsMap icons map
   * @param resourceMap resource map
   * @returns updated maps for resources and icons
   */
  public static addResourceToMap = (
    newData: { key: string; } & { value: string; },
    iconsMap: Map<string, string>,
    resourceMap: Map<string, string>
  ) => {
    newData.key.startsWith("icon_") ?
      iconsMap.set(newData.key, newData.value) :
      resourceMap.set(newData.key, newData.value);

    return { updatedResourceMap: resourceMap, updatedIconsMap: iconsMap };
  }

  /**
   * Deletes resource from map
   * 
   * TODO: Remove maps once AppSettingsView is changed to use resource instead of maps
   *
   * @param oldData  old data
   * @param iconsMap icons map
   * @param resourceMap resource map
   * @returns updated maps for resources and icons
   */
  public static deleteResourceFromMap = (
    oldData: { key: string; } & { value: string; },
    iconsMap: Map<string, string>,
    resourceMap: Map<string, string>
  ) => {
    oldData.key.startsWith("icon_") ?
      iconsMap.delete(oldData.key) :
      resourceMap.delete(oldData.key);

    return { updatedResourceMap: resourceMap, updatedIconsMap: iconsMap };
  }

  /**
   * Update resource and icons maps
   * 
   * TODO: Remove maps once AppSettingsView is changed to use resource instead of maps
   *
   * @param resource resource
   * @returns initialized maps for resources and icons
   */
  public static updateMaps = (resource: Resource) => {
    const initResourceMap = new Map<string, string>();
    const initIconsMap = new Map<string, string>();
    const props = resource.properties;
    const allKeys = Object.values(IconKeys);

    if (props) {
      props.forEach(p => {
        const iconTypeKey = allKeys.find(k => p.key === k.toString());
        p.key.startsWith("icon_") || iconTypeKey ?
          initIconsMap.set(p.key, p.value) :
          initResourceMap.set(p.key, p.value);
      });
    }

    return { initResourceMap, initIconsMap };
  }
}

/**
 * Resource types that can act as a root resource in resource hierarchy
 */
const ALLOWED_ROOT_RESOURCE_TYPES: ResourceType[] = [
  ResourceType.INTRO,
  ResourceType.LANGUAGEMENU
];

/**
 * Map of allowed child resource types of each resource type
 */
const ALLOWED_CHILD_RESOURCE_TYPES: Map<ResourceType, ResourceType[]> = new Map([
  [ ResourceType.APPLICATION, [] ],
  [ ResourceType.ROOT, [] ],
  [ ResourceType.INTRO, [ ResourceType.PAGE ] ],
  [ ResourceType.LANGUAGEMENU, [ ResourceType.LANGUAGE ] ],
  [ ResourceType.LANGUAGE, [ ResourceType.MENU, ResourceType.SLIDESHOW ] ],
  [ ResourceType.MENU, [ ResourceType.SLIDESHOW, ResourceType.MENU ] ],
  [ ResourceType.SLIDESHOW, [ ResourceType.PAGE ] ],
  [ ResourceType.SLIDESHOWPDF, [] ],
  [ ResourceType.PAGE, [ ResourceType.VIDEO, ResourceType.TEXT, ResourceType.PDF, ResourceType.IMAGE ] ],
  [ ResourceType.TEXT, [] ],
  [ ResourceType.PDF, [] ],
  [ ResourceType.IMAGE, [] ],
  [ ResourceType.VIDEO, [] ]
]);