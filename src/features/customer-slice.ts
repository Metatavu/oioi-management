import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { ReduxState } from "app/store";
import { Customer } from "generated/client";

/**
 * Customer state
 */
export type CustomerState = {
  customer?: Customer;
}

/**
 * Initial customer state
 */
const initialState: CustomerState = {
  customer: undefined
}

/**
 * Customer slice of Redux store
 */
export const customerSlice = createSlice({
  name: "customer",
  initialState,
  reducers: {
    setCustomer: (state, { payload }: PayloadAction<Customer>) => {
      state.customer = payload;
    }
  }
});

/**
 * Customer actions from created customer slice
 */
export const { setCustomer } = customerSlice.actions;

/**
 * Select customer selector
 *
 * @param state Redux store root state
 * @returns customer from Redux store
 */
export const selectCustomer = (state: ReduxState) => state.customer.customer;

/**
 * Reducer for customer slice
 */
export default customerSlice.reducer;