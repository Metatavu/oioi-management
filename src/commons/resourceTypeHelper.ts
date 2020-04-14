import { ResourceType } from "../generated/client/src";
import strings from "../localization/strings";

export interface ResourceTypeObject{
    value?: ResourceType;
    childResourceLocal?: String;
    fileUploadLocal? : String[];
}

/**
 * Find available resource types based on the given parent type.
 * 
 * TODO: Instead of writing the objects here it would be best to have separate
 * JSON file
 * 
 * @param type Given ResourceType
 */
export const resolveChildResourceTypes = (type: ResourceType): ResourceTypeObject[] => ({
  [ResourceType.ROOT] : [
    {
      value: ResourceType.INTRO,
      childResourceLocal: strings.intro
    }, {
      value: ResourceType.LANGUAGEMENU,
      childResourceLocal: strings.languageMenu
    }
  ],
  [ResourceType.INTRO]: [
    {
      value: ResourceType.PAGE,
      childResourceLocal: strings.page
    }
  ],
  [ResourceType.LANGUAGEMENU] : [
    {
      value: ResourceType.LANGUAGE,
      childResourceLocal: strings.language
    }
  ],
  [ResourceType.LANGUAGE] : [
    {
      value: ResourceType.MENU,
      childResourceLocal: strings.menu
    }, {
      value: ResourceType.SLIDESHOW,
      childResourceLocal: strings.slideshow
    }
  ],
  [ResourceType.MENU]: [
    {
      value: ResourceType.SLIDESHOW,
      childResourceLocal: strings.slideshow
    }, {
      value: ResourceType.MENU,
      childResourceLocal: strings.menu
    }
  ],
  [ResourceType.SLIDESHOW] : [
    {
      value: ResourceType.PAGE,
      childResourceLocal: strings.page
    }
  ],
  [ResourceType.PAGE]: [
    {
      value: ResourceType.VIDEO,
      childResourceLocal: strings.video
    }, {
      value: ResourceType.TEXT,
      childResourceLocal: strings.text
    },{
      value: ResourceType.IMAGE,
      childResourceLocal: strings.image
    }, {
      value: ResourceType.PDF,
      childResourceLocal: strings.pdf
    }
  ],
  // These resources won't act as a parent but are required for the object literal
  [ResourceType.PDF]: [],
  [ResourceType.IMAGE] : [],
  [ResourceType.TEXT]: [],
  [ResourceType.VIDEO]: []
})[type]

/**
 * Get correct localization names based on the given resource type.
 * TODO: Add also custom icons
 * @param type 
 */
export const resolveUploadLocalizationString = (type: ResourceType): ResourceTypeObject => ({
  [ResourceType.ROOT] : {},
  [ResourceType.INTRO]: {},
  [ResourceType.LANGUAGEMENU] : {},
  [ResourceType.LANGUAGE] : {},
  [ResourceType.MENU]: {},
  [ResourceType.SLIDESHOW] : {},
  [ResourceType.PAGE]: {},
  [ResourceType.PDF]: {
    fileUploadLocal : [
      strings.fileUpload.addPDF,
      strings.fileUpload.changePDF
    ]
  },
  [ResourceType.IMAGE] : {
    fileUploadLocal : [
      strings.fileUpload.addImage,
      strings.fileUpload.changeImage
    ]
  },
  [ResourceType.TEXT]: {},
  [ResourceType.VIDEO]: {
    fileUploadLocal : [
      strings.fileUpload.addVideo,
      strings.fileUpload.changeVideo
    ]
  },
})[type]
