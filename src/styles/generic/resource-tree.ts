import { createStyles } from "@material-ui/core";
import theme from "../theme";

export default createStyles({

  treeWrapper: {
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

  treeAddItem: {
    cursor: "pointer"
  },

  addResourceText: {
    "& .MuiTypography-body1": {
      fontFamily: "TTNorms-Bold"
    }
  },

  icon: {
    minWidth: 0,
    marginRight: theme.spacing(1)
  }

});