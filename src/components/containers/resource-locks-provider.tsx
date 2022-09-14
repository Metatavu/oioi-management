import React, { FC, useEffect } from "react";
import { useSubscription } from 'mqtt-react-hooks';
import { MqttResourceLockUpdateFromJSON } from "generated/client/models/MqttResourceLockUpdate";
import { selectLockedResourceIds, setLockedResourceIds } from "../../features/resource-slice";
import { useAppDispatch, useAppSelector } from "app/hooks";
import { selectKeycloak } from "features/auth-slice";
import Api from "api";

/**
 * Component properties
 */
interface Props {
  applicationId: string;
}

/**
 * Resource locks provider component
 *
 * @param props component properties
 */
const ResourceLocksProvider: FC<Props> = ({ 
  children,
  applicationId 
}) => {
  const { message } = useSubscription(`resourcelocks`);
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector(selectKeycloak)?.token;
  const lockedResourceIds = useAppSelector(selectLockedResourceIds);

  /**
   * Loads initial resource locks
   */
  const loadInitialResourceLocks = async () => {
    if (!accessToken) {
      return;
    }

    const lockedResourceIds = await Api.getResourcesApi(accessToken).getLockedResourceIds({ applicationId: applicationId });

    dispatch(setLockedResourceIds(lockedResourceIds));
  };

  useEffect(() => {
    loadInitialResourceLocks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ accessToken ]);

  useEffect(() => {
    const lockUpdate = MqttResourceLockUpdateFromJSON(message?.message);
    if (lockUpdate) {
      const { locked, resourceId } = lockUpdate;

      const updatedLockedResourceIds = locked 
        ? Array.from(new Set([ ...lockedResourceIds, resourceId ]))
        : lockedResourceIds.filter(lockedResourceId => lockedResourceId !== resourceId);

      dispatch(setLockedResourceIds(updatedLockedResourceIds));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message]);

  return (
    <>
      { children }
    </>
  );
};

export default ResourceLocksProvider;