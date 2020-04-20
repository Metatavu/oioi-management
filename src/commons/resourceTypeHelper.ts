import { ResourceType } from "../generated/client/src";
import strings from "../localization/strings";

export interface ResourceTypeObject{
    value?: ResourceType;
    resourceLocal?: String;
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
      resourceLocal: strings.resourceTypes.intro
    }, {
      value: ResourceType.LANGUAGEMENU,
      resourceLocal: strings.resourceTypes.languageMenu
    },
    {
      value: ResourceType.MENU,
      resourceLocal: strings.resourceTypes.menu
    }
  ],
  [ResourceType.INTRO]: [
    {
      value: ResourceType.PAGE,
      resourceLocal: strings.resourceTypes.page
    }
  ],
  [ResourceType.LANGUAGEMENU] : [
    {
      value: ResourceType.LANGUAGE,
      resourceLocal: strings.resourceTypes.language
    }
  ],
  [ResourceType.LANGUAGE] : [
    {
      value: ResourceType.MENU,
      resourceLocal: strings.resourceTypes.menu
    }, {
      value: ResourceType.SLIDESHOW,
      resourceLocal: strings.resourceTypes.slideshow
    }
  ],
  [ResourceType.MENU]: [
    {
      value: ResourceType.SLIDESHOW,
      resourceLocal: strings.resourceTypes.slideshow
    }, {
      value: ResourceType.MENU,
      resourceLocal: strings.resourceTypes.menu
    }
  ],
  [ResourceType.SLIDESHOW] : [
    {
      value: ResourceType.PAGE,
      resourceLocal: strings.resourceTypes.page
    }
  ],
  [ResourceType.PAGE]: [
    {
      value: ResourceType.VIDEO,
      resourceLocal: strings.resourceTypes.video
    }, {
      value: ResourceType.TEXT,
      resourceLocal: strings.resourceTypes.text
    },{
      value: ResourceType.IMAGE,
      resourceLocal: strings.resourceTypes.image
    }, {
      value: ResourceType.PDF,
      resourceLocal: strings.resourceTypes.pdf
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
  [ResourceType.ROOT] : {
    fileUploadLocal : [
      strings.fileUpload.addMedia,
      strings.fileUpload.changeMedia
    ]
  },
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

/**
 * Get allowed filetype for file uploader
 * @param type
 */
export const getAllowedFileTypes = (type: ResourceType): string[] => {
  switch (type) {
    case ResourceType.IMAGE: {
      return ["image/*"];
    }
    case ResourceType.PDF: {
      return ["application/pdf"];
    }
    case ResourceType.VIDEO: {
      return ["video/*"];
    }
    default: {
      return [];
    }
  }
};

/**
 * Get localized string for each resource type
 * @param type
 */
export const getLocalizedTypeString = (type: ResourceType): ResourceTypeObject => ({
  [ResourceType.ROOT] : { resourceLocal: strings.resourceTypes.root },
  [ResourceType.INTRO]: { resourceLocal: strings.resourceTypes.intro },
  [ResourceType.LANGUAGEMENU] : { resourceLocal: strings.resourceTypes.languageMenu },
  [ResourceType.LANGUAGE] : { resourceLocal: strings.resourceTypes.language },
  [ResourceType.MENU]: { resourceLocal: strings.resourceTypes.menu },
  [ResourceType.SLIDESHOW] : { resourceLocal: strings.resourceTypes.slideshow },
  [ResourceType.PAGE]: { resourceLocal: strings.resourceTypes.page },
  [ResourceType.PDF]: { resourceLocal: strings.resourceTypes.pdf },
  [ResourceType.IMAGE] : { resourceLocal: strings.resourceTypes.image },
  [ResourceType.TEXT]: { resourceLocal: strings.resourceTypes.text },
  [ResourceType.VIDEO]: { resourceLocal: strings.resourceTypes.video },
})[type]
