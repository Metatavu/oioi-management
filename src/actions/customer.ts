import * as actionTypes from "../constants/actionTypes";
import { Customer } from "../generated/client/src";
import { ActionCreator } from "redux";

/**
 * Set customer action type
 */
export interface SetCustomerAction {
  type: actionTypes.SET_CUSTOMER;
  customer: Customer;
}

/**
 * Set customer action creator
 *
 * @param customer customer
 */
export const setCustomer: ActionCreator<SetCustomerAction> = (customer: Customer) => ({
  type: actionTypes.SET_CUSTOMER,
  customer: customer
});

export type CustomerAction = SetCustomerAction;