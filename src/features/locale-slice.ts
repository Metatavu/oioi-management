import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { ReduxState } from "app/store";
import strings from "localization/strings";

/**
 * Locale state
 */
export type LocaleState = {
  locale: string;
}

/**
 * Initial locale state
 */
const initialState: LocaleState = {
  locale: strings.getLanguage()
}

/**
 * Locale slice of Redux store
 */
export const localeSlice = createSlice({
  name: "locale",
  initialState,
  reducers: {
    setLocale: (state, { payload }: PayloadAction<string>) => {
      strings.setLanguage(payload);
      state.locale = payload;
    }
  }
});

/**
 * Locale actions from created locale slice
 */
export const { setLocale } = localeSlice.actions;

/**
 * Select locale selector
 *
 * @param state Redux store root state
 * @returns keycloak instance from Redux store
 */
export const selectLocale = (state: ReduxState) => state.locale.locale;

/**
 * Reducer for locale slice
 */
export default localeSlice.reducer;