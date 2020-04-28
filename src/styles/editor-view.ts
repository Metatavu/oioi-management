import { createStyles } from "@material-ui/core";
import theme from "../styles/theme";
import { fade } from "@material-ui/core/styles";

export default createStyles({

  root: {
    position: "relative",
    display: "grid",
    gridTemplateColumns: "auto 1fr",
    gridTemplateRows: "auto auto 1fr",
    gridTemplateAreas: '"drawer appbar" "drawer content" "drawer content"',
    borderTop: "1px solid #ddd",
    height: "100%",
    overflowY: "auto",
  },

  drawer: {
    gridArea: "drawer",
    position: "relative",
    [theme.breakpoints.up("sm")]: {
      flexShrink: 0
    }
  },

  appBar: {
    height: 55,
    backgroundColor: "#F6F6F6",
    color: "#000",
    gridArea: "appbar",
    borderBottomWidth: 0.5,
    borderBottom: "1px solid rgba(0, 0, 0, 0.2)"
  },

  toolbar: {
    height: 55,
    display: "flex",
    alignItems: "center",
    padding: "0 16px",
    boxShadow: "0 0 30px rgba(0,0,0,0.2)",
    justifyContent: "space-between"
  },

  menuButton: {
    marginRight: theme.spacing(2),
    [theme.breakpoints.up("sm")]: {
      display: "none"
    }
  },

  dragger: {
    width: '9px',
    cursor: 'ew-resize',
    padding: '4px 0 0',
    position: 'absolute',
    top: 0,
    bottom: 0,
    zIndex: 100,
  },

  drawerPaper: {
    backgroundColor: "#fff",
    position: "absolute",
    height: "100%"
  },
  content: {
    gridArea: "content",
    padding: theme.spacing(3),
    background: "#F6F6F6",
    overflowY: "auto"
  },

  treeWrapper: {
    height: "100%",
    padding: theme.spacing(2),
    overflowY: "auto",
    "& > div div:focus": {
      outline: "none"
    }
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
      opacity: 0.3
    }
  },

  treeGroup: {
    marginLeft: 12,
    paddingLeft: 12,
    borderLeft: `1px dashed ${fade(theme.palette.text.primary, 0.4)}`
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
  },

  table: {
    width: "100%"
  },

  addResourceBtnText: {
    "& .MuiTypography-body1": {
      fontFamily: "TTNorms-Bold"
    }
  },

  treeAddItem: {
    cursor: "pointer"
  },

  gridRow: {
    maxWidth: "100%",
    overflowX: "auto",
    display: "grid",
    gridAutoFlow: "column",
    alignItems: "center",
    gridAutoColumns: "max-content",
    gridGap: theme.spacing(3)
  },

  imagePreviewElement: {
    position: "relative",
    maxWidth: "min-content",
    display: "flex",
    flexDirection: "column"
  },

  imagePreviewFullscreenContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    "& img": {
      maxHeight: "100%",
      maxWidth: "100%",
      paddingTop: "5%",
      paddingBottom: "2%"
    }
  },

  imagePreview: {
    backgroundColor: "rgba(38, 50, 56, 0.1)"
  },

  noMediaContainer: {
    background: "#ddd",
    fontSize: "30px",
    textAlign: "center",
    padding: "2px",
    fontFamily: "TTNorms-Black",
    color: "#fff"
  },

  deleteImage: {
    position: "absolute",
    top: 5,
    right: 5
  },

  iconButton: {
    backgroundColor: "rgba(38, 50, 56, 0.9)",
    color: "#fff",
    transition: "background-color 0.2s ease-out",
    "&:hover": {
      backgroundColor: "rgba(38, 50, 56, 1)",
    }
  },

  saveButton: {
    position: "absolute",
    top: 9,
    right: 150,
    zIndex: 1200
  },

  deleteButton: {
    backgroundColor: "#e85874"
  }
});
