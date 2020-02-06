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
        <Route
          path="/"
          exact={false}
          render={ ({ history }) => (
            <BreadCrumb history={history} />
          )}
        />
        <Header></Header>
        <div>
          <Route
            path="/"
            exact={true}
            render={ ({ history }) => (
              <CustomersList history={history} />
            )}
          />
          <Route
            path="/:customerId/devices"
            exact={true}
            render={ ({ match, history }) => (
              <DevicesList customerId={match.params.customerId} history={history}/>
            )}
          />
          <Route
            path="/:customerId/devices/:deviceId/applications"
            exact={true}
            render={ ({ match, history }) => (
              <ApplicationsList 
                customerId={match.params.customerId} 
                deviceId={match.params.deviceId}
                history={history}/>
            )}
          />
          <Route
            path="/:customerId/devices/:deviceId/applications/:applicationId"
            exact={true}
            render={ ({ match,history }) => (
              <ApplicationEditor 
              customerId={match.params.customerId} 
              deviceId={match.params.deviceId}
              applicationId={match.params.applicationId}
              history={history} />
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