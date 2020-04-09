import { ResourceType } from "../generated/client/src";
import strings from "../localization/strings";

export interface ResourceTypeObject{
    value?: ResourceType
    localization?: String
}

/**
 * Find available resource types based on the given parent type.
 * 
 * TODO: Instead of writing the objects here it would be best to have separate
 * JSON file
 * 
 * @param type Given ResourceType
 */
export const resolver = (type: ResourceType): ResourceTypeObject[] => ({
  [ResourceType.ROOT] : [
    {
      value: ResourceType.INTRO,
      localization: strings.intro
    }, {
      value: ResourceType.LANGUAGE,
      localization: strings.language
    }
  ],
  [ResourceType.INTRO]: [
    {
      value: ResourceType.PAGE,
      localization: strings.page
    }
  ],
  [ResourceType.LANGUAGE] : [
    {
      value: ResourceType.MENU,
      localization: strings.menu
    }, {
      value: ResourceType.SLIDESHOW,
      localization: strings.slideshow
    }
  ],
  [ResourceType.MENU]: [
    {
      value: ResourceType.SLIDESHOW,
      localization: strings.slideshow
    }, {
      value: ResourceType.MENU,
      localization: strings.menu
    }
  ],
  [ResourceType.SLIDESHOW] : [
    {
      value: ResourceType.PAGE,
      localization: strings.page
    }
  ],
  [ResourceType.PAGE]: [
    {
      value: ResourceType.VIDEO,
      localization: strings.video
    }, {
      value: ResourceType.TEXT,
      localization: strings.text
    },{
      value: ResourceType.IMAGE,
      localization: strings.image
    }, {
      value: ResourceType.PDF,
      localization: strings.pdf
    }
  ],
  // These resources won't act as a parent but are required for the object literal
  [ResourceType.PDF]: [],
  [ResourceType.IMAGE] : [],
  [ResourceType.TEXT]: [],
  [ResourceType.VIDEO]: []
})[type]
