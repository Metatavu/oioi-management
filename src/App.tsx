import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { ThemeProvider } from "@material-ui/styles";
import { CssBaseline } from "@material-ui/core";
import { Provider as ReduxProvider } from "react-redux";
import "../node_modules/noty/lib/noty.css";
import "../node_modules/noty/lib/themes/mint.css";
import theme from "./styles/theme";
import { createStore } from "redux";
import { ReduxState, ReduxActions, rootReducer } from "./store";
import strings from "./localization/strings";
import AccessTokenRefresh from "./components/containers/access-token-refresh";
import AppLayout from "./components/layouts/app-layout";
import ApplicationEditor from "./components/pages/ApplicationEditor";
import DevicesList from "./components/pages/DevicesList";
import CustomersList from "./components/pages/CustomersList";
import ApplicationsList from "./components/pages/ApplicationsList";

/**
 * Redux store
 */
const store = createStore<ReduxState, ReduxActions, any, any>(rootReducer);

/**
 * Application component
 */
const App: React.FC = () => {
  strings.setLanguage("fi");

  /**
   * Component render
   */
  return (
    <ReduxProvider store={ store }>
      <ThemeProvider theme={ theme }>
        <CssBaseline />
        <AccessTokenRefresh>
          <BrowserRouter>
            <div className="App">
              <Switch>
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
              </Switch>
            </div>
          </BrowserRouter>
        </AccessTokenRefresh>
      </ThemeProvider>
    </ReduxProvider>
  );
};

export default App;
