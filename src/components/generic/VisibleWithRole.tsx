import * as React from "react";
import { AuthState } from "../../types";
import { Dispatch } from "redux";
import { ReduxActions, ReduxState } from "../../store";
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
 * Component state
 */
interface State { }

/**
 * Shows content only if user has specified role
 */
class VisibleWithRole extends React.Component<Props, State> {
  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
    };
  }

  /**
   * Component render method
   */
  public render() {
    const { auth, role } = this.props;
    if (auth && auth.hasRealmRole(role)) {
      return this.props.children;
    }

    return null;
  }
}

/**
 * Maps redux state to props
 *
 * @param state redux state
 */
const mapStateToProps = (state: ReduxState) => ({
  auth: state.auth
});

/**
 * Function for declaring dispatch functions
 *
 * @param dispatch
 */
const mapDispatchToProps = (dispatch: Dispatch<ReduxActions>) => {
  return { };
};

export default connect(mapStateToProps, mapDispatchToProps)(VisibleWithRole);
