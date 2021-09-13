import { configureStore } from "@reduxjs/toolkit";
import applicationReducer from "features/application-slice";
import authReducer from "features/auth-slice";
import contentVersionReducer from "features/content-version-slice";
import customerReducer from "features/customer-slice";
import deviceSlice from "features/device-slice";
import localeReducer from "features/locale-slice";
import resourceSlice from "features/resource-slice";

/**
 * Initialized Redux store
 */
export const store = configureStore({
  middleware: getDefaultMiddleware => getDefaultMiddleware({ serializableCheck: false }),
  reducer: {
    application: applicationReducer,
    auth: authReducer,
    contentVersion: contentVersionReducer,
    customer: customerReducer,
    device: deviceSlice,
    locale: localeReducer,
    resource: resourceSlice
  }
});

/**
 * Type of root state of Redux store
 */
export type ReduxState = ReturnType<typeof store.getState>;

/**
 * Type of dispatch method for dispatching actions to Redux store
 */
export type ReduxDispatch = typeof store.dispatch;