import { LocaleAction } from "../actions/locale";
import { SET_LOCALE } from "../constants/actionTypes";
import { Reducer } from "redux";
import strings from "../localization/strings";

/**
 * Locale state
 */
interface LocaleState {
  locale: string
}

/**
 * Initial locale state
 */
const initialState: LocaleState = {
  locale: "fi"
}

/**
 * Redux reducer for locale
 *
 * @param storeState store state of locale
 * @param action action of locale
 * @returns updated locale state
 */
export const localeReducer: Reducer<LocaleState, LocaleAction> = (state = initialState, action): LocaleState => {
  switch (action.type) {
    case SET_LOCALE:
      strings.setLanguage(action.locale);
      return {
        ...state,
        locale: action.locale
      };
    default:
      return state;
  }
}