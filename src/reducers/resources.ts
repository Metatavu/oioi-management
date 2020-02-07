import { Resource } from "../generated/client/src/models/Resource";
import { ResourceAction } from "../actions/resources";
import { Reducer } from "redux";
import { OPEN_RESOURCE, UPDATE_RESOURCES } from "../constants/actionTypes";

export interface ResourceState {
  resource?: Resource;
  resources: Resource[];
}

const initialState: ResourceState = {
  resource: undefined,
  resources: []
};

export const resourcesReducer: Reducer<ResourceState, ResourceAction> = (state = initialState, action: ResourceAction): ResourceState => {
  switch (action.type) {
    case OPEN_RESOURCE: {
      return {
        ...state,
        resource: action.payload.resource
      };
    }

    case UPDATE_RESOURCES: {
      return {
        ...state,
        resources: action.payload.resources
      };
    }

    default:
      return state;
  }
};
