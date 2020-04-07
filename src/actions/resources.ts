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

export const updatedResourceView: ActionCreator<UpdatedResourceViewAction> = () => {
  return {
    type: actionTypes.UPDATED_RESOURCE_VIEW
  };
};

/**
 * Resource actions
 */
export type ResourceAction = OpenResourceAction | UpdateResourcesAction | UpdatedResourceViewAction;
