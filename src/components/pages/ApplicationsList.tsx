import * as React from "react";
import { Container, Typography, Grid, Card, CardMedia, withStyles, WithStyles, CardContent, CardActions, CardActionArea, Button } from "@material-ui/core";
import img from "../../resources/images/infowall.png";
import AddIcon from "@material-ui/icons/AddCircle";
import styles from "../../styles/card-styles";
import { History } from "history";

interface Props extends WithStyles<typeof styles> {
  history: History
}

interface State {

}

class ApplicationsList extends React.Component<Props, State> {

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
    return (
      <Container className="page-content">
        <Typography className={classes.heading} variant="h1">{"customer_name"} {"device_name"} Applications</Typography>
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
        <CardActionArea onClick={this.onEditApplicationClick}>
          <CardMedia className={classes.media} image={img}></CardMedia>
          <CardContent>
            <Typography gutterBottom variant="h3" component="h2">
              Info Wall
            </Typography>
          </CardContent>
        </CardActionArea>
        <CardActions className={classes.cardActions}>
          <Button size="small" className={classes.edit} onClick={this.onEditApplicationClick}>
            Edit
          </Button>
          <Button size="small" className={classes.delete} onClick={this.onDeleteApplicationClick}>
            Delete
          </Button>
        </CardActions>
      </Card>
    </Grid>
    );
  }

  /**
   * Add application render method
   */
  private renderAdd() {
    const { classes } = this.props;
    return (
    <Grid item>
      <Card elevation={0} className={classes.addCard}>
        <CardActionArea className={classes.add} onClick={this.onAddApplicationClick}>
          <AddIcon className={classes.addIcon} />
        </CardActionArea>
      </Card>
    </Grid>
    );
  }

  private onEditApplicationClick = () => {
    this.props.history.push("/application-editor");
  }
  private onDeleteApplicationClick = () => {
    alert("Delete application");
  }
  private onAddApplicationClick = () => {
    this.props.history.push("/application-editor");
  }
}

export default withStyles(styles)(ApplicationsList);