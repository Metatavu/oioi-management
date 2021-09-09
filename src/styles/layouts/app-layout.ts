import { makeStyles } from "@material-ui/core";
import theme from "../theme";

export const useEditorLayoutStyles = makeStyles({

  root: {
    backgroundColor: theme.palette.background.default,
    height: "100vh",
    width: "100%",
    display: "flex",
    flexDirection: "column"
  },

  content: {
    flex: 1
  }

}, {
  name: "editor-layout"
});