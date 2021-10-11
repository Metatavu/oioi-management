import LocalizedStrings, { LocalizedStringsMethods } from "localized-strings";
import en from "./en.json";
import fi from "./fi.json";

export interface IStrings extends LocalizedStringsMethods {
  active: string;
  actions: string;
  address: string;
  advanced: string;
  addNew: string;
  addNewIcon: string;
  addLanguage: string;
  addNewCustomer: string;
  addNewDevice: string;
  addNewIntroOrLanguageMenu: string;
  applications: string;
  applicationName: string;
  applicationBasicInformation: string;
  applicationId: string;
  back: string;
  cancel: string;
  confirm: string;
  customers: string;
  customerLogo: string;
  customerInformation: string;
  delete: string;
  details: string;
  devices: string;
  deviceImage: string;
  deviceInformation: string;
  dropFile: string;
  edit: string;
  editDevice: string;
  editCustomer: string;
  deleteConfirmation: string;
  deleteSuccess: string;
  home: string;
  informationOptional: string;
  languageVersions: string;
  mainNavigationIcons: string;
  name: string;
  nameText: string;
  title: string;
  content: string;
  backgroundMedia: string;
  backgroundImage: string;
  menuImage: string;
  normal: string;
  save: string;
  saving: string;
  selectLanguage: string;
  serialNumberOptional: string;
  loading: string;
  apikey: string;
  resourceSettings: string;
  addNewResource: string;
  resourceType: string;
  orderNumber: string;
  slug: string;
  deleteResource: string;
  deleteResourceDialogDescription: string;
  continueWithoutSaving: string;
  andAllChildren: string;
  key: string;
  value: string;
  styles: string;
  properties: string;
  update: string;
  file: string;
  requiredField: string;
  dontCopy: string;
  copyContentFromLanguageLabel: string;
  unknownErrorMessage: string;
  badRequestErrorMessage: string;
  forbiddenErrorMessage: string;
  notFoundErrorMessage: string;
  internalErrorMessage: string;
  unavailableErrorMessage: string;
  updateSuccessMessage: string;
  createSuccessMessage: string;
  deleteSuccessMessage: string;
  importInProgress: string;
  importDone: string;
  importLabel: string;
  playback: string;
  autoplay: string;
  loop: string;
  slideTimeOnScreen: string;
  menuIcon: string;
  replacedIcons: string;
  page: string;
  type: string;
  childResources: string;
  resourceName: string;
  orderFromLeftToRight: string;
  iconNamePrefixNotice: string;
  noMediaPlaceholder: string;
  foregroundImage: string;
  inputUrlAddress: string;
  urlAddressDialogTitle: string;
  urlAddressDialogContent: string;
  urlAddressDialogLabel: string;
  actionCannotBeReverted: string;

  /**
   * Translations related to customers list screen
   */
  customersList: {
    loadingCustomers: string;
  }

  /**
   * Translations related to applications list screen
   */
  applicationsList: {
    loadingApplications: string;
  }

  /**
   * Translations related to devices list screen
   */
  devicesList: {
    loadingDevices: string;
  }

  /**
   * Translations related to application editor
   */
  applicationEditor: {
    dragSidebar: string;
    loadingContentTree: string;
    deleteApplication: string;
    deleteVersion: string;
    deleteLanguage: string;
  };

  /**
   * Translations common to each settings view
   */
  commonSettingsTexts: {
    name: string;
    teaserText: string;
    media: string;
  }

  /**
   * Translations related to intro settings
   */
  introSettingsView: {
    title: string;
    contentText: string;
    backgroundMedia: string;
    foregroundMedia: string;
    delete: string;
  };

  /**
   * Translations related to language settings
   */
  languageSettingsView: {
    title: string;
    contentText: string;
    backgroundMedia: string;
    foregroundMedia: string;
    delete: string;
  };

  /**
   * Translations related to language menu settings
   */
  languageMenuSettingsView: {
    title: string;
    contentText: string;
    backgroundMedia: string;
    foregroundMedia: string;
    delete: string;
  },

  /**
   * Translations related to menu settings
   */
  menuSettingsView: {
    title: string;
    contentText: string;
    backgroundMedia: string;
    foregroundMedia: string;
    delete: string;
  },

