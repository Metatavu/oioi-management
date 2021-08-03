import React from "react";
import { BrowserRouter, Route } from "react-router-dom";
import IndexPage from "./components/pages/IndexPage";
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
              <Route path="/" component={ IndexPage }/>
            </div>
          </BrowserRouter>
        </AccessTokenRefresh>
      </ThemeProvider>
    </ReduxProvider>
  );
};

export default App;
