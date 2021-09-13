import { createStyles } from "@material-ui/core";
import theme from "./theme";
import { alpha } from "@material-ui/core/styles";

export default createStyles({

  iconContainer: {
    marginRight: 5,
    "& .close": {
      opacity: 0.3
    },
  },

  group: {
    marginLeft: 12,
    paddingLeft: 12,
    borderLeft: `1px dashed ${alpha(theme.palette.text.primary, 0.4)}`
  }

});