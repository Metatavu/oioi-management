import LocalizedStrings, { LocalizedStringsMethods } from "localized-strings";

export interface IStrings extends LocalizedStringsMethods {
  active: string;
  address: string;
  addLanguage: string;
  addNewCustomer: string;
  addNewDevice: string;
  applications: string;
  applicationSettings: string;
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
  andAllChildren: string;
  key: string;
  value: string;
  styles: string;
  properties: string;
  update: string;
  file: string;
  requiredField: string;
  fileUpload: {
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
  }
  resourceTypes: {
    root: string;
    video: string;
    page: string;
    slideshow: string;
    intro: string;
    languageMenu: string;
    language: string;
    menu: string;
    pdf: string;
    text: string;
    image: string;
  }
  childResources:string;
}

const strings: IStrings = new LocalizedStrings({
  en: require("./en.json"),
  fi: require("./fi.json")
});

export default strings;
