import { Config } from "app/config";
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
  ICONEXITAPPACTIVE = "icon_exit_app_active",
  ICONLEFT = "icon_left",
  ICONLEFTACTIVE = "icon_left_active",
  ICONRIGHT = "icon_right",
  ICONRIGHTACTIVE = "icon_right_active"
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
  [IconKeys.ICONLEFT] : strings.iconKeys.iconLeft,
  [IconKeys.ICONLEFTACTIVE]: strings.iconKeys.iconLeftActive,
  [IconKeys.ICONRIGHT] : strings.iconKeys.iconRight,
  [IconKeys.ICONRIGHTACTIVE]: strings.iconKeys.iconRightActive,
})[type];

/**
 * Get default icon URL for each icon key
 * @param type icon key
 */
export const getDefaultIconURL = (type: IconKeys): string => ({
  [IconKeys.ICONHOME] : getCdnUrl("BTN_home.png"),
  [IconKeys.ICONHOMEACTIVE]: getCdnUrl("BTN_home_active.png"),
  [IconKeys.ICONBACK] : getCdnUrl("BTN_back.png"),
  [IconKeys.ICONBACKACTIVE] : getCdnUrl("BTN_back_active.png"),
  [IconKeys.ICONFORWARD]: getCdnUrl("BTN_forward.png"),
  [IconKeys.ICONFORWARDACTIVE] : getCdnUrl("BTN_forward_active.png"),
  [IconKeys.ICONCLOSE]: getCdnUrl("BTN_close.png"),
  [IconKeys.ICONCLOSEACTIVE]: getCdnUrl("BTN_close_active.png"),
  [IconKeys.ICONEXITAPP] : getCdnUrl("BTN_exit_app.png"),
  [IconKeys.ICONEXITAPPACTIVE]: getCdnUrl("BTN_exit_app_active.png"),
  [IconKeys.ICONLEFT] : getCdnUrl("BTN_left.png"),
  [IconKeys.ICONLEFTACTIVE]: getCdnUrl("BTN_left_active.png"),
  [IconKeys.ICONRIGHT] : getCdnUrl("BTN_right.png"),
  [IconKeys.ICONRIGHTACTIVE]: getCdnUrl("BTN_right_active.png")
})[type];

const getCdnUrl = (filename: string): string => {
  return `${Config.get().files.cdnPath}/${filename}`;
}