import { Resource } from "../generated/client/src/models/Resource";
import { ResourceAction } from "../actions/resources";
import { Reducer } from "redux";
import { OPEN_RESOURCE, UPDATE_RESOURCES } from "../constants/actionTypes";

/**
 * Resource state
 */
export interface ResourceState {
  resourceOpen?: Resource;
  resources: Resource[];
}

/**
 * Initial state
 */
const initialState: ResourceState = {
  resourceOpen: undefined,
  resources: []
};

/**
 * Resource reducer
 * @param state
 * @param action
 */
export const resourcesReducer: Reducer<ResourceState, ResourceAction> = (state = initialState, action: ResourceAction): ResourceState => {
  switch (action.type) {
    case OPEN_RESOURCE: {
      return {
        ...state,
        resourceOpen: action.payload.resource
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
