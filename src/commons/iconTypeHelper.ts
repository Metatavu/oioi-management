import strings from "../localization/strings";

/**
 * Interface for IconKeys. Contains all icon keys
 */
export enum IconKeys {
  ICONHOME = "icon_home",
  ICONHOMEACTIVE = "icon_home_active",
  ICONBACK = "icon_back",
  ICONBACKACTIVE = "icon_back_active",
  ICONFORWARD = "icon_forward",
  ICONFORWARDACTIVE = "icon_forward_active",
  ICONCLOSE = "icon_close",
  ICONCLOSEACTIVE = "icon_close_active",
  ICONEXITAPP = "icon_exit_app",
  ICONEXITAPPACTIVE = "icon_exit_app_active"
}

/**
 * Get localized string for each icon key
 * @param type icon key
 */
export const getLocalizedIconTypeString = (type: IconKeys): string => ({
  [IconKeys.ICONHOME] : strings.iconKeys.iconHome,
  [IconKeys.ICONHOMEACTIVE]: strings.iconKeys.iconHomeActive,
  [IconKeys.ICONBACK] : strings.iconKeys.iconBack,
  [IconKeys.ICONBACKACTIVE] : strings.iconKeys.iconBackActive,
  [IconKeys.ICONFORWARD]: strings.iconKeys.iconForward,
  [IconKeys.ICONFORWARDACTIVE] : strings.iconKeys.iconForwardActive,
  [IconKeys.ICONCLOSE]: strings.iconKeys.iconClose,
  [IconKeys.ICONCLOSEACTIVE]: strings.iconKeys.iconCloseActive,
  [IconKeys.ICONEXITAPP] : strings.iconKeys.iconExitApp,
  [IconKeys.ICONEXITAPPACTIVE]: strings.iconKeys.iconExitAppActive,
})[type];

/**
 * Get localized string for each icon key
 * @param type icon key
 */
export const getDefaultIconURL = (type: IconKeys): string => ({
  [IconKeys.ICONHOME] : "https://oioi-static.metatavu.io/default_icon_home.png",
  [IconKeys.ICONHOMEACTIVE]: "https://oioi-static.metatavu.io/default_icon_home_active.png",
  [IconKeys.ICONBACK] : "https://oioi-static.metatavu.io/default_icon_back.png",
  [IconKeys.ICONBACKACTIVE] : "https://oioi-static.metatavu.io/default_icon_back_active.png",
  [IconKeys.ICONFORWARD]: "https://oioi-static.metatavu.io/default_icon_forward.png",
  [IconKeys.ICONFORWARDACTIVE] : "https://oioi-static.metatavu.io/default_icon_forward_active.png",
  [IconKeys.ICONCLOSE]: "https://oioi-static.metatavu.io/default_icon_close.png",
  [IconKeys.ICONCLOSEACTIVE]: "https://oioi-static.metatavu.io/default_icon_close_active.png",
  [IconKeys.ICONEXITAPP] : "https://oioi-static.metatavu.io/default_icon_close_app.png",
  [IconKeys.ICONEXITAPPACTIVE]: "https://oioi-static.metatavu.io/default_icon_close_app_active.png",
})[type];