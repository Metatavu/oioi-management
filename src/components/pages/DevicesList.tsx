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
import { AuthState, DialogType, ErrorContextType } from "../../types";
import { ReduxState, ReduxActions } from "../../store";
import { Dispatch } from "redux";
import { connect } from "react-redux";
import DeleteDialog from "../generic/DeleteDialog";
import { Alert } from "@material-ui/lab";
import { setDevice } from "../../actions/device";
import { setCustomer } from "../../actions/customer";
import VisibleWithRole from "../generic/VisibleWithRole";
import AppLayout from "../layouts/app-layout";
import { ErrorContext } from "../containers/ErrorHandler";

/**
 * Component props
 */
interface Props extends WithStyles<typeof styles> {
  history: History;
  customerId: string;
  customer?: Customer
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
 * Component for device list
 */
class DevicesList extends React.Component<Props, State> {

  static contextType: React.Context<ErrorContextType> = ErrorContext;

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
   * Component did mount life cycle handler
   */
  public componentDidMount = async () => {
    this.fetchData();
  };

  /**
   * Component render method
   */
  public render = () => {
    const { classes, customer, auth } = this.props;
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
      <AppLayout>
        <Container maxWidth="xl" className="page-content">
          <Typography className={ classes.heading } variant="h2">
            { customer ? customer.name : strings.loading } / { strings.devices }
          </Typography>
          <Grid container spacing={ 5 } direction="row" className="card-list">
            { cards }
            { this.renderAdd() }
          </Grid>
          <DeviceDialog
            auth={ auth }
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
      </AppLayout>
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
  private renderAdd = () => {
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

    try {
      await ApiUtils.getDevicesApi(auth.token).deleteDevice({
        customer_id: customerId,
        device_id: device.id
      });
  
      this.setState({ devices: devices.filter(c => c.id !== device.id) });
    } catch (error) {
      this.context.setError(strings.errorManagement.device.delete, error);
    }

    this.reset();
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

    try {
      const newDevice = await ApiUtils.getDevicesApi(auth.token).createDevice({
        customer_id: customerId,
        device: device
      });

      this.setState({
        devices: [ ...devices, newDevice ]
      });
    } catch (error) {
      this.context.setError(strings.errorManagement.device.create, error);
    }

    this.reset();
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

    try {
      const updatedDevice = await ApiUtils.getDevicesApi(auth.token).updateDevice({
        device_id: id,
        customer_id: customerId,
        device: device
      });
  
      this.setState({ devices: devices.map(device => device.id === updatedDevice.id ? updatedDevice : device) });
    } catch (error) {
      this.context.setError(strings.errorManagement.device.update, error);
    }

    this.reset();
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

  /**
   * Resets state values
   */
  private reset = () => {
    this.setState({
      deleteDialogOpen: false,
      snackbarOpen: false,
      editorDialogOpen: false
    });
  }

  /**
   * Fetches initial data
   */
  private fetchData = async () => {
    const { auth, customerId, setCustomer, customer } = this.props;

    if (!auth || !auth.token) {
      return;
    }

    const { setError } = this.context;

    if (!customer || customer.id !== customerId) {
      try {
        const currentCustomer = await ApiUtils.getCustomersApi(auth.token).findCustomer({ customer_id: customerId });
        setCustomer(currentCustomer);
      } catch (error) {
        setError(strings.errorManagement.customer.find, error);
        return;
      }
    }

    try {
      const devices = await ApiUtils.getDevicesApi(auth.token).listDevices({ customer_id: customerId });
      this.setState({ devices: devices });
    } catch (error) {
      setError(strings.errorManagement.device.list, error);
      return;
    }
  }
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