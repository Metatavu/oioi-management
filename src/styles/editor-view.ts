import { createStyles } from "@material-ui/core";
import theme from "../styles/theme";
import { alpha } from "@material-ui/core/styles";

export default createStyles({

  root: {
    position: "relative",
    display: "grid",
    gridTemplateColumns: "auto 1fr",
    gridTemplateRows: "auto 1fr",
    gridTemplateAreas: `
      "drawer appbar"
      "drawer content"
    `,
    borderTop: "1px solid #ddd",
    height: "calc(100vh - 114px)",
    overflowY: "auto",
  },

  treeLoaderContainer: {
    top: 54,
    left: 0,
    right: 0,
    paddingTop: theme.spacing(4),
    position: "absolute",
    display:"flex",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    background: "#fff"
  },

  loaderContainer: {
    top: 0,
    left: 300,
    right: 0,
    bottom: 0,
    position: "absolute",
    display:"flex",
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
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
    justifyContent: "space-between"
  },

  menuButton: {
    marginRight: theme.spacing(2),
    [theme.breakpoints.up("sm")]: {
      display: "none"
    }
  },

  dragger: {
    width: 9,
    cursor: "ew-resize",
    padding: "4px 0 0",
    position: "absolute",
    top: 0,
    bottom: 0,
    zIndex: 100,
    transition: "background-color 0.5s ease-out",
    "&:hover": {
      backgroundColor: "rgba(0,0,0,0.2)"
    },
    "&:active": {
      backgroundColor: "#00b4d8"
    }
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
    },
    "& .rstcustom__rowContents": {
      cursor: "pointer"
    },
    "& .rstcustom__collapseButton::after, .rstcustom__expandButton::after": {
      transformOrigin: "3px 3px",
      border: "solid transparent 6px",
      borderLeftWidth: 5,
      borderRightWidth: 5,
      borderTopColor: "#00b4d8",
      transition: "transform 0.2s ease-out"
    },
    "& .rstcustom__expandButton::after": {
      transform: "translate3d(-50%, 0%, 0) rotateZ(-90deg)",
      borderTopColor: "#263238"
    },
    "& .MuiListItem-root": {
      paddingTop: 0,
      paddingBottom: 0,
      "&.MuiListItem-gutters": {
        paddingLeft: 4
      }
    },
    "& .rstcustom__rowWrapper:hover": {
      opacity: 1
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
    borderLeft: `1px dashed ${alpha(theme.palette.text.primary, 0.4)}`
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
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gridGap: theme.spacing(2)
  },

  gridItem: {
    maxWidth: 200,
    alignItems: "center",
    display: "flex",
    flexDirection: "column"
  },

  newItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    width: 200,
    minHeight: 200
  },

  imagePreviewElement: {
    cursor: "pointer",
    position: "relative"
  },

  iconGridRow: {
    maxWidth: "100%",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
    gridGap: theme.spacing(2)
  },

  iconGridItem: {
    maxWidth: 120,
    alignItems: "center",
    display: "flex",
    flexDirection: "column"
  },

  iconTypeText: {
    fontSize: 11,
    fontWeight: "bold",
    color: theme.palette.text.secondary
  },

  iconPreviewElement: {
    cursor: "pointer",
    position: "relative",
    width: 120
  },

  iconWrapper: {
    borderRadius: 3,
    display: "flex",
    backgroundColor: "rgba(38, 50, 56, 0.1)",
    padding: theme.spacing(1)
  },

  videoPreviewElement: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start"
  },

  audioPreviewElement: {
    display: "flex",
    flexDirection: "column"
  },

  audioPreview: {
    marginLeft: theme.spacing(1),
    marginTop: theme.spacing(2),
    display: "flex",
    flexDirection: "row",
    alignItems: "center"
  },

  imagePreviewFullscreenContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.9)",
    "& img": {
      maxHeight: "100%",
      maxWidth: "100%",
      padding: theme.spacing( 5 )
    }
  },

  imagePreview: {
    display: "flex",
    backgroundColor: "rgba(38, 50, 56, 0.1)",
    objectFit: "cover",
    maxWidth: "100%"
  },

  iconPreview: {
    objectFit: "cover",
    width: "100%",
    maxWidth: "100%"
  },

  noMediaContainer: {
    background: "#ddd",
    textAlign: "center",
    padding: theme.spacing(8),
    width: 200
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
    right: theme.spacing(2),
    zIndex: 1200
  },

  deleteButton: {
    backgroundColor: "#e85874"
  },

  savingDialogRoot: {
    display: "flex",
    flexDirection: "column",
    backgroundColor: "rgba(255,255,255,0.9)",
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2000,
    alignItems: "center",
    justifyContent: "center"
  },

  advancedSettingRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },

  resourceRow: {
    position: "relative",
    display: "flex",
    alignItems: "flex-end",
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    "&:after": {
      content: "''",
      display: "block",
      border: "1px dashed rgba(0,0,0,0.2)",
      width: "calc(100% - 355px)",
      position: "absolute",
      bottom: theme.spacing(2),
      left: 220,
    },
    "& .MuiFormControl-root": {
      zIndex: 1
    }
  }

});
