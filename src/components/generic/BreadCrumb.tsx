import * as React from "react";
import { Dispatch } from "redux";
import { connect } from "react-redux";
import { History } from "history";
import { AuthState } from "../../types";
import strings from "../../localization/strings";
import { ReduxState, ReduxActions } from "../../store";
import { Customer, Device, Application } from "../../generated/client/src";
import { Breadcrumbs, Link, createStyles, Theme, WithStyles, withStyles } from "@material-ui/core";
import { setDevice } from "../../actions/device";
import { setCustomer } from "../../actions/customer";
import { setApplications } from "../../actions/applications";

/**
 * Component properties
 */
interface Props extends WithStyles<typeof styles> {
  /**
   * Url locations history
   */
  history: History;
  /**
   * State of authentication
   */
  auth: AuthState;
  /**
   * Currently selected customer
   */
  customer?: Customer;
  /**
   * Currently selected device
   */
  device?: Device;
  /**
   * Currently selected applications
   */
  applications?: Application[];
  setCustomer: typeof setCustomer;
  setDevice: typeof setDevice;
  setApplications: typeof setApplications;
}

/**
 * Component state
 */
interface State {}

/**
 * Page open types
 */
type PageOpen = "customer" | "device" | "application" | "main";

/**
 * Component styles
 *
 * @param theme component theme
 */
const styles = (theme: Theme) =>
  createStyles({
    breadcrumb: {
      gridArea: "breadcrumb",
      height: 50,
      display: "flex",
      alignItems: "center",
      backgroundColor: "#fff",
      boxShadow: "0 0 30px rgba(0,0,0,0.4)",
      padding: "0 30px"
    }
  });

/**
 * Creates bread crumb component
 */
class BreadCrumb extends React.Component<Props, State> {
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

  /**
   * Component render method
   */
  public render() {
    const { classes, customer, device, applications } = this.props;

    return (
      <div className={classes.breadcrumb}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link className="bc-link" href="/" onClick={this.handleClick("main")}>
            Main
          </Link>
          {customer && (
            <Link className="bc-link" href={`/${customer.id}/devices`} onClick={this.handleClick("customer")}>
              {customer ? customer.name : strings.loading}
            </Link>
          )}
          {customer && device && (
            <Link className="bc-link" href={`/${customer.id}/devices/${device.id}/applications`} onClick={this.handleClick("device")}>
              {device ? device.name : strings.loading}
            </Link>
          )}
          {customer && device && applications && applications.length > 0 && (
            <Link
              className="bc-link"
              href={`/${customer.id}/devices/${device.id}/applications/${applications[0].id}`}
              onClick={this.handleClick("application")}
            >
              {applications[0] ? applications[0].name : strings.loading}
            </Link>
          )}
        </Breadcrumbs>
      </div>
    );
  }

  /**
   * Handles clicks on breadcrumb
   *
   * @param event mouse event
   */
  private handleClick = (pageOpen: PageOpen) => (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    const { setCustomer, setDevice, setApplications } = this.props;

    event.preventDefault();

    switch (pageOpen) {
      case "main":
        setCustomer(undefined);
        setDevice(undefined);
        setApplications(undefined);

        break;
      case "customer":
        setDevice(undefined);
        setApplications(undefined);

        break;
      case "device":
        setApplications(undefined);
        break;

      default:
        break;
    }

    this.props.history.replace(
      "/" +
        event.currentTarget.href
          .split("/")
          .splice(3)
          .join("/")
    );
  };
}

/**
 * Maps redux state to props
 *
 * @param state redux state
 */
const mapStateToProps = (state: ReduxState) => ({
  auth: state.auth,
  customer: state.customer.customer,
  device: state.device.device,
  applications: state.applications.applications
});

/**
 * Function for declaring dispatch functions
 *
 * @param dispatch
 */
const mapDispatchToProps = (dispatch: Dispatch<ReduxActions>) => {
  return {
    setCustomer: (customer?: Customer) => dispatch(setCustomer(customer)),
    setDevice: (device?: Device) => dispatch(setDevice(device)),
    setApplications: (applications?: Application[]) => dispatch(setApplications(applications))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(BreadCrumb));
