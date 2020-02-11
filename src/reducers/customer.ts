import { CustomerAction } from '../actions/customer';
import { SET_CUSTOMER } from '../constants/actionTypes';
import { CustomerState } from '../types';
import { Customer } from '../generated/client/src';

const initialState: CustomerState = {} as Customer;

/**
 * Redux reducer for customer
 * 
 * @param state state of the customer
 * @param action action of the customer
 */
export function customerReducer(state: CustomerState = initialState, action: CustomerAction) {
  switch (action.type) {
    case SET_CUSTOMER:
      return action.customer;
  }
  return state
}