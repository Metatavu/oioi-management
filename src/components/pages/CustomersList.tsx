import * as React from "react";
import { Container, Typography, Grid, Card, withStyles, WithStyles, CardActionArea, CircularProgress, Box, Fade } from "@material-ui/core";
import img from "../../resources/images/geopark.png";
import AddIcon from "@material-ui/icons/AddCircle";
import styles from "../../styles/card-item";
import { History } from "history";
import CardItem from "../generic/CardItem";
import CustomerDialog from "../generic/CustomerDialog";
import { AuthState, ErrorContextType } from "../../types";
import { Dispatch } from "redux";
import { ReduxActions, ReduxState } from "../../store";
import { connect } from "react-redux";
import { Customer } from "../../generated/client/src";
import ApiUtils from "../../utils/api";
import strings from "../../localization/strings";
import DeleteDialog from "../generic/DeleteDialog";
import { DialogType } from "../../types/index";
import { setCustomer } from "../../actions/customer";
import VisibleWithRole from "../generic/VisibleWithRole";
import AppLayout from "../layouts/app-layout";
import { ErrorContext } from "../containers/ErrorHandler";
import { toast } from "react-toastify";

/**
 * Component props
 */
interface Props extends WithStyles<typeof styles> {
  history: History;
  auth: AuthState;
  locale: string;
  setCustomer: typeof setCustomer;
}

/**
 * Component state
 */
interface State {
  editorDialogOpen: boolean;
  customers: Customer[];
  deleteDialogOpen: boolean;
  customerInDialog?: Customer;
  dialogType: DialogType;
  loading: boolean;
}

/**
 * Component for customer list
 */
class CustomersList extends React.Component<Props, State> {

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
      deleteDialogOpen: false,
      customerInDialog: undefined,
      loading: false,
      customers: [],
      dialogType: "new"
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
  public render = () => {
    const { classes } = this.props;
    const { 
      editorDialogOpen,
      deleteDialogOpen,
      customerInDialog,
      dialogType
    } = this.state;
    const cards = this.state.customers.map((customer, index) => this.renderCard(customer, `${index}${customer.name}`));

    return (
      <AppLayout>
        <Container maxWidth="xl" className={ classes.pageContent }>
          <Typography className={ classes.heading } variant="h2">
            { strings.customers }
          </Typography>
          <Grid container spacing={ 5 } direction="row" className="card-list">
            { cards }
            { this.renderAddCustomer() }
          </Grid>
          <CustomerDialog
            open={ editorDialogOpen }
            customer={ customerInDialog }
            dialogType={ dialogType }
            saveClick={ this.onSaveOrUpdateCustomerClick }
            handleClose={ this.onDialogCloseClick }
          />
          <DeleteDialog
            message={ strings.actionCannotBeReverted }
            open={ deleteDialogOpen }
            deleteClick={ this.onDeleteCustomerClick }
            itemToDelete={ customerInDialog }
            handleClose={ () => this.setState({ deleteDialogOpen: false }) }
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
                { strings.customersList.loadingCustomers }
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
   * @param customer customer
   * @param key key
   */
  private renderCard = (customer: Customer, key: string) => {

    return (
      <Grid key={ key } item>
        <CardItem
          title={ customer.name }
          img={ customer.imageUrl || img }
          editConfiguration={ () => this.onEditCustomerConfigurationClick(customer) }
          editClick={ () => this.onEditCustomerClick(customer) }
          detailsClick={ () => this.onCustomerDetailsClick(customer) }
          deleteClick={ () => this.onDeleteOpenModalClick(customer) }
        />
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
        <VisibleWithRole role="admin">
          <Card elevation={ 0 } className={ classes.addCard }>
            <CardActionArea className={ classes.add } onClick={ this.onAddCustomerClick }>
              <AddIcon className={ classes.addIcon }/>
            </CardActionArea>
          </Card>
        </VisibleWithRole>
      </Grid>
    );
  }

  /**
   * Handles save or update on customer modal component
   *
   * @param customer customer
   * @param dialogType dialog type
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
   *
   * @param customer customer
   */
  private onEditCustomerConfigurationClick = (customer: Customer) => {
    const { setCustomer, history } = this.props;

    setCustomer(customer);
    history.push(`/${customer.id}/devices`);
  };

  /**
   * Edit customer method
   *
   * @param customer customer
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
   *
   * @param customer customer
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
   *
   * @param customer customer
   */
  private onDeleteCustomerClick = async (customer: Customer) => {
    const { auth } = this.props;
    const { customers } = this.state;

    if (!auth || !auth.token || !customer.id) {
      return;
    }

    try {
      await ApiUtils.getCustomersApi(auth.token).deleteCustomer({ customerId: customer.id });
      this.setState({ customers: customers.filter(c => c.id !== customer.id) });

      toast.success(strings.deleteSuccessMessage);
    } catch (error) {
      this.context.setError(strings.errorManagement.customer.delete, error);
    }

    this.reset();
  };

  /**
   * Delete open modal click
   *
   * @param customer customer
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
   *
   * @param customer customer
   */
  private saveCustomer = async (customer: Customer) => {
    const { auth } = this.props;
    const { customers } = this.state;

    if (!auth || !auth.token) {
      return;
    }

    try {
      const newCustomer = await ApiUtils.getCustomersApi(auth.token).createCustomer({ customer: customer });
      this.setState({ customers: [ ...customers, newCustomer ] });
      toast.success(strings.createSuccessMessage);
    } catch (error) {
      this.context.setError(strings.errorManagement.customer.create, error);
    }

    this.reset();
  };

  /**
   * Updates customer method
   *
   * @param customer customer
   * @param id customer id
   */
  private updateCustomer = async (customer: Customer, id: string) => {
    const { auth } = this.props;
    const { customers } = this.state;

    if (!auth || !auth.token) {
      return;
    }

    try {
      const updatedCustomer = await ApiUtils.getCustomersApi(auth.token).updateCustomer({
        customerId: id,
        customer: customer
      });

      this.setState({
        customers: customers.map(c => c.id !== customer.id ? c : updatedCustomer)
      });

      toast.success(strings.updateSuccessMessage);
    } catch (error) {
      this.context.setError(strings.errorManagement.customer.update, error);
    }

    this.reset();
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
    const { auth } = this.props;

    this.setState({
      loading: true
    });

    if (!auth || !auth.token) {
      return;
    }

    try {
      const customers = await ApiUtils.getCustomersApi(auth.token).listCustomers();
      this.setState({ 
        customers: customers,
        loading: false
      });
    } catch (error) {
      this.context.setError(strings.errorManagement.customer.list, error);
    }
  };
}

/**
 * Maps redux state to props
 *
 * @param state redux state
 */
const mapStateToProps = (state: ReduxState) => ({
  auth: state.auth,
  locale: state.locale.locale
});

/**
 * Function for declaring dispatch functions
 *
 * @param dispatch
 */
const mapDispatchToProps = (dispatch: Dispatch<ReduxActions>) => {
  return {
    setCustomer: (customer: Customer) => dispatch(setCustomer(customer))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(CustomersList));