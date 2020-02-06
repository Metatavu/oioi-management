import { CustomerAction } from '../actions/customer';
import { SETCUSTOMER } from '../constants/actionTypes';
import { CustomerState } from '../types';
import { Customer } from '../generated/client/src';

const initialState: CustomerState = {} as Customer;

export function customerReducer(state: CustomerState = initialState, action: CustomerAction) {
  switch (action.type) {
    case SETCUSTOMER:
      return action.customer;
  }
  return state
}