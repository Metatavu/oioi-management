import React from "react";

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