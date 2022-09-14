import React from "react";
import { useDispatch, TypedUseSelectorHook, useSelector } from "react-redux";
import { ReduxDispatch, ReduxState } from "./store";

/**
 * Custom hook for accessing dispatch function for Redux state
 */
export const useAppDispatch = () => useDispatch<ReduxDispatch>();

/**
 * Custom hook for accessing selector function for redux state
 */
export const useAppSelector: TypedUseSelectorHook<ReduxState> = useSelector;

/**
 * Custom hook for running given callback function in intervals
 *
 * @param callback callback function
 * @param delay delay as milliseconds
 */
export const useInterval = (callback: () => any, delay: number) => {
  const savedCallback = React.useRef<typeof callback>();

  React.useEffect(() => {
    savedCallback.current = callback;
  });

  React.useEffect(() => {
    const tick = () => {
      savedCallback.current && savedCallback.current();
    }

    const timeout = setInterval(tick, delay);
    return () => clearInterval(timeout);
  }, [ delay ]);
}