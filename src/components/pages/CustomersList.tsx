import * as React from "react";
import { Container, Typography, Grid, Card, withStyles, WithStyles, CardActionArea, Snackbar } from "@material-ui/core";
import img from "../../resources/images/geopark.png";
import AddIcon from "@material-ui/icons/AddCircle";
import styles from "../../styles/card-item";
import { History } from "history";
import CardItem from "../generic/CardItem";
import CustomerDialog from "../generic/CustomerDialog";
import { AuthState } from "../../types";
import { Dispatch } from "redux";
import { ReduxActions, ReduxState } from "../../store";
import { connect } from "react-redux";
import { Customer, Device, Application } from "../../generated/client/src";
import ApiUtils from "../../utils/ApiUtils";
import strings from "../../localization/strings";
import DeleteDialog from "../generic/DeleteDialog";
import { Alert } from "@material-ui/lab";
import { DialogType } from "../../types/index";
import { setCustomer } from "../../actions/customer";
import { setDevice } from "../../actions/device";
import { setApplications } from "../../actions/applications";

/**
 * Component props
 */
interface Props extends WithStyles<typeof styles> {
  /**
   * Props history
   */
  history: History;
  /**
   * Auth
   */
  auth: AuthState;
  setCustomer: typeof setCustomer;
  setDevice: typeof setDevice;
  setApplications: typeof setApplications;
}

/**
 * Component state
 */
interface State {
  editorDialogOpen: boolean;
  customers: Customer[];
  deleteDialogOpen: boolean;
  customerInDialog?: Customer;
  snackbarOpen: boolean;
  dialogType: DialogType;
}

/**
 * Creates list of customers
 */
class CustomersList extends React.Component<Props, State> {
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
      customerInDialog: undefined,
      customers: [],
      dialogType: "new"
    };
  }

  /**
   * Component did mount
   */
  public componentDidMount = async () => {
    const { auth, setCustomer, setDevice, setApplications } = this.props;
    if (!auth || !auth.token) {
      return;
    }

    const customersApi = ApiUtils.getCustomersApi(auth.token);
    const customers = await customersApi.listCustomers();
    this.setState({
      customers: customers
    });
    setCustomer({} as Customer);
    setDevice({} as Device);
    setApplications([{} as Application]);
  };

  /**
   * Component render method
   */
  public render() {
    const { classes } = this.props;
    const { editorDialogOpen, deleteDialogOpen, customerInDialog, snackbarOpen, dialogType } = this.state;
    const cards = this.state.customers.map((customer, index) => this.renderCard(customer, `${index}${customer.name}`));

    return (
      <Container maxWidth="xl" className="page-content">
        <Typography className={classes.heading} variant="h2">
          {strings.customers}
        </Typography>
        <Grid container spacing={5} direction="row">
          {cards}
          {this.renderAddCustomer()}
        </Grid>
        <CustomerDialog
          open={editorDialogOpen}
          customer={customerInDialog}
          dialogType={dialogType}
          saveClick={this.onSaveOrUpdateCustomerClick}
          handleClose={this.onDialogCloseClick}
        />

        <DeleteDialog
          open={deleteDialogOpen}
          deleteClick={this.onDeleteCustomerClick}
          itemToDelete={customerInDialog}
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
  private renderCard(customer: Customer, key: string) {
    return (
      <Grid key={key} item>
        <CardItem
          title={customer.name}
          img={customer.image_url || img}
          editConfiguration={() => this.onEditCustomerConfigurationClick(customer)}
          editClick={() => this.onEditCustomerClick(customer)}
          detailsClick={() => this.onCustomerDetailsClick(customer)}
          deleteClick={() => this.onDeleteOpenModalClick(customer)}
        ></CardItem>
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
        <Card elevation={0} className={classes.addCard}>
          <CardActionArea className={classes.add} onClick={this.onAddCustomerClick}>
            <AddIcon className={classes.addIcon} />
          </CardActionArea>
        </Card>
      </Grid>
    );
  }

  /**
   * Handles save or update on customer modal component
   * @param customer
   * @param dialogType
   */
  private onSaveOrUpdateCustomerClick = async (customer: Customer, dialogType: DialogType) => {
    switch (dialogType) {
      case "new":
        this.saveCustomer(customer);
        break;
      case "edit":
        if (customer.id) {
          this.updateCustomer(customer, customer.id);
        }
        break;
      default:
        break;
    }
  };

  /**
   * Handles edit customer configuration
   * @param customer
   */
  private onEditCustomerConfigurationClick = (customer: Customer) => {
    this.props.history.push(`/${customer.id}/devices`);
  };

  /**
   * Edit customer method
   * @param customer
   */
  private onEditCustomerClick = (customer: Customer) => {
    this.setState({
      dialogType: "edit",
      editorDialogOpen: true,
      customerInDialog: customer
    });
  };

  /**
   * Handles customer details click
   * @param customer
   */
  private onCustomerDetailsClick = (customer: Customer) => {
    this.setState({
      dialogType: "show",
      editorDialogOpen: true,
      customerInDialog: customer
    });
  };

  /**
   * Delete customer method
   * @param customer
   */
  private onDeleteCustomerClick = async (customer: Customer) => {
    const { auth } = this.props;
    if (!auth || !auth.token || !customer.id) {
      return;
    }

    const customersApi = ApiUtils.getCustomersApi(auth.token);
    await customersApi.deleteCustomer({ customer_id: customer.id });
    const { customers } = this.state;
    this.setState({
      customers: customers.filter(c => c.id !== customer.id),
      snackbarOpen: true,
      deleteDialogOpen: false
    });
  };

  /**
   * Delete open modal click
   * @param customer
   */
  private onDeleteOpenModalClick = (customer: Customer) => {
    this.setState({
      deleteDialogOpen: true,
      customerInDialog: customer
    });
  };

  /**
   * Add customer method
   */
  private onAddCustomerClick = () => {
    this.setState({ editorDialogOpen: true, dialogType: "new", customerInDialog: undefined });
  };

  /**
   * Save customer method
   * @param customer
   */
  private saveCustomer = async (customer: Customer) => {
    const { auth } = this.props;
    if (!auth || !auth.token) {
      return;
    }

    const customersApi = ApiUtils.getCustomersApi(auth.token);
    const newCustomer = await customersApi.createCustomer({ customer: customer });

    const { customers } = this.state;
    customers.push(newCustomer);
    this.setState({
      customers: customers,
      editorDialogOpen: false
    });
  };

  /**
   * Updates customer method
   * @param customer
   * @param id
   */
  private updateCustomer = async (customer: Customer, id: string) => {
    const { auth } = this.props;
    if (!auth || !auth.token) {
      return;
    }

    const customersApi = ApiUtils.getCustomersApi(auth.token);
    const updateCustomer = await customersApi.updateCustomer({
      customer_id: id,
      customer: customer
    });

    const { customers } = this.state;
    const updateCustomerList = [...customers].filter(cus => cus.id !== id);
    updateCustomerList.push(updateCustomer);

    this.setState({
      customers: updateCustomerList,
      editorDialogOpen: false
    });
  };

  /**
   * Snack bar close click
   * @param event
   * @param reason
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
    this.setState({ editorDialogOpen: false, customerInDialog: undefined });
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
    setCustomer: (customer:Customer) => dispatch(setCustomer(customer)),
    setDevice: (device:Device) => dispatch(setDevice(device)),
    setApplications: (applications:Application[]) => dispatch(setApplications(applications))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(CustomersList));
