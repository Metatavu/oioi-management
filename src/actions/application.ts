import * as actionTypes from "../constants/actionTypes";
import { Application } from "../generated/client/src";
import { ActionCreator } from "redux";

/**
 * Interface for customer action type
 */
export interface SetApplicationAction {
  type: actionTypes.SET_APPLICATION;
  application: Application;
}

/**
 * Function for dispatching applications
 *
 * @param applications array of applications being dispatched
 */
export const setApplication: ActionCreator<SetApplicationAction> = (application: Application) => {
  return {
    type: actionTypes.SET_APPLICATION,
    application: application
  };
};

export type ApplicationAction = SetApplicationAction;
