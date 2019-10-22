import * as React from "react";
import { Container, Typography, Grid, Card, CardMedia, withStyles, WithStyles, CardContent, CardActions, CardActionArea, Button } from "@material-ui/core";
import img from "../../resources/images/macmini.png";
import AddIcon from "@material-ui/icons/AddCircle";
import styles from "../../styles/card-styles";
import { History } from "history";

interface Props extends WithStyles<typeof styles> {
  history: History
}

interface State {

}

class DevicesList extends React.Component<Props, State> {

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
        <Typography className={classes.heading} variant="h1">{"customer_name"} devices</Typography>
        <Grid container spacing={5} direction="row">
          {
            this.renderCards()
          }
          {
            this.renderAdd()
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
        <CardActionArea onClick={this.onEditDeviceClick}>
          <CardMedia className={classes.media} image={img}></CardMedia>
          <CardContent>
            <Typography gutterBottom variant="h3" component="h2">
              Mac mini
            </Typography>
          </CardContent>
        </CardActionArea>
        <CardActions className={classes.cardActions}>
          <Button size="small" className={classes.edit} onClick={this.onEditDeviceClick}>
            Edit
          </Button>
          <Button size="small" className={classes.delete} onClick={this.onDeleteDeviceClick}>
            Delete
          </Button>
        </CardActions>
      </Card>
    </Grid>
    );
  }

  /**
   * Add device render method
   */
  private renderAdd() {
    const { classes } = this.props;
    return (
    <Grid item>
      <Card elevation={0} className={classes.addCard}>
        <CardActionArea className={classes.add} onClick={this.onAddDeviceClick}>
          <AddIcon className={classes.addIcon} />
        </CardActionArea>
      </Card>
    </Grid>
    );
  }

  /**
   * Edit device method
   */
  private onEditDeviceClick = () => {
    this.props.history.push("/applications");
  }
  /**
   * Delete device method
   */
  private onDeleteDeviceClick = () => {
    alert("Delete device!");
  }
  /**
   * Add device method
   */
  private onAddDeviceClick = () => {
    alert("Add device!");
  }
}

export default withStyles(styles)(DevicesList);