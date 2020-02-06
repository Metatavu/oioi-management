import { ApplicationsAction } from '../actions/applications';
import { SETAPPLICATIONS } from '../constants/actionTypes';
import { ApplicationsState } from '../types';
import { Application } from '../generated/client/src';

const initialState: ApplicationsState = [{}] as Application[];

export function applicationsReducer(state: ApplicationsState = initialState, action: ApplicationsAction) {
  switch (action.type) {
    case SETAPPLICATIONS:
      return action.applications;
  }
  return state
}