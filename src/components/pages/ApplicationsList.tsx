import * as React from "react";
import { Container, Typography, Grid, Card, withStyles, WithStyles, CardActionArea } from "@material-ui/core";
import img from "../../resources/images/infowall.png";
import AddIcon from "@material-ui/icons/AddCircle";
import styles from "../../styles/card-item";
import { History } from "history";
import CardItem from "../generic/CardItem";
import strings from "../../localization/strings";
import { Customer, Device, Application, ResourcesApi } from "../../generated/client/src";
import { ReduxState, ReduxActions } from "../../store";
import { Dispatch } from "redux";
import { connect } from "react-redux";
import { AuthState } from "../../types";
import ApiUtils from "../../utils/ApiUtils";

interface Props extends WithStyles<typeof styles> {
  history: History,
  customerId: string,
  deviceId: string,
  auth: AuthState
}

interface State {
  customer?: Customer,
  device?: Device,
  applications: Application[]
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
      applications: []
    };
  }

  public componentDidMount = async () => {
    const { auth, customerId, deviceId } = this.props;
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
  }

  /**
   * Component render method
   */
  public render() {
    const { classes } = this.props;
    const { customer, device, applications } = this.state;
    const cards = applications.map((application) => this.renderCard(application));
    return (
      <Container maxWidth="xl" className="page-content">
        <Typography className={ classes.heading } variant="h2">
          { customer ? customer.name : strings.loading } / { device ? device.name : strings.loading } / { strings.applications }
        </Typography>
        <Grid container spacing={ 5 } direction="row">
          {
            cards
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
  private renderCard(application: Application) {
    return (
      <Grid item>
        <CardItem
          title={ application.name }
          img={ img }
          editClick={ () => this.onEditApplicationClick(application) }
          detailsClick={ () => this.onEditApplicationClick(application) }
          deleteClick={ () => this.onDeleteApplicationClick(application) }
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

  private onEditApplicationClick = (application: Application) => {
    const { customerId, deviceId } = this.props;
    this.props.history.push(`/${customerId}/devices/${deviceId}/applications/${application.id}`);
  }

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
      applications: applications.filter((c => c.id !== application.id))
    });
  }

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
  }
}

const mapStateToProps = (state: ReduxState) => ({
  auth: state.auth
});

const mapDispatchToProps = (dispatch: Dispatch<ReduxActions>) => {
  return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(ApplicationsList));