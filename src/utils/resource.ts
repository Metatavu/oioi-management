import { Resource, ResourceType } from "generated/client";

/**
 * Utility class for resources
 */
export class ResourceUtils {

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