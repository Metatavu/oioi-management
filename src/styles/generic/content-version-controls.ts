import { createStyles } from "@material-ui/core";
import theme from "styles/theme";

export default createStyles({

  root: {
    display: "flex",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    "& :not(:first-child)": {
      marginLeft: theme.spacing(2)
    }
  },

  contentVersionSelect: {
    marginLeft: theme.spacing(1),
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: "pointer"
  },

  activeVersion: {
    display: "flex",
    alignItems: "center",
    opacity: 0.5,
    "& :not(:first-child)": {
      marginLeft: theme.spacing(1)
    }
  },

  deleteButton: {
    backgroundColor: "#e85874",
    marginRight: 208
  }

});