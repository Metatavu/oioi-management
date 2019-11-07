import { createStyles } from "@material-ui/core";

export default createStyles({
  header: {
    gridArea: "header",
    height: 64,
    justifyContent: "center"
  },
  logoContainer: {
    display: "flex",
    flexGrow: 1
  },
  logo: {
    width: 64,
    height: 64
  },
  signOutBtn: {
    width: 50,
    height: 50
  }
});