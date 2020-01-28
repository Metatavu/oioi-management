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
  delete: string;
  details: string;
  devices: string;
  deviceImage: string;
  deleteConfirmation: string;
  dropFile: string;
  edit: string;
  home: string;
  image: string;
  informationOptional: string;
  languageVersions: string;
  mainNavigationIcons: string;
  name: string;
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
  pdf: string;
  text: string;
  video: string;
  file: string;
  page: string;
  slideshow: string;
  intro: string;
  language: string;
  menu: string;
}

const strings: IStrings = new LocalizedStrings({
  en: require("./en.json"),
  fi: require("./fi.json")
});

export default strings;
