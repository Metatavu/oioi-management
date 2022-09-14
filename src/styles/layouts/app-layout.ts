import { makeStyles } from "@material-ui/core";
import theme from "../theme";

export const useEditorLayoutStyles = makeStyles({

  root: {
    backgroundColor: theme.palette.background.default,
    height: "100vh",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden"
  },

  content: {
    height: "100%",
    maxHeight: "100%"
  }

}, {
  name: "editor-layout"
});