  /**
   * Translations related to application settings
   */
  applicationSettingsView: {
    title: string;
    contentText: string;
    backgroundMedia: string;
    foregroundMedia: string;
    delete: string;
  },

  /**
   * Translations related to page settings
   */
  pageSettingsView: {
    delete: string;
  },

  /**
   * Translations related to slideshow settings
   */
  slideshowSettingsView: {
    title: string;
    contentText: string;
    backgroundMedia: string;
    foregroundMedia: string;
    delete: string;
  },

  /**
   * Translations related to PDF settings
   */
  pdfSettingsView: {
    delete: string;
  },

  /**
   * Translations related to file upload
   */
  fileUpload: {
    addMedia: string;
    changeMedia: string;
    addFile: string;
    changeFile: string;
    addImage: string;
    changeImage: string;
    addVideo: string;
    changeVideo: string;
    addPDF: string;
    changePDF: string;
    upload: string;
    cancel: string;
    dropFileHere: string;
    uploadFile: string;
    preview: string;
    finalizing: string;
  };

  /**
   * Translations related to resource types
   */
  resourceTypes: {
    contentVersion: string;
    root: string;
    video: string;
    page: string;
    slideshow: string;
    slideshowPdf: string;
    intro: string;
    languageMenu: string;
    language: string;
    menu: string;
    pdf: string;
    text: string;
    image: string;
    application: string;
  };

  /**
   * Translations related to application settings
   */
  applicationSettings: {
    teaserText: string;
    settings: string;
    background: string;
    icon: string;
    icons: string;
    addIconSelect: string;
    addIconTextField: string;
    returnDelay: string;
    bundleId: string;
    id: string;
    addIcon: string;
    advancedSettings: string;
    deleteApplication: string;
    deleteApplicationConfirmationText: string;
  };

  /**
   * Translations related to content version controls
   */
  contentVersionControls: {
    contentVersion: string;
    notSelected: string;
    addNewVersion: string;
    setActive: string;
    alreadyActive: string;
    versionNotSelected: string;
    activeVersion: string;
    alreadyExists: string;
    content: string;
    empty: string;
    activeVersionUpdateSuccess: string;
    deleteVersion: string;
    cannotDeleteActiveVersion: string;
    deleteSelectedVersion: string;
    deleteVersionConfirmationText: string;
    deleteVersionSuccess: string;
  };

  /**
   * Translations related to icon keys
   */
  iconKeys: {
    iconHome: string;
    iconHomeActive: string;
    iconBack: string;
    iconBackActive: string;
    iconForward: string;
    iconForwardActive: string;
    iconClose: string;
    iconCloseActive: string;
    iconExitApp: string;
    iconExitAppActive: string;
    iconLeft: string;
    iconLeftActive: string;
    iconRight: string;
    iconRightActive: string;
  };

  /**
   * Translations related to error management
   */
  errorManagement: {
    title: string;
    customer: {
      list: string;
      create: string;
      find: string;
      update: string;
      delete: string;
    };
    device: {
      list:  string;
      create: string;
      find: string;
      update: string;
      delete: string;
    };
    application: {
      list:  string;
      create: string;
      find: string;
      update: string;
      delete: string;
    };
    contentVersion: {
      list: string;
      create: string;
      update: string;
      delete: string;
    };
    resource: {
      list: string;
      listChild: string;
      create: string;
      find: string;
      update: string;
      updateChild: string;
      delete: string;
      newLock: string;
      otherUserEditing: string;
    };
    file: {
      upload: string;
    };
    auth: {
      init: string;
      refresh: string;
    };
  };

  /**
   * Localized delete confirmations by resource type
   *
   * - properties are named as the resource type enum for ease of use
   */
  deleteConfirmationsByType: {
    "INTRO": string;
    "LANGUAGE_MENU": string;
    "LANGUAGE": string;
    "SLIDESHOW": string;
    "SLIDESHOW_PDF": string;
    "MENU": string;
    "PAGE": string;
    "PDF": string;
    "IMAGE": string;
    "VIDEO": string;
    "TEXT": string;
    "APPLICATION": string;
  };
};

const strings: IStrings = new LocalizedStrings({ en, fi });

export default strings;
