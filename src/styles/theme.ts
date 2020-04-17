import { createMuiTheme, responsiveFontSizes } from "@material-ui/core";
import { blueGrey, grey, red } from "@material-ui/core/colors";

let theme = createMuiTheme();
theme = responsiveFontSizes(theme);

export default createMuiTheme({
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
    fontFamily: "TTNorms-Regular",
    h1: {
      fontFamily: "TTNorms-Black",
      fontSize: 55,
      fontWeight: "normal",
      textTransform: "uppercase"
    },
    h2: {
      fontFamily: "TTNorms-Black",
      fontSize: 34,
      fontWeight: "normal",
    },
    h3: {
      fontFamily: "TTNorms-Black",
      fontSize: 21,
      fontWeight: "normal",
    },
    h4: {
      fontFamily: "TTNorms-Bold",
      fontSize: 18,
      fontWeight: "normal",
    },
    h5: {
      fontFamily: "TTNorms-Bold",
      fontSize: 16,
      fontWeight: "normal",
    },
    h6: {
      fontFamily: "TTNorms-Bold",
      fontSize: 14,
      fontWeight: "normal",
    },
    body1: {
      fontSize: 16,
      fontWeight: "normal",
    },
    body2: {
      fontSize: 12,
      fontWeight: "normal",
    },
    subtitle1: {
      fontFamily: "TTNorms-Black",
    },
    subtitle2: {
      fontFamily: "TTNorms-Black",
    }
  },
  overrides: {
    MuiInputBase: {
      root: {
        backgroundColor: "#fff",
        minWidth: "100%",
        [theme.breakpoints.up("sm")]: {
          minWidth: 340
        },
      }
    }
  }
});