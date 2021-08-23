import * as ActionTypes from "../constants/actionTypes";

/**
 * Interface for set locale action type
 */
export interface SetLocaleAction {
  type: ActionTypes.SET_LOCALE;
  locale: string;
}

/**
 * Store method for set locale
 *
 * @param locale locale string
 * @returns set locale action
 */
export function setLocale(locale: string): SetLocaleAction {
  return {
    type: ActionTypes.SET_LOCALE,
    locale: locale
  };
}

export type LocaleAction = SetLocaleAction;