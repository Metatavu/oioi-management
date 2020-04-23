import { ActionCreator } from "redux";
import { Resource } from "../generated/client/src/models/Resource";
import * as actionTypes from "../constants/actionTypes";

/**
 * Open resource action
 */
export interface OpenResourceAction {
  type: actionTypes.OPEN_RESOURCE;
  payload: {
    resource: Resource;
  };
}

export interface UpdatedResourceViewAction {
  type: actionTypes.UPDATED_RESOURCE_VIEW;
}

/**
 * Open resource
 * @param resource
 */
export const openResource: ActionCreator<OpenResourceAction> = (resource: Resource) => {
  return {
    type: actionTypes.OPEN_RESOURCE,
    payload: {
      resource
    }
  };
};

export const updatedResourceView: ActionCreator<UpdatedResourceViewAction> = () => {
  return {
    type: actionTypes.UPDATED_RESOURCE_VIEW
  };
};
/**
 * Resource actions
 */
export type ResourceAction = OpenResourceAction | UpdatedResourceViewAction;