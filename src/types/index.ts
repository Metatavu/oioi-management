import { KeycloakInstance } from "keycloak-js";

export type AuthState = KeycloakInstance | null;

export type DialogType = "edit" | "show" | "new";
