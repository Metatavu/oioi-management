import * as React from "react";

import { useInterval } from "../../app/hooks";
import { login } from "../../actions/auth";
import { AuthUtils } from "../../utils/auth";
import { AuthState } from "../../types";
import { ReduxActions, ReduxState } from "../../store";
import { Dispatch } from "redux";
import { KeycloakInstance } from "keycloak-js";
import { connect } from "react-redux";
import { ErrorContext } from "./ErrorHandler";
import strings from "../../localization/strings";

/**
 * Component properties
 */
interface Props {
  auth?: AuthState;
  onLogin: typeof login;
}

/**
 * Component for keeping access token fresh
 *
 * @param props component properties
 */
const AccessTokenRefresh: React.FC<Props> = ({ children, auth, onLogin }) => {

  const context = React.useContext(ErrorContext);

  React.useEffect(() => {
    AuthUtils.initAuth()
      .then(auth => auth && onLogin(auth))
      .catch(error => context.setError(strings.errorManagement.auth.init, error));
    // eslint-disable-next-line
  }, []);

  useInterval(() => {
    auth && AuthUtils.refreshAccessToken(auth)
      .then(onLogin)
      .catch(error => context.setError(strings.errorManagement.auth.refresh, error));
  }, 1000 * 60);

  /**
   * Component render
   */
  return auth ? <>{ children }</> : null;
}

/**
 * Maps Redux state to component properties
 *
 * @param state Redux state
 */
const mapStateToProps = (state: ReduxState) => ({
  auth: state.auth
});

/**
 * Maps Redux dispatch to component properties
 *
 * @param dispatch Redux dispatch
 */
const mapDispatchToProps = (dispatch: Dispatch<ReduxActions>) => ({
  onLogin: (keycloak: KeycloakInstance) => dispatch(login(keycloak))
});

export default connect(mapStateToProps, mapDispatchToProps)(AccessTokenRefresh);