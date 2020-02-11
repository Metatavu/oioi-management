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

/**
 * Update resource action
 */
export interface UpdateResourcesAction {
  type: actionTypes.UPDATE_RESOURCES;
  payload: {
    resources: Resource[];
  };
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

/**
 * Update resources
 * @param resources
 */
export const updateResources: ActionCreator<UpdateResourcesAction> = (resources: Resource[]) => {
  return {
    type: actionTypes.UPDATE_RESOURCES,
    payload: {
      resources
    }
  };
};

/**
 * Resource actions
 */
export type ResourceAction = OpenResourceAction | UpdateResourcesAction;
