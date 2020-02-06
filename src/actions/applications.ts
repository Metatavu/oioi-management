import * as actionTypes from '../constants/actionTypes';
import { Application } from '../generated/client/src';

/**
 * Interface for customer action type
 */
export interface SetApplicationsAction {
  type: actionTypes.SETAPPLICATIONS,
  applications: Application[],
}

export function setApplications(applications: Application[]): SetApplicationsAction {
  return {
    type: actionTypes.SETAPPLICATIONS,
    applications: applications,
  }
}

export type ApplicationsAction = SetApplicationsAction;