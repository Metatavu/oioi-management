import { Reducer } from "redux";
import { ApplicationsAction } from "../actions/applications";
import { SET_APPLICATIONS } from "../constants/actionTypes";
import { Application } from "../generated/client/src";

interface ApplicationsState {
  applications?: Application[];
}

const initialState: ApplicationsState = {
  applications: undefined
};

/**
 * Redux reducer for applications
 *
 * @param state state of the applications
 * @param action action of the applications
 */
export const applicationsReducer: Reducer<ApplicationsState, ApplicationsAction> = (state = initialState, action: ApplicationsAction): ApplicationsState => {
  switch (action.type) {
    case SET_APPLICATIONS: {
      return {
        ...state,
        applications: action.applications
      };
    }
    default:
      return state;
  }
};
