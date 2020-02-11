import { ApplicationsAction } from '../actions/applications';
import { SET_APPLICATIONS } from '../constants/actionTypes';
import { ApplicationsState } from '../types';
import { Application } from '../generated/client/src';

const initialState: ApplicationsState = [{}] as Application[];

/**
 * Redux reducer for applications
 * 
 * @param state state of the applications
 * @param action action of the applications
 */
export function applicationsReducer(state: ApplicationsState = initialState, action: ApplicationsAction) {
  switch (action.type) {
    case SET_APPLICATIONS:
      return action.applications;
  }
  return state
}