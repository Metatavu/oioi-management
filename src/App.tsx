import React from "react";
import { BrowserRouter, Route } from "react-router-dom";
import IndexPage from "./components/pages/IndexPage";
import { ThemeProvider } from "@material-ui/styles";
import { createMuiTheme, CssBaseline } from "@material-ui/core";
import { grey, blueGrey, red } from "@material-ui/core/colors";
import "./styles/styles.scss";

/**
 * Application theme
 */
const theme = createMuiTheme({
  palette: {
    primary: { main: blueGrey[900] },
    secondary: { main: grey[900] },
    background: {
      default: blueGrey[200],
      paper: blueGrey[50]
    },
    action: {
      active: blueGrey[50],
      hoverOpacity: 0.1,
      selected: blueGrey[900],
      disabled: blueGrey[900]
    },
    error: red,
  },
  typography: {
    fontFamily: "Montserrat",
    h1: {
      fontSize: 55,
      fontWeight: 900,
      textTransform: "uppercase"
    },
    h2: {
      fontSize: 34,
      fontWeight: 500
    },
    h3: {
      fontSize: 21,
      fontWeight: 500
    },
    body1: {
      fontSize: 13,
      fontWeight: 300
    },
    body2: {
      fontSize: 8,
      fontWeight: 300
    }
  }
});

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
