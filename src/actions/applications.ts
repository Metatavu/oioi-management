import * as actionTypes from '../constants/actionTypes';
import { Application } from '../generated/client/src';

/**
 * Interface for customer action type
 */
export interface SetApplicationsAction {
  type: actionTypes.SET_APPLICATIONS,
  applications: Application[],
}

/**
 * Function for dispatching applications
 * 
 * @param applications array of applications being dispatched
 */
export function setApplications(applications: Application[]): SetApplicationsAction {
  return {
    type: actionTypes.SET_APPLICATIONS,
    applications: applications,
  }
}

export type ApplicationsAction = SetApplicationsAction;