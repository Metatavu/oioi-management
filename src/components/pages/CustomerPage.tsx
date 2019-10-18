import * as React from "react";
import { Container, Typography, Grid, Card, CardMedia, withStyles, createStyles, WithStyles, CardContent, CardActions, CardActionArea, Button } from "@material-ui/core";
import img from "../../resources/images/geopark.png";
import AddIcon from "@material-ui/icons/AddCircle";

interface Props extends WithStyles<typeof styles> {

}

interface State {

}

const styles = createStyles({
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

class CustomerPage extends React.Component<Props, State> {

  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {

    };
  }

  /**
   * Component render method
   */
  public render() {
    const { classes } = this.props;
    // const cars = this.state.cars.map((car) => renderCar(car))
    return (
      <Container className="page-content">
        <Typography className={classes.heading} variant="h1">Customers</Typography>
        <Grid container spacing={5} direction="row">
          {
            this.renderCards()
          }
          {
            this.renderAddCustomer()
          }
        </Grid>
      </Container>
    );
  }

  /**
   * Card render method
   */
  private renderCards() {
    const { classes } = this.props;
    return (
    <Grid item>
      <Card elevation={10} className={classes.card}>
        <CardActionArea>
          <CardMedia className={classes.media} image={img}></CardMedia>
          <CardContent>
            <Typography gutterBottom variant="h3" component="h2">
              Saimaa Geopark
            </Typography>
          </CardContent>
        </CardActionArea>
        <CardActions className={classes.cardActions}>
          <Button size="small" className={classes.edit}>
            Edit
          </Button>
          <Button size="small" className={classes.delete}>
            Delete
          </Button>
        </CardActions>
      </Card>
    </Grid>
    );
  }

  /**
   * Add customer render method
   */
  private renderAddCustomer() {
    const { classes } = this.props;
    return (
    <Grid item>
      <Card elevation={0} className={classes.addCard}>
        <CardActionArea className={classes.add}>
          <AddIcon className={classes.addIcon} />
        </CardActionArea>
      </Card>
    </Grid>
    );
  }
}

export default withStyles(styles)(CustomerPage);