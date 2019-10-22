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
    height: 244,
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
  delete: {
    color: "#ddd",
  },
});