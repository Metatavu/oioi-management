import * as React from "react";
import Header from "../generic/Header";
import BreadCrumb from "../generic/BreadCrumb";
import CustomersList from "./CustomersList";
import { Route } from "react-router";
import DevicesList from "./DevicesList";
import ApplicationsList from "./ApplicationsList";
import ApplicationEditor from "./ApplicationEditor";
import { AuthState } from "../../types";
import { ReduxState } from "../../store";
import { connect } from "react-redux";

/**
 * Component properties
 */
interface Props {
  auth: AuthState;
}

/**
 * Index page component
 *
 * @param props component properties
 */
const IndexPage: React.FC<Props> = ({ auth }) => {
  if (!auth) {
    return null;
  }

  /**
   * Component render
   */
  return (
    <div className="wrapper">
      <Route
        path="/"
        render={({ history }) => (
          <BreadCrumb
            level={
              window.location.pathname
                .split("/")
                .filter(val => !!val)
                .length
            }
            history={ history }
          />
        )}
      />
      <Header></Header>
      <>
        <Route
          path="/"
          exact
          render={({ history }) => (
            <CustomersList history={ history } />
          )}
        />
        <Route
          path="/:customerId/devices"
          exact
          render={({ match, history }) => (
            <DevicesList
              customerId={ match.params.customerId }
              history={ history }
            />
          )}
        />
        <Route
          path="/:customerId/devices/:deviceId/applications"
          exact
          render={({ match, history }) => (
            <ApplicationsList
              customerId={ match.params.customerId }
              deviceId={ match.params.deviceId }
              history={ history }/>
          )}
        />
        <Route
          path="/:customerId/devices/:deviceId/applications/:applicationId"
          exact
          render={({ match, history }) => (
            <ApplicationEditor
              customerId={ match.params.customerId }
              deviceId={ match.params.deviceId }
              applicationId={ match.params.applicationId }
              history={ history }
            />
          )}
        />
      </>
    </div>
  );
}

/**
 * Maps Redux state to component properties
 *
 * @param state Redux state
 */
const mapStateToProps = (state: ReduxState) => ({
  auth: state.auth
});

export default connect(mapStateToProps)(IndexPage);