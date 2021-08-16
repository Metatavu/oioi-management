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
import { AuthState, ErrorContextType } from "../../types";
import ApiUtils from "../../utils/api";
import DeleteDialog from "../generic/DeleteDialog";
import { Alert } from "@material-ui/lab";
import { setCustomer } from "../../actions/customer";
import { setApplication } from "../../actions/application";
import { setDevice } from "../../actions/device";
import VisibleWithRole from "../generic/VisibleWithRole";
import AppLayout from "../layouts/app-layout";
import { ErrorContext } from "../containers/ErrorHandler";

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
  setApplication: typeof setApplication;
  customer?: Customer;
  device?: Device;
}

/**
 * Component state
 */
interface State {
  applicationInDialog?: Application;
  applications: Application[];
  deleteDialogOpen: boolean;
  snackbarOpen: boolean;
  applicationImages?: { id: string, src: string }[];
}

/**
 * Creates list of applications
 */
class ApplicationsList extends React.Component<Props, State> {

  static contextType: React.Context<ErrorContextType> = ErrorContext;

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
    await this.fetchData();
  };

  /**
   * Component render method
   */
  public render() {
    const { classes, customer, device } = this.props;
    const { applications, deleteDialogOpen, applicationInDialog, snackbarOpen } = this.state;
    const cards = applications.map((application, index) => this.renderCard(application, `${index}${application.name}`));

    return (
      <AppLayout>
        <Container maxWidth="xl" className="page-content">
          <Typography className={ classes.heading } variant="h2">
            { customer ? customer.name : strings.loading } / { device ? device.name : strings.loading } / { strings.applications }
          </Typography>
          <Grid container spacing={ 5 } direction="row" className="card-list">
            { cards }
            { this.renderAdd() }
          </Grid>
          <DeleteDialog
            open={ deleteDialogOpen }
            deleteClick={ this.onDeleteApplicationClick }
            itemToDelete={ applicationInDialog }
            handleClose={ () => this.setState({ deleteDialogOpen: false }) }
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
   */
  private renderCard = (application: Application, key: string) => {
    const { applicationImages } = this.state;
    const image = applicationImages ? applicationImages.find(item => item.id === application.id) : undefined;

    return (
      <Grid item key={ key }>
        <CardItem
          title={ application.name }
          img={ image ? image.src : img }
          editConfiguration={ () => this.onEditConfiguration(application )}
          editClick={ () => this.onEditApplicationClick(application )}
          detailsClick={ () => this.onEditApplicationClick(application )}
          deleteClick={ () => this.onDeleteOpenModalClick(application )}>
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
        <VisibleWithRole role="admin">
          <Card elevation={ 0 } className={ classes.addCard }>
            <CardActionArea className={ classes.add } onClick={ this.onAddApplicationClick }>
              <AddIcon className={ classes.addIcon }/>
            </CardActionArea>
          </Card>
        </VisibleWithRole>
      </Grid>
    );
  }

  /**
   * Event handler for edit configuration
   *
   * @param application selected application
   */
  private onEditConfiguration = (application: Application) => {
    const { customerId, deviceId, history, setApplication } = this.props;

    setApplication(application);
    history.push(`/${customerId}/devices/${deviceId}/applications/${application.id}`);
  };

  /**
   * Event handler for edit application click
   *
   * @param application clicked application
   */
  private onEditApplicationClick = (application: Application) => {
    const { customerId, deviceId, history, setApplication } = this.props;

    setApplication(application);
    history.push(`/${customerId}/devices/${deviceId}/applications/${application.id}`);
  };

  /**
   * Event handler for delete application click
   *
   * @param application application to delete
   */
  private onDeleteApplicationClick = async (application: Application) => {
    const { auth, customerId, deviceId } = this.props;
    const { applications } = this.state;

    if (!auth || !auth.token || !application.id) {
      return;
    }

    try {
      await ApiUtils.getApplicationsApi(auth.token).deleteApplication({
        customer_id: customerId,
        device_id: deviceId,
        application_id: application.id
      });
  
      this.setState({
        snackbarOpen: true,
        deleteDialogOpen: false,
        applications: applications.filter(c => c.id !== application.id)
      });
    } catch (error) {
      this.context.setError(strings.errorManagement.application.delete, error);
    }

    this.reset();
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
   * Event handler for add application click
   */
  private onAddApplicationClick = async () => {
    const { auth, customerId, deviceId } = this.props;

    if (!auth || !auth.token) {
      return;
    }

    try {
      const application = await ApiUtils.getApplicationsApi(auth.token).createApplication({
        customer_id: customerId,
        device_id: deviceId,
        application: {
          name: "New Application"
        }
      });

      this.onEditApplicationClick(application);
    } catch (error) {
      this.context.setError(strings.errorManagement.application.create, error);
    }
  };

  /**
   * Snack bar close click
   *
   * @param event React synthetic event
   * @param reason reason
   */
  private onSnackbarClose = (event?: React.SyntheticEvent, reason?: string) => {
    if (reason === "clickaway") {
      return;
    }

    this.setState({ snackbarOpen: false });
  };

  /**
   * Finds the application image from root resource and returns it
   * 
   * @param application application
   */
  private getApplicationImage = async (application: Application) => {
    const { auth, customerId, deviceId } = this.props;

    if (!auth || !auth.token) {
      return;
    }

    try {
      return ApiUtils.getResourcesApi(auth.token).findResource({
        customer_id: customerId,
        device_id: deviceId,
        application_id: application.id || "",
        resource_id: application.root_resource_id || ""
      }).then((rootResource) => {
        if (rootResource && rootResource.properties) {
          const img = rootResource.properties.find(resource => resource.key === "applicationImage");
          if (img) {
            return img.value;
          }
        }
      });
    } catch (error) {
      this.context.setError(strings.errorManagement.resource.find, error);
    }
  }

  /**
   * Resets state values
   */
  private reset = () => {
    this.setState({
      snackbarOpen: true,
      deleteDialogOpen: false
    });
  }

  /**
   * Fetches initial data
   */
  private fetchData = async () => {
    const { auth, customerId, deviceId, setDevice, setCustomer, customer, device } = this.props;

    if (!auth || !auth.token) {
      return;
    }

    const { token } = auth;
    const { setError } = this.context;

    if (!customer || customer.id !== customerId) {
      try {
        const findCustomer = await ApiUtils.getCustomersApi(token).findCustomer({ customer_id: customerId });
        setCustomer(findCustomer);
      } catch (error) {
        setError(strings.errorManagement.customer.find, error);
        return;
      }
    }

    if (!device || device.id !== deviceId) {
      try {
        const foundDevice = await ApiUtils.getDevicesApi(token).findDevice({ customer_id: customerId, device_id: deviceId });
        setDevice(foundDevice);
      } catch (error) {
        setError(strings.errorManagement.device.find, error);
        return;
      }
    }

    try {
      const applications = await ApiUtils.getApplicationsApi(token).listApplications({ customer_id: customerId, device_id: deviceId });
      const applicationImages = await Promise.all(
        applications.map(async app => {
          return {
            id: app.id || "",
            src: await this.getApplicationImage(app) || ""
          }
        })
      );
      this.setState({
        applications: applications,
        applicationImages: applicationImages
      });
    } catch (error) {
      setError(strings.errorManagement.application.list, error);
      return;
    }
  }
}

/**
 * Maps redux state to props
 *
 * @param state redux state
 */
const mapStateToProps = (state: ReduxState) => ({
  auth: state.auth,
  customer: state.customer.customer,
  device: state.device.device
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
    setApplication: (application: Application) => dispatch(setApplication(application))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(ApplicationsList));