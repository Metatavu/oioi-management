import * as actionTypes from "../constants/actionTypes";
import { Customer } from "../generated/client/src";
import { ActionCreator } from "redux";

/**
 * Interface for customer action type
 */
export interface SetCustomerAction {
  type: actionTypes.SET_CUSTOMER;
  customer: Customer;
}

/**
 * Function for dispatching customers
 *
 * @param customer customer being dispatched
 */
export const setCustomer: ActionCreator<SetCustomerAction> = (customer: Customer) => {
  return {
    type: actionTypes.SET_CUSTOMER,
    customer: customer
  };
};

export type CustomerAction = SetCustomerAction;
