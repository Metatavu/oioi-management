import * as React from "react";
import { Container, Typography, Grid, Card, withStyles, WithStyles, CardActionArea, Snackbar } from "@material-ui/core";
import img from "../../resources/images/macmini.png";
import AddIcon from "@material-ui/icons/AddCircle";
import styles from "../../styles/card-item";
import { History } from "history";
import CardItem from "../generic/CardItem";
import AddDeviceDialog from "../generic/AddDeviceDialog";
import strings from "../../localization/strings";
import { Device, Customer } from "../../generated/client/src";
import ApiUtils from "../../utils/ApiUtils";
import { AuthState } from "../../types";
import { ReduxState, ReduxActions } from "../../store";
import { Dispatch } from "redux";
import { connect } from "react-redux";
import DeleteDialog from "../generic/DeleteDialog";
import { Alert } from "@material-ui/lab";
interface Props extends WithStyles<typeof styles> {
  history: History;
  customerId: string;
  auth: AuthState;
}

interface State {
  editorDialogOpen: boolean;
  deleteDialogOpen: boolean;
  snackbarOpen: boolean;
  deviceInDialog?: Device;
  devices: Device[];
  customer?: Customer;
}

/**
 * Creates list of devices
 */
class DevicesList extends React.Component<Props, State> {
  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      editorDialogOpen: false,
      deleteDialogOpen: false,
      snackbarOpen: false,
      deviceInDialog: undefined,
      devices: []
    };
  }

  public componentDidMount = async () => {
    const { auth, customerId } = this.props;
    if (!auth || !auth.token) {
      return;
    }

    const customersApi = ApiUtils.getCustomersApi(auth.token);
    const devicesApi = ApiUtils.getDevicesApi(auth.token);
    const [customer, devices] = await Promise.all([
      customersApi.findCustomer({ customer_id: customerId }),
      devicesApi.listDevices({ customer_id: customerId })
    ]);

    this.setState({
      customer: customer,
      devices: devices
    });
  };

  /**
   * Component render method
   */
  public render() {
    const { classes } = this.props;
    const { customer, deviceInDialog, editorDialogOpen, deleteDialogOpen, snackbarOpen } = this.state;
    const cards = this.state.devices.map((device: Device) => this.renderCard(device));
    return (
      <Container maxWidth="xl" className="page-content">
        <Typography className={classes.heading} variant="h2">
          {customer ? customer.name : strings.loading} / {strings.devices}
        </Typography>
        <Grid container spacing={5} direction="row">
          {cards}
          {this.renderAdd()}
        </Grid>
        <AddDeviceDialog open={editorDialogOpen} saveClick={this.onSaveDeviceClick} handleClose={this.onDialogCloseClick} />
        <DeleteDialog
          open={deleteDialogOpen}
          deleteClick={this.onDeleteDeviceClick}
          itemToDelete={deviceInDialog || undefined}
          handleClose={this.onDeleteDialogCloseClick}
          title={strings.deleteConfirmation}
        />
        <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={this.onSnackbarClose}>
          <Alert onClose={this.onSnackbarClose} severity="success">
            {strings.deleteSuccess}
          </Alert>
        </Snackbar>
      </Container>
    );
  }

  /**
   * Card render method
   */
  private renderCard(device: Device) {
    return (
      <Grid item>
        <CardItem
          title={device.name}
          img={img}
          editClick={() => this.onEditDeviceClick(device)}
          detailsClick={() => this.onDeviceDetailsClick(device)}
          deleteClick={() => this.onDeleteOpenModalClick(device)}
        ></CardItem>
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
  private onEditDeviceClick = (device: Device) => {
    const { customerId } = this.props;
    this.props.history.push(`/${customerId}/devices/${device.id}/applications`);
  };

  /**
   * Show device details method
   */
  private onDeviceDetailsClick = (device: Device) => {
    alert("Show device details!");
  };

  /**
   * Delete open modal click
   */
  private onDeleteOpenModalClick = (device: Device) => {
    this.setState({
      deleteDialogOpen: true,
      deviceInDialog: device
    });
  };

  /**
   * Delete device method
   */
  private onDeleteDeviceClick = async (device: Device) => {
    const { auth, customerId } = this.props;
    if (!auth || !auth.token || !device.id) {
      return;
    }

    const devicesApi = ApiUtils.getDevicesApi(auth.token);
    await devicesApi.deleteDevice({
      customer_id: customerId,
      device_id: device.id
    });
    const { devices } = this.state;
    this.setState({
      snackbarOpen: true,
      deleteDialogOpen: false,
      devices: devices.filter(c => c.id !== device.id)
    });
  };

  /**
   * Add device method
   */
  private onAddDeviceClick = () => {
    this.setState({ editorDialogOpen: true });
  };

  /**
   * Save device method
   *
   * TODO: handle saving
   */
  private onSaveDeviceClick = async (device: Device) => {
    const { auth, customerId } = this.props;
    if (!auth || !auth.token) {
      return;
    }

    const devicesApi = ApiUtils.getDevicesApi(auth.token);
    const newDevice = await devicesApi.createDevice({
      customer_id: customerId,
      device: device
    });
    const { devices } = this.state;
    devices.push(newDevice);
    this.setState({
      devices: devices,
      editorDialogOpen: false
    });
  };

  /**
   * Snack bar close click
   */
  private onSnackbarClose = (event?: React.SyntheticEvent, reason?: string) => {
    if (reason === "clickaway") {
      return;
    }

    this.setState({
      snackbarOpen: false
    });
  };

  /**
   * Close dialog method
   *
   * TODO: handle prompt if unsaved
   */
  private onDialogCloseClick = () => {
    this.setState({ editorDialogOpen: false });
  };

  /**
   * Delete dialog close click
   */
  private onDeleteDialogCloseClick = () => {
    this.setState({ deleteDialogOpen: false });
  };
}

const mapStateToProps = (state: ReduxState) => ({
  auth: state.auth
});

const mapDispatchToProps = (dispatch: Dispatch<ReduxActions>) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DevicesList));
