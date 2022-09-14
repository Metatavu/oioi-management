import { createStyles } from "@material-ui/core";
import theme from "styles/theme";

export default createStyles({

  content: {
    "& > :not(:first-child)": {
      marginTop: theme.spacing(2)
    }
  }

});