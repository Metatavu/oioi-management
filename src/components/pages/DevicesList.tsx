import * as React from "react";
import { Container, Typography, Grid, Card, withStyles, WithStyles, CardActionArea, Fade, Box, CircularProgress } from "@material-ui/core";
import AddIcon from "@material-ui/icons/AddCircle";
import styles from "../../styles/card-item";
import { History } from "history";
import CardItem from "../generic/CardItem";
import DeviceDialog from "../generic/DeviceDialog";
import strings from "../../localization/strings";
import { Device, Customer } from "../../generated/client";
import Api from "../../api";
import { DialogType, ErrorContextType } from "../../types";
import { ReduxState, ReduxDispatch } from "app/store";
import { connect, ConnectedProps } from "react-redux";
import DeleteDialog from "../generic/DeleteDialog";
import VisibleWithRole from "../containers/VisibleWithRole";
import AppLayout from "../layouts/app-layout";
import { ErrorContext } from "../containers/ErrorHandler";
import { toast } from "react-toastify";
import { setDevice } from "features/device-slice";
import { setCustomer } from "features/customer-slice";

/**
 * Component properties
 */
interface Props extends ExternalProps {
  history: History;
  customerId: string;
}

/**
 * Component state
 */
interface State {
  editorDialogOpen: boolean;
  dialogType: DialogType;
  deleteDialogOpen: boolean;
  deviceInDialog?: Device;
  devices: Device[];
  loading: boolean;
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
      loading: false
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
    const { classes, customer, keycloak } = this.props;
    const {
      devices,
      deviceInDialog,
      dialogType,
      editorDialogOpen,
      deleteDialogOpen
    } = this.state;

    const cards = devices.map((device, index) => this.renderCard(device, `${index}${device.name}`));

    return (
      <AppLayout>
        <Container maxWidth="xl" className={ classes.pageContent }>
          <Typography className={ classes.heading } variant="h2">
            { customer ? customer.name : strings.loading } / { strings.devices }
          </Typography>
          <Grid
            container
            spacing={ 5 }
            direction="row"
            className={ classes.cardList }
          >
            { cards } 
            { this.renderAdd() }
          </Grid>
          <DeviceDialog
            keycloak={ keycloak }
            open={ editorDialogOpen }
            device={ deviceInDialog }
            dialogType={ dialogType }
            saveClick={ this.onSaveOrUpdateDeviceClick }
            handleClose={ this.onDialogCloseClick }
          />
          <DeleteDialog
            message={ strings.actionCannotBeReverted }
            open={ deleteDialogOpen }
            deleteClick={ this.onDeleteDeviceClick }
            itemToDelete={ deviceInDialog }
            handleClose={ this.onDeleteDialogCloseClick }
            title={ strings.deleteConfirmation }
          />
          { this.renderLoader() }
        </Container>
      </AppLayout>
    );
  }

  /**
   * Loader render method
   */
  private renderLoader = () => {
    const { classes } = this.props;
    const { loading } = this.state;

    return (
      <Fade in={ loading } timeout={ 200 }>
        <Box className={ classes.loaderOverlay }>
          <Box alignSelf="center" textAlign="center">
            <CircularProgress color="inherit" />
            <Box mt={ 2 }>
              <Typography color="inherit">
                { strings.devicesList.loadingDevices }
              </Typography>
            </Box>
          </Box>
        </Box>
      </Fade>
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
          img={ device.imageUrl }
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
    const { keycloak, customerId } = this.props;
    const { devices } = this.state;

    if (!keycloak?.token || !device.id) {
      return;
    }

    try {
      await Api.getDevicesApi(keycloak.token).deleteDevice({
        customerId: customerId,
        deviceId: device.id
      });

      this.setState({ devices: devices.filter(c => c.id !== device.id) });
      toast.success(strings.deleteSuccessMessage);
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
    const { keycloak, customerId } = this.props;
    const { devices } = this.state;

    if (!keycloak?.token) {
      return;
    }

    try {
      const newDevice = await Api.getDevicesApi(keycloak.token).createDevice({
        customerId: customerId,
        device: device
      });

      this.setState({
        devices: [ ...devices, newDevice ]
      });

      toast.success(strings.createSuccessMessage);
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
    const { keycloak, customerId } = this.props;
    const { devices } = this.state;

    if (!keycloak?.token) {
      return;
    }

    try {
      const updatedDevice = await Api.getDevicesApi(keycloak.token).updateDevice({
        deviceId: id,
        customerId: customerId,
        device: device
      });

      this.setState({ devices: devices.map(device => device.id === updatedDevice.id ? updatedDevice : device) });
      toast.success(strings.updateSuccessMessage);
    } catch (error) {
      this.context.setError(strings.errorManagement.device.update, error);
    }

    this.reset();
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
      editorDialogOpen: false
    });
  }

  /**
   * Fetches initial data
   */
  private fetchData = async () => {
    const { keycloak, customerId, setCustomer, customer } = this.props;

    this.setState({
      loading: true
    });

    if (!keycloak?.token) {
      return;
    }

    const { setError } = this.context;

    if (!customer || customer.id !== customerId) {
      try {
        const currentCustomer = await Api.getCustomersApi(keycloak.token).findCustomer({ customerId: customerId });
        setCustomer(currentCustomer);
      } catch (error) {
        setError(strings.errorManagement.customer.find, error);
        return;
      }
    }

    try {
      const devices = await Api.getDevicesApi(keycloak.token).listDevices({ customerId: customerId });

      this.setState({
        devices: devices,
        loading: false
      });
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
  keycloak: state.auth.keycloak,
  customer: state.customer.customer,
  locale: state.locale.locale
});

/**
 * Function for declaring dispatch functions
 *
 * @param dispatch Redux dispatch
 */
const mapDispatchToProps = (dispatch: ReduxDispatch) => ({
  setCustomer: (customer: Customer) => dispatch(setCustomer(customer)),
  setDevice: (device: Device) => dispatch(setDevice(device))
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type ExternalProps = ConnectedProps<typeof connector> & WithStyles<typeof styles>;

export default connector(withStyles(styles)(DevicesList));