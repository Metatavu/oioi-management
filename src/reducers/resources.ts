import { Resource } from "../generated/client/src/models/Resource";
import { ResourceAction } from "../actions/resources";
import { Reducer } from "redux";
import { SET_RESOURCES, SELECT_RESOURCE, UPDATED_RESOURCE_VIEW } from "../constants/actionTypes";

/**
 * Resource state
 */
export interface ResourceState {
  resources: Resource[];
  selectedResource?: Resource;
  resourceViewUpdated: number;
}

/**
 * Initial resource state
 */
const initialState: ResourceState = {
  resources: [],
  resourceViewUpdated: 0
};

/**
 * Resource reducer
 *
 * @param state previous state
 * @param action dispatched action
 * @returns updated resource state
 */
export const resourcesReducer: Reducer<ResourceState, ResourceAction> = (
  state = initialState,
  action: ResourceAction
): ResourceState => {
  switch (action.type) {
    case SET_RESOURCES:
      return {
        ...state,
        resources: action.payload
      }
    case SELECT_RESOURCE:
      return {
        ...state,
        selectedResource: action.payload
      };
    case UPDATED_RESOURCE_VIEW:
      return {
        ...state,
        resourceViewUpdated: state.resourceViewUpdated + 1
      };
    default:
      return state;
  }
};