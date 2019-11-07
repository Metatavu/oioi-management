import * as React from "react";
import Header from "../generic/Header";
import BreadCrumb from "../generic/BreadCrumb";
import CustomersList from "./CustomersList";
import { Route } from "react-router";
import DevicesList from "./DevicesList";
import ApplicationsList from "./ApplicationsList";
import ApplicationEditor from "./ApplicationEditor";
import { AuthState } from "../../types";
import { login } from "../../actions/auth";
import { ReduxState, ReduxActions } from "../../store";
import { Dispatch } from "redux";
import { KeycloakInstance } from "keycloak-js";
import { connect } from "react-redux";
import Keycloak from "keycloak-js";

interface Props {
  auth: AuthState
  login: typeof login
}

interface State {

}

class IndexPage extends React.Component<Props, State> {

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

  public componentDidMount = () => {
    const { auth, login } = this.props;
    if (!auth) {
      //TODO: move to env variables
      const keycloak = Keycloak({
        url: "https://oioi-auth.metatavu.io/auth",
        realm: "oioi",
        clientId: "management"
      });

      keycloak.init({onLoad: "login-required"}).success((authenticated) => {
        if (authenticated) {
          login(keycloak);
        } else {
          //TODO: display login error
        }
      }).error((e) => {
        //TODO: display login error
      });
    }
  }

  /**
   * Component render method
   */
  public render() {

    const { auth } = this.props;
    if (!auth) {
      return null;
    }

    return (
      <div className="wrapper">
        <Header></Header>
        <BreadCrumb></BreadCrumb>
        <div>
          <Route
            path="/"
            exact={true}
            render={ ({ history }) => (
              <CustomersList history= {history} />
            )}
          />
          <Route
            path="/devices"
            exact={true}
            render={ ({ history }) => (
              <DevicesList history= {history}/>
            )}
          />
          <Route
            path="/applications"
            exact={true}
            render={ ({ history }) => (
              <ApplicationsList history= {history}/>
            )}
          />
          <Route
            path="/application-editor"
            exact={true}
            render={ ({ history }) => (
              <ApplicationEditor history= {history} />
            )}
          />
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: ReduxState) => ({
  auth: state.auth
});

const mapDispatchToProps = (dispatch: Dispatch<ReduxActions>) => {
  return {
    login: (keycloak: KeycloakInstance) => dispatch(login(keycloak))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(IndexPage);