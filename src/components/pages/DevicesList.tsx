import * as React from "react";
import { Container, Typography, Grid, Card, withStyles, WithStyles, CardActionArea, Snackbar } from "@material-ui/core";
import AddIcon from "@material-ui/icons/AddCircle";
import styles from "../../styles/card-item";
import { History } from "history";
import CardItem from "../generic/CardItem";
import DeviceDialog from "../generic/DeviceDialog";
import strings from "../../localization/strings";
import { Device, Customer } from "../../generated/client/src";
import ApiUtils from "../../utils/api";
import { AuthState, DialogType } from "../../types";
import { ReduxState, ReduxActions } from "../../store";
import { Dispatch } from "redux";
import { connect } from "react-redux";
import DeleteDialog from "../generic/DeleteDialog";
import { Alert } from "@material-ui/lab";
import { setDevice } from "../../actions/device";
import { setCustomer } from "../../actions/customer";
import VisibleWithRole from "../generic/VisibleWithRole";

/**
 * Component props
 */
interface Props extends WithStyles<typeof styles> {
  /**
   * Router history
   */
  history: History;
  /**
   * Customer id
   */
  customerId: string;
  customer?: Customer
  /**
   * Auth
   */
  auth: AuthState;
  setCustomer: typeof setCustomer;
  setDevice: typeof setDevice;
}

/**
 * Component state
 */
