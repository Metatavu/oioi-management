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
  },

  imageUploadLoaderContainer: {
    position: "absolute",
    backgroundColor: "rgba(0,0,0,0.2)",
    display: "flex",
    height: "100%",
    width: "100%",
    alignItems: "center",
    justifyContent: "center"
  },

  flexContainer: {
    display: "flex",
    alignItems: "center",
    height: 20
  },

  linearProgress: {
    flex: 1,
    marginRight: 8
  },

  imagePreview: {
    display: "flex",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.1)",
    borderRadius: theme.shape.borderRadius,
    marginLeft: theme.spacing(2)
  }
});