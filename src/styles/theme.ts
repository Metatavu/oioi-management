import { createMuiTheme, responsiveFontSizes } from "@material-ui/core";
import { blueGrey, grey } from "@material-ui/core/colors";

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
    error: {
      main: "#d41b3f"
    },
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
    MuiCssBaseline: {
      "@global": {
        "body": {
          margin: 0
        },
        ".wrapper": {
          overflow: "hidden",
          height: "100vh",
          display: "grid",
          gridTemplateRows: "auto auto 1fr",
          gridTemplateAreas: `
            "header"
            "breadcrumb"
            "content"
          `
        },
        ".content": {
          gridArea: "content"
        },
        ".page-content": {
          overflow: "hidden",
          maxHeight: "100%",
          height: "100%",
          paddingBottom: 50,
          paddingTop: 50,
          "@media screen and (max-width: 600px)": {
            paddingTop: 25
          }
        },
        ".card-list": {
          overflowY: "auto",
          maxHeight: "calc(100% - 50px)",
          marginBottom: 0
        },
        "::-webkit-scrollbar": {
          width: 10
        },
        "::-webkit-scrollbar-track": {
          background: "rgba(0,0,0,0)"
        },
        "::-webkit-scrollbar-thumb": {
          background: "#888",
          borderRadius: 10
        },
        "::-webkit-scrollbar-thumb:hover": {
          background: "#555"
        },
        ".Toastify__toast-theme--dark": {
          backgroundColor: grey[900]
        }
      }
    },
    MuiButton: {
      root: {
        borderRadius: 0,
        fontFamily: "TTNorms-Black",
        padding: "6px 30px",
        "&.Mui-disabled": {
          opacity: 0.5
        }
      },
      outlined: {
        padding: "4px 30px",
        border: "2px solid #263238",
        "&:hover": {
          border: "2px solid #263238",
        },
        "&.Mui-disabled": {
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
    },
    MuiTableBody: {
      root: {
        backgroundColor: "#fff"
      }
    },
    MuiTableCell: {
      head: {
        fontFamily: "TTNorms-Bold",
      }
    }
  }
});