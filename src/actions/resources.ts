import { ActionCreator } from "redux";
import { Resource } from "../generated/client/src/models/Resource";
import * as actionTypes from "../constants/actionTypes";

export interface OpenAction {
  type: actionTypes.OPEN_RESOURCE;
  payload: {
    resource: Resource;
  };
}

export interface UpdateAction {
  type: actionTypes.UPDATE_RESOURCES;
  payload: {
    resources: Resource[];
  };
}

export const openResource: ActionCreator<OpenAction> = (resource: Resource) => {
  return {
    type: actionTypes.OPEN_RESOURCE,
    payload: {
      resource
    }
  };
};

export const updateResources: ActionCreator<UpdateAction> = (resources: Resource[]) => {
  return {
    type: actionTypes.UPDATE_RESOURCES,
    payload: {
      resources
    }
  };
};

export type ResourceAction = OpenAction | UpdateAction;
