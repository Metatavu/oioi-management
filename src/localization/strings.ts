import LocalizedStrings, { LocalizedStringsMethods } from "localized-strings";

export interface IStrings extends LocalizedStringsMethods {
  active: string,
  addLanguage: string,
  addNewCustomer: string,
  addNewDevice: string,
  applications: string,
  applicationSettings: string,
  back: string,
  cancel: string,
  customers: string,
  customerLogo: string,
  delete: string,
  details: string,
  devices: string,
  deviceImage: string,
  dropFile: string,
  edit: string,
  home: string,
  languageVersions: string,
  mainNavigationIcons: string,
  name: string,
  normal: string,
  save: string,
  selectLanguage: string
}

const strings: IStrings = new LocalizedStrings({
  en: require("./en.json"),
  fi: require("./fi.json")
});

export default strings;