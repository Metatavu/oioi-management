import * as React from "react";
import { AuthState } from "../../types";
import { ReduxState } from "../../store";
import { connect } from "react-redux";

/**
 * Component props
 */
interface Props {
  /**
   * Auth
   */
  auth: AuthState;
  /**
   * Role name
   */
  role: string;
  children?: React.ReactNode;
}

/**
 * Shows content only if user has specified role
 *
 * @param props component properties
 */
const VisibleWithRole: React.FC<Props> = ({ auth, role, children }) => {
  return auth && auth.hasRealmRole(role) ?
    <>{ children }</> :
    null;
}

/**
 * Maps redux state to props
 *
 * @param state redux state
 */
const mapStateToProps = (state: ReduxState) => ({
  auth: state.auth
});

export default connect(mapStateToProps)(VisibleWithRole);
