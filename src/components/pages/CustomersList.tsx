import * as React from "react";
import { Container, Typography, Grid, Card, withStyles, WithStyles, CardActionArea } from "@material-ui/core";
import img from "../../resources/images/geopark.png";
import AddIcon from "@material-ui/icons/AddCircle";
import styles from "../../styles/card-item";
import { History } from "history";
import CardItem from "../generic/CardItem";
import AddCustomerDialog from "../generic/AddCustomerDialog";
import { AuthState } from "../../types";
import { Dispatch } from "redux";
import { ReduxActions, ReduxState } from "../../store";
import { connect } from "react-redux";
import { Customer } from "../../generated/client/src";
import ApiUtils from "../../utils/ApiUtils";
import strings from "../../localization/strings";

interface Props extends WithStyles<typeof styles> {
  history: History,
  auth: AuthState
}

interface State {
  editorDialogOpen: boolean,
  customers: Customer[]
}

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
      customers: []
    };
  }

  public componentDidMount = async () => {
    const { auth } = this.props;
    if (!auth || !auth.token) {
      return;
    }

    const customersApi = ApiUtils.getCustomersApi(auth.token);
    const customers = await customersApi.listCustomers();
    this.setState({
      customers: customers
    });
  }

  /**
   * Component render method
   */
  public render() {
    const { classes } = this.props;
    const cards = this.state.customers.map((customer) => this.renderCard(customer));
    return (
      <Container maxWidth="xl" className="page-content">
        <Typography className={classes.heading} variant="h2">{ strings.customers }</Typography>
        <Grid container spacing={5} direction="row">
          {
            cards
          }
          {
            this.renderAddCustomer()
          }
        </Grid>
        <AddCustomerDialog
          open={ this.state.editorDialogOpen }
          saveClick={ this.onSaveCustomerClick }
          handleClose={ this.onDialogCloseClick}
        />
      </Container>
    );
  }

  /**
   * Card render method
   */
  private renderCard(customer: Customer) {
    return (
    <Grid item>
      <CardItem
        title={ customer.name }
        img={ customer.image_url || img }
        editClick={() => this.onEditCustomerClick(customer) }
        detailsClick={() => this.onEditCustomerClick(customer) }
        deleteClick={() => this.onDeleteCustomerClick(customer) }>
      </CardItem>
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
      <Card elevation={0} className={ classes.addCard}>
        <CardActionArea className={classes.add} onClick={ this.onAddCustomerClick }>
          <AddIcon className={classes.addIcon} />
        </CardActionArea>
      </Card>
    </Grid>
    );
  }

  /**
   * Edit customer method
   */
  private onEditCustomerClick = (customer: Customer) => {
    this.props.history.push("/devices");
  }

  /**
   * Delete customer method
   */
  private onDeleteCustomerClick = async (customer: Customer) => {
    const { auth } = this.props;
    if (!auth || !auth.token || !customer.id) {
      return;
    }

    const customersApi = ApiUtils.getCustomersApi(auth.token);
    await customersApi.deleteCustomer({customer_id: customer.id});
    const { customers } = this.state;
    this.setState({
      customers: customers.filter((c => c.id !== customer.id))
    });
  }

  /**
   * Add customer method
   */
  private onAddCustomerClick = () => {
    this.setState({ editorDialogOpen: true });
  }

  /**
   * Save customer method
   */
  private onSaveCustomerClick = async (customer: Customer) => {
    const { auth } = this.props;
    if (!auth || !auth.token) {
      return;
    }

    const customersApi = ApiUtils.getCustomersApi(auth.token);
    const newCustomer = await customersApi.createCustomer({customer: customer});
    const { customers } = this.state;
    customers.push(newCustomer);
    this.setState({
      customers: customers,
      editorDialogOpen: false
    });
  }

  /**
   * Close dialog method
   *
   * TODO: handle prompt if unsaved
   */
  private onDialogCloseClick = () => {
    this.setState({ editorDialogOpen: false });
  }
}

const mapStateToProps = (state: ReduxState) => ({
  auth: state.auth
});

const mapDispatchToProps = (dispatch: Dispatch<ReduxActions>) => {
  return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(CustomersList));