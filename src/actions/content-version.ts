import { ActionCreator } from "redux";
import { Resource } from "../generated/client/src/models/Resource";
import { SELECT_CONTENT_VERSION, SET_CONTENT_VERSIONS } from "../constants/actionTypes";
import { ContentVersion } from "../types";

/**
 * Set content versions action
 */
export interface SetContentVersionsAction {
  type: SET_CONTENT_VERSIONS;
  payload: ContentVersion[];
}

/**
 * Set content version action
 */
export interface SelectContentVersionAction {
  type: SELECT_CONTENT_VERSION;
  payload: ContentVersion;
}

/**
 * Set content versions action creator
 *
 * @param contentVersions content versions
 */
export const setContentVersions: ActionCreator<SetContentVersionsAction> = (contentVersions: ContentVersion[]) => ({
  type: SET_CONTENT_VERSIONS,
  payload: contentVersions
});

/**
 * Select content version action creator
 *
 * @param contentVersion content version
 */
export const selectContentVersion: ActionCreator<SelectContentVersionAction> = (contentVersion: Resource) => ({
  type: SELECT_CONTENT_VERSION,
  payload: contentVersion
});

export type ContentVersionAction = SetContentVersionsAction | SelectContentVersionAction;