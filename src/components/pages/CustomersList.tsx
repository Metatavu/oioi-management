import * as React from "react";
import { Container, Typography, Grid, Card, withStyles, WithStyles, CardActionArea } from "@material-ui/core";
import img from "../../resources/images/geopark.png";
import AddIcon from "@material-ui/icons/AddCircle";
import styles from "../../styles/card-styles";
import { History } from "history";
import CardItem from "../generic/CardItem";
import AddCustomerDialog from "../generic/AddCustomerDialog";

interface Props extends WithStyles<typeof styles> {
  history: History
}

interface State {
  editorDialogOpen: boolean
}

class CustomersList extends React.Component<Props, State> {

  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      editorDialogOpen: false
    };
  }

  /**
   * Component render method
   */
  public render() {
    const { classes } = this.props;
    // const cars = this.state.cars.map((car) => renderCar(car))
    return (
      <Container maxWidth="xl" className="page-content">
        <Typography className={classes.heading} variant="h1">Customers</Typography>
        <Grid container spacing={5} direction="row">
          {
            this.renderCards()
          }
          {
            this.renderAddCustomer()
          }
        </Grid>
        <AddCustomerDialog
          open={ this.state.editorDialogOpen }
          saveClick={ this.onSaveCustomerClick }
          handleClose={ this.onDialogCloseClick}
        />
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
        title="Saimaa Geopark"
        img={ img }
        editClick={ this.onEditCustomerClick }
        deleteClick={ this.onDeleteCustomerClick }>
      </CardItem>>
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
      <Card elevation={0} className={ classes.addCard}>
        <CardActionArea className={classes.add} onClick={ this.onAddCustomerClick }>
          <AddIcon className={classes.addIcon} />
        </CardActionArea>
      </Card>
    </Grid>
    );
  }

  /**
   * Edit customer method
   */
  private onEditCustomerClick = () => {
    this.props.history.push("/devices");
  }
  /**
   * Delete customer method
   */
  private onDeleteCustomerClick = () => {
    alert("Delete Customer!");
  }
  /**
   * Add customer method
   */
  private onAddCustomerClick = () => {
    this.setState({ editorDialogOpen: true });
  }
  /**
   * Save customer method
   *
   * TODO: handle saving
   */
  private onSaveCustomerClick = () => {
    this.setState({ editorDialogOpen: false });
  }
  /**
   * Close dialog method
   *
   * TODO: handle prompt if unsaved
   */
  private onDialogCloseClick = () => {
    this.setState({ editorDialogOpen: false });
  }
}

export default withStyles(styles)(CustomersList);