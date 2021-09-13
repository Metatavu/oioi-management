import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { ReduxState } from "app/store";
import { KeycloakInstance } from "keycloak-js";

/**
 * Interface describing auth state in Redux
 */
export interface AuthState {
  keycloak?: KeycloakInstance;
}

/**
 * Initial auth state
 */
const initialState: AuthState = {
  keycloak: undefined
}

/**
 * Auth slice of Redux store
 */
export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, { payload }: PayloadAction<KeycloakInstance>) => {
      state.keycloak = payload;
    },
    logout: state => {
      state.keycloak?.logout().success(() => {
        state.keycloak = undefined;
      });
    }
  }
});

/**
 * Auth actions from created auth slice
 */
export const { login, logout } = authSlice.actions;

/**
 * Select Keycloak selector
 *
 * @param state Redux store root state
 * @returns keycloak instance from Redux store
 */
export const selectKeycloak = (state: ReduxState) => state.auth.keycloak;

/**
 * Reducer for auth slice
 */
export default authSlice.reducer;