import { Resource } from "../generated/client/src/models/Resource";
import { ResourceAction } from "../actions/resources";
import { Reducer } from "redux";
import { OPEN_RESOURCE, UPDATED_RESOURCE_VIEW } from "../constants/actionTypes";

/**
 * Resource state
 */
export interface ResourceState {
  resourceOpen?: Resource;
  resourceViewUpdated: number;
}

/**
 * Initial state
 */
const initialState: ResourceState = {
  resourceOpen: undefined,
  resourceViewUpdated: 0
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
    case UPDATED_RESOURCE_VIEW: {
      return {
        ...state,
        resourceViewUpdated: state.resourceViewUpdated + 1
      };
    }
    default:
      return state;
  }
};
