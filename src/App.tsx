import React from "react";
import { BrowserRouter, Route } from "react-router-dom";
import IndexPage from "./components/pages/IndexPage";
import { ThemeProvider } from "@material-ui/styles";
import { CssBaseline } from "@material-ui/core";
import "./styles/styles.scss";
import theme from "./styles/theme";

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <div className="App">
          <Route path="/" component={IndexPage} />
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
