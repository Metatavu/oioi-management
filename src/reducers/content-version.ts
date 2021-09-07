import { Resource } from "../generated/client/src/models/Resource";
import { ContentVersionAction } from "../actions/content-version";
import { Reducer } from "redux";
import { SET_CONTENT_VERSIONS, SELECT_CONTENT_VERSION } from "../constants/actionTypes";

/**
 * Content version state
 */
export interface ContentVersionState {
  contentVersions: Resource[];
  selectedContentVersion?: Resource;
}

/**
 * Initial content version state
 */
const initialState: ContentVersionState = {
  contentVersions: []
};

/**
 * Content version reducer
 *
 * @param state previous state
 * @param action dispatched action
 * @returns updated resource state
 */
export const contentVersionReducer: Reducer<ContentVersionState, ContentVersionAction> = (
  state = initialState,
  action
): ContentVersionState => {
  switch (action.type) {
    case SET_CONTENT_VERSIONS:
      return {
        ...state,
        contentVersions: action.payload
      };
    case SELECT_CONTENT_VERSION:
      return {
        ...state,
        selectedContentVersion: action.payload
      };
    default:
      return state;
  }
};