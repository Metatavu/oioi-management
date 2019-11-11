import { createStyles } from "@material-ui/core";

export default createStyles({
  heading: {
    marginBottom: 50,
  },
  card: {
    width: 320,
  },
  addCard: {
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
  add: {
    height: 185,
    width: 320,
    display: "flex",
    justifyItems: "center",
    alignItems: "center"
  },
  addIcon: {
    height: 140,
    width: 140,
  },
  cardActions: {
    backgroundColor: "#263338",
    justifyContent: "space-between"
  },
  media: {
    height: 140,
  },
  edit: {
    color: "#fff",
    fontWeight: "bold"
  },
  details: {
    color: "#fff",
    fontWeight: "bold"
  },
  delete: {
    color: "#ddd",
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    position: "absolute",
    display: "flex",
    color: "#fff",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center"
  },
  actionArea: {
    position: "relative"
  }
});