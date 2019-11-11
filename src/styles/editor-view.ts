import { createStyles } from "@material-ui/core";
import theme from "../styles/theme";
import { fade } from "@material-ui/core/styles";

const drawerWidth = 240;

export default createStyles({
  root: {
    display: "grid",
    gridTemplateColumns: "auto 1fr",
    gridTemplateRows: "auto auto 1fr",
    gridTemplateAreas: "\"drawer appbar\" \"drawer content\" \"drawer content\"",
    boxShadow: "0 0 20px rgba(0, 0, 0, 0.2)",
    height: "100%"
  },
  drawer: {
    gridArea: "drawer",
    position: "relative",
    [theme.breakpoints.up("sm")]: {
      width: drawerWidth,
      flexShrink: 0,
    },
  },
  appBar: {
    height: 65,
    backgroundColor: "#F6F6F6",
    color: "#000",
    gridArea: "appbar",
    borderBottomWidth: 0.5,
    borderBottom: "1px solid rgba(0, 0, 0, 0.2)",
  },
  menuButton: {
    marginRight: theme.spacing(2),
    [theme.breakpoints.up("sm")]: {
      display: "none",
    },
  },
  toolbar: theme.mixins.toolbar,
  drawerPaper: {
    backgroundColor: "#fff",
    position: "absolute",
    width: drawerWidth,
    height: "100%",
  },
  content: {
    gridArea: "content",
    flexGrow: 1,
    padding: theme.spacing(3),
    background: "#F6F6F6"
  },
  treeRoot: {
    margin: 10
  },
  treeContent: {
    minHeight: 30
  },
  treeIconContainer: {
    marginRight: 5,
    "& .close": {
      opacity: 0.3,
    },
  },
  treeGroup: {
    marginLeft: 12,
    paddingLeft: 12,
    borderLeft: `1px dashed ${fade(theme.palette.text.primary, 0.4)}`,
  },
  treeLabel: {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis"
  },
  dropzone: {
    padding: 30,
    minHeight: 200,
    borderWidth: 1,
    borderRadius: theme.shape.borderRadius,
    borderColor: "rgba(0, 0, 0, 0.8)",
    transition: "border-color 0.2s ease-out",
     "& .MuiGrid-container": {
       justifyContent: "center"
     }
  },
  dropzoneText: {
    color: "rgba(0, 0, 0, 0.5)",
    fontSize: theme.typography.subtitle1.fontSize
  },
  fullWidth: {
    width: "100%"
  },
  languageInputContainer: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
    display: "flex",
    alignItems: "center"
  }
});