interface State {
  editorDialogOpen: boolean;
  dialogType: DialogType;
  deleteDialogOpen: boolean;
  snackbarOpen: boolean;
  deviceInDialog?: Device;
  devices: Device[];
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
      devices: [],
      dialogType: "new",
      deviceInDialog: undefined,
      deleteDialogOpen: false,
      snackbarOpen: false
    };
  }

  /**
   * Component did mount
   */
  public componentDidMount = async () => {
    const { auth, customerId, setCustomer, customer } = this.props;
    if (!auth || !auth.token) {
      return;
    }

    const customersApi = ApiUtils.getCustomersApi(auth.token);
    const devicesApi = ApiUtils.getDevicesApi(auth.token);
    let currentCustomer = customer;
    if (!currentCustomer || currentCustomer.id !== customerId) {
      currentCustomer = await customersApi.findCustomer({ customer_id: customerId });
      setCustomer(currentCustomer);
    }

    const devices = await devicesApi.listDevices({ customer_id: customerId });
    this.setState({
      devices: devices
    });
  };

  /**
   * Component render method
   */
  public render() {
    const { classes, customer } = this.props;
    const {
      devices,
      deviceInDialog,
      dialogType,
      editorDialogOpen,
      deleteDialogOpen,
      snackbarOpen
    } = this.state;

    const cards = devices.map((device, index) => this.renderCard(device, `${index}${device.name}`));

    return (
      <Container maxWidth="xl" className="page-content">
        <Typography className={ classes.heading } variant="h2">
          { customer ? customer.name : strings.loading } / { strings.devices }
        </Typography>
        <Grid container spacing={ 5 } direction="row" className="card-list">
          { cards }
          { this.renderAdd() }
        </Grid>
        <DeviceDialog
          open={ editorDialogOpen }
          device={ deviceInDialog }
          dialogType={ dialogType }
          saveClick={ this.onSaveOrUpdateDeviceClick }
          handleClose={ this.onDialogCloseClick }
        />
        <DeleteDialog
          open={ deleteDialogOpen }
          deleteClick={ this.onDeleteDeviceClick }
          itemToDelete={ deviceInDialog }
          handleClose={ this.onDeleteDialogCloseClick }
          title={ strings.deleteConfirmation }
        />
        <Snackbar
          open={ snackbarOpen }
          autoHideDuration={ 6000 }
          onClose={ this.onSnackbarClose }
        >
          <Alert onClose={ this.onSnackbarClose } severity="success">
            { strings.deleteSuccess }
          </Alert>
        </Snackbar>
      </Container>
    );
  }

  /**
   * Card render method
   *
   * @param device device
   * @param key key
   */
  private renderCard(device: Device, key: string) {
    return (
      <Grid key={ key } item>
        <CardItem
          title={ device.name }
          img={ device.image_url }
          editConfiguration={ () => this.onEditDeviceConfigurationClick(device) }
          editClick={ () => this.onEditDeviceClick(device) }
          detailsClick={ () => this.onDeviceDetailsClick(device) }
          deleteClick={ () => this.onDeleteOpenModalClick(device) }
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
        <VisibleWithRole role="admin">
          <Card elevation={ 0 } className={ classes.addCard }>
            <CardActionArea className={ classes.add } onClick={ this.onAddDeviceClick }>
              <AddIcon className={ classes.addIcon } />
            </CardActionArea>
          </Card>
        </VisibleWithRole>
      </Grid>
    );
  }

  /**
   * Edit device configuration method
   *
   * @param device device
   */
  private onEditDeviceConfigurationClick = (device: Device) => {
    const { customerId, setDevice, history } = this.props;
    setDevice(device);
    history.push(`/${customerId}/devices/${device.id}/applications`);
  };

  /**
   * Edit device method
   *
   * @param device device
   */
  private onEditDeviceClick = (device: Device) => {
    this.setState({
      dialogType: "edit",
      editorDialogOpen: true,
      deviceInDialog: device
    });
  };

  /**
   * Show device details method
   *
   * @param device device
   */
  private onDeviceDetailsClick = (device: Device) => {
    this.setState({
      dialogType: "show",
      editorDialogOpen: true,
      deviceInDialog: device
    });
  };

  /**
   * Add device method
   */
  private onAddDeviceClick = () => {
    this.setState({
      dialogType: "new",
      editorDialogOpen: true,
      deviceInDialog: undefined
    });
  };

  /**
   * Delete open modal click
   *
   * @param device device
   */
  private onDeleteOpenModalClick = (device: Device) => {
    this.setState({
      deleteDialogOpen: true,
      deviceInDialog: device
    });
  };

  /**
   * Delete device method
   *
   * @param device device
   */
  private onDeleteDeviceClick = async (device: Device) => {
    const { auth, customerId } = this.props;
    const { devices } = this.state;

    if (!auth || !auth.token || !device.id) {
      return;
    }

    await ApiUtils.getDevicesApi(auth.token).deleteDevice({
      customer_id: customerId,
      device_id: device.id
    });

    this.setState({
      snackbarOpen: true,
      deleteDialogOpen: false,
      devices: devices.filter(c => c.id !== device.id)
    });
  };

  /**
   * Save device method
   *
   * @param device device
   * @param dialogType dialog type
   */
  private onSaveOrUpdateDeviceClick = async (device: Device, dialogType: DialogType) => {
    switch (dialogType) {
      case "new":
        this.saveNewDevice(device);
      break;
      case "edit":
        device.id && this.updateDevice(device, device.id);
      break;
      default:
      break;
    }
  };

  /**
   * Save new device method
   *
   * @param device device
   */
  private saveNewDevice = async (device: Device) => {
    const { auth, customerId } = this.props;
    const { devices } = this.state;

    if (!auth || !auth.token) {
      return;
    }

    const newDevice = await ApiUtils.getDevicesApi(auth.token).createDevice({
      customer_id: customerId,
      device: device
    });

    devices.push(newDevice);

    this.setState({
      devices: devices,
      editorDialogOpen: false
    });
  };

  /**
   * Updates device
   *
   * @param device device
   * @param id device id
   */
  private updateDevice = async (device: Device, id: string) => {
    const { auth, customerId } = this.props;
    const { devices } = this.state;

    if (!auth || !auth.token) {
      return;
    }

    const updatedDevice = await ApiUtils.getDevicesApi(auth.token).updateDevice({
      device_id: id,
      customer_id: customerId,
      device: device
    });

    this.setState({
      devices: devices.map(device => device.id === updatedDevice.id ? updatedDevice : device),
      editorDialogOpen: false
    });
  };

  /**
   * Snackbar close click
   *
   * @param event event
   * @param reason reason
   */
  private onSnackbarClose = (event?: React.SyntheticEvent, reason?: string) => {
    reason !== "clickaway" && this.setState({ snackbarOpen: false });
  };

  /**
   * Close dialog method
   *
   * TODO: handle prompt if unsaved
   */
  private onDialogCloseClick = () => {
    this.setState({
      editorDialogOpen: false,
      deviceInDialog: undefined
    });
  };

  /**
   * Delete dialog close click
   */
  private onDeleteDialogCloseClick = () => {
    this.setState({ deleteDialogOpen: false });
  };
}

/**
 * Maps redux state to props
 *
 * @param state Redux state
 */
const mapStateToProps = (state: ReduxState) => ({
  auth: state.auth,
  customer: state.customer.customer
});

/**
 * Function for declaring dispatch functions
 *
 * @param dispatch Redux dispatch
 */
const mapDispatchToProps = (dispatch: Dispatch<ReduxActions>) => ({
  setCustomer: (customer: Customer) => dispatch(setCustomer(customer)),
  setDevice: (device: Device) => dispatch(setDevice(device))
});

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DevicesList));
