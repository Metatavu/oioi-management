import { createStyles } from "@material-ui/core";
import theme from "../theme";

export default createStyles({

  icon: {
    minWidth: 0,
    marginRight: theme.spacing(1)
  },

  lockContainer: {
    width: 18,
    height: 18,
    marginLeft: theme.spacing(4),
    "& svg": {
      width: "100%",
      height: "100%"
    }
  }

});