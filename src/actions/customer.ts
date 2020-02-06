import * as actionTypes from '../constants/actionTypes';
import { Customer } from '../generated/client/src';

/**
 * Interface for customer action type
 */
export interface SetCustomerAction {
  type: actionTypes.SETCUSTOMER,
  customer: Customer,
}

export function setCustomer(customer: Customer): SetCustomerAction {
  return {
    type: actionTypes.SETCUSTOMER,
    customer: customer,
  }
}

export type CustomerAction = SetCustomerAction;