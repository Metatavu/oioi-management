import * as React from "react";
import { Dispatch } from "redux";
import { connect } from "react-redux";
import { History } from "history";
import { AuthState, CustomerState } from "../../types";
import strings from "../../localization/strings";
import { ReduxState, ReduxActions } from "../../store";
import { Customer, Device, Application } from "../../generated/client/src";
import { Breadcrumbs, Link, createStyles, Theme, WithStyles, withStyles } from "@material-ui/core";

interface Props extends WithStyles<typeof styles> {
  history: History;
  auth: AuthState;
  customer: Customer;
  device: Device;
  applications:Application[]
}

interface State {
}

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
      <div className={ classes.breadcrumb }>
        <Breadcrumbs aria-label="breadcrumb">
          <Link className="bc-link" href="/" onClick={this.handleClick}>
            Main
          </Link>
          { customer &&
            <Link className="bc-link" href={`/${customer.id}/devices`} onClick={this.handleClick}>
              {customer ? customer.name : strings.loading}
            </Link>
          }
          { device &&
            <Link className="bc-link" href={`/${customer.id}/devices/${device.id}/applications`} onClick={this.handleClick}>
              {device ? device.name : strings.loading}
            </Link>
          }
          { applications.length > 0 &&
            <Link className="bc-link" href={`/${customer.id}/devices/${device.id}/applications/${applications[0].id}`} onClick={this.handleClick}>
              {applications[0] ? applications[0].name : strings.loading}
            </Link>
          }
        </Breadcrumbs>
      </div>
    );
  }

  private handleClick = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    event.preventDefault();
    this.props.history.replace("/" + event.currentTarget.href.split("/").splice(3).join("/"));
  }
}

const mapStateToProps = (state: ReduxState) => ({
  auth: state.auth,
  customer: state.customer,
  device: state.device,
  applications: state.applications
});

const mapDispatchToProps = (dispatch: Dispatch<ReduxActions>) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(BreadCrumb));