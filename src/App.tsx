import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { ThemeProvider } from "@material-ui/styles";
import { CssBaseline, responsiveFontSizes } from "@material-ui/core";
import { Provider as ReduxProvider } from "react-redux";
import theme from "./styles/theme";
import strings from "./localization/strings";
import AccessTokenRefresh from "./components/containers/AccessTokenRefresh";
import ApplicationEditor from "./components/pages/ApplicationEditor";
import DevicesList from "./components/pages/DevicesList";
import CustomersList from "./components/pages/CustomersList";
import ApplicationsList from "./components/pages/ApplicationsList";
import ErrorHandler from "./components/containers/ErrorHandler";
import moment from "moment";
import "moment/locale/fi";
import "moment/locale/en-gb";
import { Slide, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { blueGrey } from "@material-ui/core/colors";
import CheckmarkIcon from "@material-ui/icons/Check";
import { store } from "app/store";

/**
 * Interface representing component properties
 */
interface Props {
}

/**
 * Interface representing component state
 */
interface State {
}

/**
 * Application component
 */
class App extends React.Component<Props, State> {

  /**
   * Component did mount life cycle component
   */
  public componentDidMount = () => {
    moment.locale(strings.getLanguage());
  }

  /**
   * Component render method
   */
  public render = () => {

    return (
      <ReduxProvider store={ store }>
        <ThemeProvider theme={ responsiveFontSizes(theme) }>
          <CssBaseline/>
          <ToastContainer
            autoClose={ 3000 }
            closeOnClick
            hideProgressBar
            position="top-center"
            theme="dark"
            toastStyle={{
              backgroundColor: blueGrey[700],
              fontFamily: "TTNorms-light",
              fontSize: 16,
            }}
            icon={ <CheckmarkIcon htmlColor="#00B4D8"/> }
            draggable={ false }
            transition={ Slide }
            closeButton={ false }
          />
          <ErrorHandler>
            <AccessTokenRefresh>
              <BrowserRouter>
                <div className="App">
                  <Switch>
                    <Route
                      path="/"
                      exact
                      render={({ history }) => (
                        <CustomersList history={ history }/>
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
          </ErrorHandler>
        </ThemeProvider>
      </ReduxProvider>
    );
  }
};

export default App;
