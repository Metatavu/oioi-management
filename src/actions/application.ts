import * as actionTypes from "../constants/actionTypes";
import { Application } from "../generated/client/src";
import { ActionCreator } from "redux";

/**
 * Set application action
 */
export interface SetApplicationAction {
  type: actionTypes.SET_APPLICATION;
  application: Application;
}

/**
 * Set application action creator
 *
 * @param application application
 */
export const setApplication: ActionCreator<SetApplicationAction> = (application: Application) => ({
  type: actionTypes.SET_APPLICATION,
  application: application
});

export type ApplicationAction = SetApplicationAction;