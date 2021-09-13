import * as React from "react";
import { Breadcrumbs, Link, createStyles, Theme, WithStyles, withStyles } from "@material-ui/core";
import { Link as RouterLink } from "react-router-dom";
import { useAppSelector } from "app/hooks";
import { selectCustomer } from "features/customer-slice";
import { selectDevice } from "features/device-slice";
import { selectApplication } from "features/application-slice";

/**
 * Component properties
 */
interface Props extends WithStyles<typeof styles> {
  level: number;
}

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
 * Bread crumb
 *
 * @param props component properties
 */
const BreadCrumb: React.FC<Props> = ({
  classes,
  level
}) => {
  const customer = useAppSelector(selectCustomer);
  const device = useAppSelector(selectDevice);
  const application = useAppSelector(selectApplication);

  /**
   * Renders single breadcrumb
   *
   * @param title title
   * @param path path
   */
  const renderBreadcrumb = (title: string, path: string) => (
    <Link
      component={ RouterLink }
      className="bc-link"
      to={ path }
    >
      { title }
    </Link>
  );

  return (
    <div className={ classes.breadcrumb }>
      <Breadcrumbs aria-label="breadcrumb">
        { renderBreadcrumb("Main", "/") }
        { customer && level > 1 &&
          renderBreadcrumb(
            customer.name,
            `/${customer.id}/devices`
          )
        }
        { customer && device && level > 3 &&
          renderBreadcrumb(
            device.name,
            `/${customer.id}/devices/${device.id}/applications`
          )
        }
        { customer && device && application && level > 4 &&
          renderBreadcrumb(
            application.name,
            `/${customer.id}/devices/${device.id}/applications/${application.id}`
          )
        }
      </Breadcrumbs>
    </div>
  );
}

export default withStyles(styles)(BreadCrumb);
