import { withStyles } from "@material-ui/core";
import { MTableToolbar } from "material-table";
import theme from "../theme";

const StyledMTableToolbar = withStyles({
  root: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    borderBottom: "1px solid rgba(0,0,0,0.1)"
  },
})(MTableToolbar);

export default StyledMTableToolbar;