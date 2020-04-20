/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from "react";
import { Container, Typography, Grid, Card, withStyles, WithStyles, CardActionArea, Snackbar } from "@material-ui/core";
import img from "../../resources/images/infowall.png";
import AddIcon from "@material-ui/icons/AddCircle";
import styles from "../../styles/card-item";
import { History } from "history";
import CardItem from "../generic/CardItem";
import strings from "../../localization/strings";
import { Customer, Device, Application } from "../../generated/client/src";
import { ReduxState, ReduxActions } from "../../store";
import { Dispatch } from "redux";
import { connect } from "react-redux";
import { AuthState } from "../../types";
import ApiUtils from "../../utils/ApiUtils";
import DeleteDialog from "../generic/DeleteDialog";
import { Alert } from "@material-ui/lab";
import { setCustomer } from "../../actions/customer";
import { setApplications } from "../../actions/applications";
import { setDevice } from "../../actions/device";

/**
 * Component props
 */
interface Props extends WithStyles<typeof styles> {
  history: History;
  customerId: string;
  deviceId: string;
  auth: AuthState;
  setCustomer: typeof setCustomer;
  setDevice: typeof setDevice;
  setApplications: typeof setApplications;
}

/**
 * Component state
 */
interface State {
  customer?: Customer;
  device?: Device;
  applicationInDialog?: Application;
  applications: Application[];
  deleteDialogOpen: boolean;
  snackbarOpen: boolean;
}

/**
 * Creates list of applications
 */
class ApplicationsList extends React.Component<Props, State> {
  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      applications: [],
      applicationInDialog: undefined,
      deleteDialogOpen: false,
      snackbarOpen: false
    };
  }

  /**
   * Component did mount
   */
  public componentDidMount = async () => {
    const { auth, customerId, deviceId, setDevice, setCustomer } = this.props;
    if (!auth || !auth.token) {
      return;
    }

    const customersApi = ApiUtils.getCustomersApi(auth.token);
    const devicesApi = ApiUtils.getDevicesApi(auth.token);
    const applicationsApi = ApiUtils.getApplicationsApi(auth.token);
    const [customer, device, applications] = await Promise.all([
      customersApi.findCustomer({ customer_id: customerId }),
      devicesApi.findDevice({ customer_id: customerId, device_id: deviceId }),
      applicationsApi.listApplications({ customer_id: customerId, device_id: deviceId })
    ]);

    this.setState({
      customer: customer,
      device: device,
      applications: applications
    });
    setCustomer(customer);
    setDevice(device);
  };

  /**
   * Component render method
   */
  public render() {
    const { classes } = this.props;
    const { customer, device, applications, deleteDialogOpen, applicationInDialog, snackbarOpen } = this.state;
    const cards = applications.map((application, index) => this.renderCard(application, `${index}${application.name}`));
    return (
      <Container maxWidth="xl" className="page-content">
        <Typography className={classes.heading} variant="h2">
          {customer ? customer.name : strings.loading} / {device ? device.name : strings.loading} / {strings.applications}
        </Typography>
        <Grid container spacing={5} direction="row">
          {cards}
          {this.renderAdd()}
        </Grid>
        <DeleteDialog
          open={deleteDialogOpen}
          deleteClick={this.onDeleteApplicationClick}
          itemToDelete={applicationInDialog}
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
  private renderCard(application: Application, key: string) {

    // TODO get background image from application root element resources!
    return (
      <Grid item key={key}>
        <CardItem
          title={application.name}
          img={img}
          editConfiguration={() => this.onEditConfiguration(application)}
          editClick={() => this.onEditApplicationClick(application)}
          detailsClick={() => this.onEditApplicationClick(application)}
          deleteClick={() => this.onDeleteOpenModalClick(application)}
        ></CardItem>
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

  private onEditConfiguration = (application: Application) => {
    const { customerId, deviceId } = this.props;
    this.props.history.push(`/${customerId}/devices/${deviceId}/applications/${application.id}`);
  };

  /**
   * Edit application click
   */
  private onEditApplicationClick = (application: Application) => {
    const { customerId, deviceId } = this.props;
    this.props.history.push(`/${customerId}/devices/${deviceId}/applications/${application.id}`);
  };

  /**
   * Delete application click
   */
  private onDeleteApplicationClick = async (application: Application) => {
    const { auth, customerId, deviceId } = this.props;
    if (!auth || !auth.token || !application.id) {
      return;
    }

    const applicationsApi = ApiUtils.getApplicationsApi(auth.token);
    await applicationsApi.deleteApplication({
      customer_id: customerId,
      device_id: deviceId,
      application_id: application.id
    });
    const { applications } = this.state;
    this.setState({
      snackbarOpen: true,
      deleteDialogOpen: false,
      applications: applications.filter(c => c.id !== application.id)
    });
  };

  /**
   * Delete open modal click
   */
  private onDeleteOpenModalClick = (application: Application) => {
    this.setState({
      applicationInDialog: application,
      deleteDialogOpen: true
    });
  };

  /**
   * Add application click
   */
  private onAddApplicationClick = async () => {
    const { auth, customerId, deviceId } = this.props;
    if (!auth || !auth.token) {
      return;
    }

    const applicationData: Application = {
      name: "New Application"
    };

    const applicationsApi = ApiUtils.getApplicationsApi(auth.token);
    const application = await applicationsApi.createApplication({
      customer_id: customerId,
      device_id: deviceId,
      application: applicationData
    });

    this.onEditApplicationClick(application);
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
   * Delete dialog close click
   */
  private onDeleteDialogCloseClick = () => {
    this.setState({
      deleteDialogOpen: false
    });
  };
}

/**
 * Maps redux state to props
 *
 * @param state redux state
 */
const mapStateToProps = (state: ReduxState) => ({
  auth: state.auth
});

/**
 * Function for declaring dispatch functions
 *
 * @param dispatch
 */
const mapDispatchToProps = (dispatch: Dispatch<ReduxActions>) => {
  return {
    setCustomer: (customer: Customer) => dispatch(setCustomer(customer)),
    setDevice: (device: Device) => dispatch(setDevice(device)),
    setApplications: (applications: Application[]) => dispatch(setApplications(applications))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(ApplicationsList));
