import * as React from "react";
import { Breadcrumbs, Link, createStyles, Theme, WithStyles, withStyles } from "@material-ui/core";

interface Props extends WithStyles<typeof styles> {

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

    };
  }

  /**
   * Component render method
   */
  public render() {
    const { classes } = this.props;
    return (
      <div className={ classes.breadcrumb }>
        <Breadcrumbs aria-label="breadcrumb">
          <Link className="bc-link" href="/" onClick={handleClick}>
            Main
          </Link>
        </Breadcrumbs>
      </div>
    );
  }
}

function handleClick(event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) {
  event.preventDefault();
  alert("You clicked a breadcrumb.");
}

export default withStyles(styles)(BreadCrumb);