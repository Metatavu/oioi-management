import { ActionCreator } from "redux";
import * as ActionTypes from "../constants/actionTypes";

/**
 * Set locale action
 */
export interface SetLocaleAction {
  type: ActionTypes.SET_LOCALE;
  locale: string;
}

/**
 * Set locale action creator
 *
 * @param locale locale
 */
export const setLocale: ActionCreator<SetLocaleAction> = (locale: string) => ({
  type: ActionTypes.SET_LOCALE,
  locale: locale
});

export type LocaleAction = SetLocaleAction;