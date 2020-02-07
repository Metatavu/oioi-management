import { ActionCreator } from "redux";
import { Resource } from "../generated/client/src/models/Resource";
import * as actionTypes from "../constants/actionTypes";

export interface OpenResourceAction {
  type: actionTypes.OPEN_RESOURCE;
  payload: {
    resource: Resource;
  };
}

export interface UpdateResourcesAction {
  type: actionTypes.UPDATE_RESOURCES;
  payload: {
    resources: Resource[];
  };
}

export const openResource: ActionCreator<OpenResourceAction> = (resource: Resource) => {
  return {
    type: actionTypes.OPEN_RESOURCE,
    payload: {
      resource
    }
  };
};

export const updateResources: ActionCreator<UpdateResourcesAction> = (resources: Resource[]) => {
  return {
    type: actionTypes.UPDATE_RESOURCES,
    payload: {
      resources
    }
  };
};

export type ResourceAction = OpenResourceAction | UpdateResourcesAction;
