import * as React from "react";
import { Container, Typography, Grid, Card, withStyles, WithStyles, CardActionArea } from "@material-ui/core";
import img from "../../resources/images/macmini.png";
import AddIcon from "@material-ui/icons/AddCircle";
import styles from "../../styles/card-styles";
import { History } from "history";
import CardItem from "../generic/CardItem";
import AddDeviceDialog from "../generic/AddDeviceDialog";

interface Props extends WithStyles<typeof styles> {
  history: History
}

interface State {
  editorDialogOpen: boolean
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
        <Typography className={ classes.heading } variant="h1">{ "Saimaa Geopark" } - devices</Typography>
        <Grid container spacing={ 5 } direction="row">
          {
            this.renderCards()
          }
          {
            this.renderAdd()
          }
        </Grid>
        <AddDeviceDialog
          open={ this.state.editorDialogOpen }
          saveClick={ this.onSaveDeviceClick }
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
        title="Mac mini"
        img={ img }
        editClick={ this.onEditDeviceClick }
        deleteClick={ this.onDeleteDeviceClick }>
      </CardItem>
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
      <Card elevation={ 0 } className={ classes.addCard }>
        <CardActionArea className={ classes.add } onClick={ this.onAddDeviceClick }>
          <AddIcon className={ classes.addIcon } />
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
    this.setState({ editorDialogOpen: true });
  }
  /**
   * Save device method
   *
   * TODO: handle saving
   */
  private onSaveDeviceClick = () => {
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

export default withStyles(styles)(DevicesList);