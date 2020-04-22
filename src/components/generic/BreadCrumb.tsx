import * as React from "react";
import { Dispatch } from "redux";
import { connect } from "react-redux";
import { History } from "history";
import { AuthState } from "../../types";
import strings from "../../localization/strings";
import { ReduxState, ReduxActions } from "../../store";
import { Customer, Device, Application } from "../../generated/client/src";
import { Breadcrumbs, Link, createStyles, Theme, WithStyles, withStyles } from "@material-ui/core";
import { Link as RouterLink } from "react-router-dom";

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
  application?: Application;

  /**
   * Current navigation level
   */
  level: number;
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
    const { classes, customer, device, application, level } = this.props;
    return (
      <div className={classes.breadcrumb}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link component={RouterLink} className="bc-link" to="/" >
            Main
          </Link>
          {customer && level > 1 && (
            <Link component={RouterLink} className="bc-link" to={`/${customer.id}/devices`} >
              {customer ? customer.name : strings.loading}
            </Link>
          )}
          {customer && device && level > 3 && (
            <Link component={RouterLink} className="bc-link" to={`/${customer.id}/devices/${device.id}/applications`} >
              {device ? device.name : strings.loading}
            </Link>
          )}
          {customer && device && application && level > 4 && (
            <Link
              component={RouterLink}
              className="bc-link"
              to={`/${customer.id}/devices/${device.id}/applications/${application.id}`}
            >
              {application ? application.name : strings.loading}
            </Link>
          )}
        </Breadcrumbs>
      </div>
    );
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
  device: state.device.device,
  application: state.application.application
});

/**
 * Function for declaring dispatch functions
 *
 * @param dispatch
 */
const mapDispatchToProps = (dispatch: Dispatch<ReduxActions>) => {
  return { };
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(BreadCrumb));
