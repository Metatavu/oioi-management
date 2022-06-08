import { createStyles } from "@material-ui/core";
import theme from "../theme";

export default createStyles({

  previewElement: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
    position: "relative",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },

  noFileContainer: {
    background: "#ddd",
    textAlign: "center",
    padding: theme.spacing(8)
  },

  fileContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center"
  }

});