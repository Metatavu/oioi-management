import { CustomerAction } from "../actions/customer";
import { SET_CUSTOMER } from "../constants/actionTypes";
import { Customer } from "../generated/client/src";

export interface CustomerState {
  customer?: Customer;
}

const initialState: CustomerState = {
  customer: undefined
};

/**
 * Redux reducer for customer
 *
 * @param state state of the customer
 * @param action action of the customer
 */
export const customerReducer = (state = initialState, action: CustomerAction) => {
  switch (action.type) {
    case SET_CUSTOMER: {
      return {
        ...state,
        customer: action.customer
      };
    }

    default:
      return state;
  }
};
