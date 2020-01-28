import * as React from "react";
import { Container, Typography, Grid, Card, withStyles, WithStyles, CardActionArea } from "@material-ui/core";
import img from "../../resources/images/macmini.png";
import AddIcon from "@material-ui/icons/AddCircle";
import styles from "../../styles/card-item";
import { History } from "history";
import CardItem from "../generic/CardItem";
import DeviceDialog from "../generic/DeviceDialog";
import strings from "../../localization/strings";
import { Device, Customer } from "../../generated/client/src";
import ApiUtils from "../../utils/ApiUtils";
import { AuthState, DialogType } from "../../types";
import { ReduxState, ReduxActions } from "../../store";
import { Dispatch } from "redux";
import { connect } from "react-redux";

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
  /**
   * Auth
   */
  auth: AuthState;
}

/**
 * Component state
 */
interface State {
  editorDialogOpen: boolean;
  dialogType: DialogType;
  deviceInDialog?: Device;
  devices: Device[];
  customer?: Customer;
}

/**
 * Creates Device list component
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
      deviceInDialog: undefined
    };
  }

  /**
   * Component did mount
   */
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
    const { customer, dialogType, deviceInDialog } = this.state;
    const cards = this.state.devices.map((device: Device, index) => this.renderCard(device, `${index}${device.name}`));

    return (
      <Container maxWidth="xl" className="page-content">
        <Typography className={classes.heading} variant="h2">
          {customer ? customer.name : strings.loading} / {strings.devices}
        </Typography>
        <Grid container spacing={5} direction="row">
          {cards}
          {this.renderAdd()}
        </Grid>
        {this.state.editorDialogOpen && (
          <DeviceDialog
            open={true}
            device={deviceInDialog}
            dialogType={dialogType}
            saveClick={this.onSaveOrUpdateDeviceClick}
            handleClose={this.onDialogCloseClick}
          />
        )}
      </Container>
    );
  }

  /**
   * Card render method
   */
  private renderCard(device: Device, key: string) {
    return (
      <Grid key={key} item>
        <CardItem
          title={device.name}
          img={img}
          editConfiguration={() => this.onEditDeviceConfigurationClick(device)}
          editClick={() => this.onEditDeviceClick(device)}
          detailsClick={() => this.onDeviceDetailsClick(device)}
          deleteClick={() => this.onDeleteDeviceClick(device)}
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
   * Edit device configuration method
   */
  private onEditDeviceConfigurationClick = (device: Device) => {
    const { customerId } = this.props;
    this.props.history.push(`/${customerId}/devices/${device.id}/applications`);
  };

  /**
   * Edit device method
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
    this.setState({ dialogType: "new", editorDialogOpen: true, deviceInDialog: undefined });
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
      devices: devices.filter(c => c.id !== device.id)
    });
  };

  /**
   * Save device method
   *
   */
  private onSaveOrUpdateDeviceClick = async (device: Device, dialogType: DialogType) => {
    switch (dialogType) {
      case "new":
        this.saveNewDevice(device);
        break;

      case "edit":
        if (device.id) {
          this.updateDevice(device, device.id);
        }
        break;
      default:
        break;
    }
  };

  /**
   * Save new device method
   */
  private saveNewDevice = async (device: Device) => {
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
   * Updates device
   */
  private updateDevice = async (device: Device, id: string) => {
    const { auth, customerId } = this.props;
    if (!auth || !auth.token) {
      return;
    }

    const devicesApi = ApiUtils.getDevicesApi(auth.token);
    const updatedDevice = await devicesApi.updateDevice({
      device_id: id,
      customer_id: customerId,
      device: device
    });

    const { devices } = this.state;

    /**
     * Creates updated list by removing old device from list and pushing updated device to list in stead
     */
    const updateDeviceList = devices.filter(dev => dev.id !== id);
    updateDeviceList.push(updatedDevice);

    this.setState({
      devices: updateDeviceList,
      editorDialogOpen: false
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
}

const mapStateToProps = (state: ReduxState) => ({
  auth: state.auth
});

const mapDispatchToProps = (dispatch: Dispatch<ReduxActions>) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DevicesList));
