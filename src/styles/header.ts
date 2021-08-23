import { createStyles } from "@material-ui/core";
import theme from "./theme";

export default createStyles({

  header: {
    gridArea: "header",
    height: 64,
    justifyContent: "center"
  },

  logoContainer: {
    display: "flex",
    flexGrow: 1
  },

  logo: {
    width: 64,
    height: 64
  },

  signOutBtn: {
    width: 50,
    height: 50
  },

  languageSelect: {
    marginLeft: theme.spacing(4),
    marginRight: theme.spacing(4),
    color: "#fff",

    [theme.breakpoints.down("sm")]: {
      "& .MuiSelect-icon": {
        color: "#fff"
      }
    },
    [theme.breakpoints.up("md")]: {
      color: theme.palette.text.primary,
      marginLeft: theme.spacing(6),
      marginRight: theme.spacing(4),
    },
    "&:before": {
      display: "none"
    },
    "& .MuiSelect-select": {
      textTransform: "uppercase"
    }
  },
});