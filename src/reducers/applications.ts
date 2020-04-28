import { Reducer } from "redux";
import { ApplicationAction } from "../actions/application";
import { SET_APPLICATION } from "../constants/actionTypes";
import { Application } from "../generated/client/src";

interface ApplicationsState {
  application?: Application;
}

const initialState: ApplicationsState = {
  application: undefined
};

/**
 * Redux reducer for applications
 *
 * @param state state of the applications
 * @param action action of the applications
 */
export const applicationsReducer: Reducer<ApplicationsState, ApplicationAction> = (state = initialState, action: ApplicationAction): ApplicationsState => {
  switch (action.type) {
    case SET_APPLICATION: {
      return {
        ...state,
        application: action.application
      };
    }
    default:
      return state;
  }
};
