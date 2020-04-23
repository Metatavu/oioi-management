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
    MuiButton: {
      root: {
        borderRadius: 0,
        fontFamily: "TTNorms-Black",
        padding: "6px 30px",
      },
      outlined: {
        padding: "4px 30px",
        border: "2px solid #263238",
        "&:hover": {
          border: "2px solid #263238",
        },
        "&.Mui-disabled": {
          opacity: 0.5,
          border: "2px solid #263238"
        }
      },
      outlinedSecondary: {
        padding: "4px 30px",
        border: "2px solid #263238",
        "&:hover": {
          border: "2px solid #263238",
        }
      },
      outlinedPrimary: {
        padding: "4px 30px",
        border: "2px solid #263238",
        "&:hover": {
          border: "2px solid #263238",
        }
      }
    },
    MuiInputBase: {
      root: {
        backgroundColor: "#fff",
        minWidth: "100%",
        [theme.breakpoints.up("sm")]: {
          minWidth: 340
        },
      }
    },
    MuiListItem: {
      root: {
        transition: "background-color 0.2s ease-out",
        "&:hover": {
          backgroundColor: "rgba(38, 50, 56, 0.1)",
        },
        "&.Mui-selected": {
          backgroundColor: "rgba(38, 50, 56, 0.1)",
          "& .MuiTypography-body1": {
            fontFamily: "TTNorms-Bold",
          },
          "& ~ .MuiListItemSecondaryAction-root": {
            opacity: 1
          },
          "&:hover": {
            backgroundColor: "rgba(38, 50, 56, 0.1)"
          }
        }
      },
      container: {
        display: "flex"
      }
    },
    MuiListItemIcon: {
      root: {
        color: "#263238"
      }
    },
    MuiListItemSecondaryAction: {
      root: {
        display: "flex",
        opacity: 0,
        transition: "opacity 0.2s ease-out"
      }
    }
  }
});