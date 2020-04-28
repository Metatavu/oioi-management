import React from "react";
import { BrowserRouter, Route } from "react-router-dom";
import IndexPage from "./components/pages/IndexPage";
import { ThemeProvider } from "@material-ui/styles";
import { CssBaseline } from "@material-ui/core";
import { Provider as ReduxProvider } from "react-redux";
import "./styles/styles.scss";
import "../node_modules/noty/lib/noty.css";
import "../node_modules/noty/lib/themes/mint.css";
import theme from "./styles/theme";
import { createStore } from "redux";
import { ReduxState, ReduxActions, rootReducer } from "./store";
import strings from "./localization/strings";

const store = createStore<ReduxState, ReduxActions, any, any>(
  rootReducer,
  {
    auth: null
  }
);

const App: React.FC = () => {
  strings.setLanguage("fi");
  return (
    <ReduxProvider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <div className="App">
            <Route path="/" component={IndexPage} />
          </div>
        </BrowserRouter>
      </ThemeProvider>
    </ReduxProvider>
  );
};

export default App;
