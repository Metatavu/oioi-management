import * as React from "react";

import { useAppDispatch, useAppSelector, useInterval } from "app/hooks";
import { AuthUtils } from "utils/auth";
import { ErrorContext } from "./ErrorHandler";
import strings from "../../localization/strings";
import { login, selectKeycloak } from "features/auth-slice";

/**
 * Component for keeping access token fresh
 *
 * @param props component properties
 */
const AccessTokenRefresh: React.FC = ({ children }) => {
  const context = React.useContext(ErrorContext);
  const keycloak = useAppSelector(selectKeycloak);
  const dispatch = useAppDispatch();

  React.useEffect(() => {
    AuthUtils.initAuth()
      .then(keycloak => keycloak && dispatch(login(keycloak)))
      .catch(error => context.setError(strings.errorManagement.auth.init, error));
    // eslint-disable-next-line
  }, []);

  useInterval(() => {
    keycloak && AuthUtils.refreshAccessToken(keycloak)
      .then(keycloak => keycloak && dispatch(login(keycloak)))
      .catch(error => context.setError(strings.errorManagement.auth.refresh, error));
  }, 1000 * 60);

  /**
   * Component render
   */
  return keycloak ? <>{ children }</> : null;
}

export default AccessTokenRefresh;