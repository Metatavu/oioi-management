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
    minWidth: 50,
    padding: 0,
    marginLeft: theme.spacing(4),
    marginRight: theme.spacing(4),
    color: "#fff",
    backgroundColor: "transparent",
    "&:before": {
      display: "none"
    },
    "& .MuiSelect-select": {
      textTransform: "uppercase"
    },
    "&.MuiInputBase-root": {
      minWidth: 50,
      padding: 0
    }
  },
});