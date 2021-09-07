import { ActionCreator } from "redux";
import { Resource } from "../generated/client/src/models/Resource";
import * as actionTypes from "../constants/actionTypes";

/**
 * Set resources action
 */
export interface SetResourcesAction {
  type: actionTypes.SET_RESOURCES;
  payload: Resource[];
}

/**
 * Set selected resource action
 */
export interface SelectResourceAction {
  type: actionTypes.SELECT_RESOURCE;
  payload: Resource;
}

export interface UpdatedResourceViewAction {
  type: actionTypes.UPDATED_RESOURCE_VIEW;
}

/**
 * Set resources action creator
 *
 * @param resource resource
 */
export const setResources: ActionCreator<SetResourcesAction> = (resources: Resource[]) => ({
  type: actionTypes.SET_RESOURCES,
  payload: resources
});

/**
 * Select resource action creator
 *
 * @param resource resource
 */
export const selectResource: ActionCreator<SelectResourceAction> = (resource: Resource) => ({
  type: actionTypes.SELECT_RESOURCE,
  payload: resource
});

export const updatedResourceView: ActionCreator<UpdatedResourceViewAction> = () => {
  return {
    type: actionTypes.UPDATED_RESOURCE_VIEW
  };
};

export type ResourceAction = SetResourcesAction | SelectResourceAction | UpdatedResourceViewAction;