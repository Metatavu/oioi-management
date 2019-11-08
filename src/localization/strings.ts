import LocalizedStrings, { LocalizedStringsMethods } from "localized-strings";

export interface IStrings extends LocalizedStringsMethods {
  addNewCustomer: string,
  addNewDevice: string,
  cancel: string,
  customerLogo: string,
  deviceImage: string,
  dropFile: string,
  name: string,
  save: string
}

const strings: IStrings = new LocalizedStrings({
  en: require("./en.json"),
  fi: require("./fi.json")
});

export default strings;