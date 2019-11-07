import * as React from "react";
import { Container, Typography, Grid, Card, withStyles, WithStyles, CardActionArea } from "@material-ui/core";
import img from "../../resources/images/infowall.png";
import AddIcon from "@material-ui/icons/AddCircle";
import styles from "../../styles/card-item";
import { History } from "history";
import CardItem from "../generic/CardItem";

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
      <Container maxWidth="xl" className="page-content">
        <Typography className={classes.heading} variant="h1">{"Saimaa Geopark"} - {"Mac mini"} - Applications</Typography>
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
    return (
    <Grid item>
      <CardItem
        title="Info Wall"
        img={ img }
        editClick={ this.onEditApplicationClick }
        deleteClick={ this.onDeleteApplicationClick }
      >
      </CardItem>
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
      <Card elevation={ 0 } className={ classes.addCard }>
        <CardActionArea className={ classes.add } onClick={ this.onAddApplicationClick }>
          <AddIcon className={ classes.addIcon } />
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