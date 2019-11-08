import { createStyles } from "@material-ui/core";
import theme from "../styles/theme";

export default createStyles({
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
  }
});