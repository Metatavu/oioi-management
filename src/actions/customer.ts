import * as actionTypes from '../constants/actionTypes';
import { Customer } from '../generated/client/src';

/**
 * Interface for customer action type
 */
export interface SetCustomerAction {
  type: actionTypes.SET_CUSTOMER,
  customer: Customer,
}

/**
 * Function for dispatching customers
 * 
 * @param customer customer being dispatched
 */
export function setCustomer(customer: Customer): SetCustomerAction {
  return {
    type: actionTypes.SET_CUSTOMER,
    customer: customer,
  }
}

export type CustomerAction = SetCustomerAction;