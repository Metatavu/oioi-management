import * as React from "react";
import { Breadcrumbs, Link } from "@material-ui/core";

interface Props {

}

interface State {

}

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
    return (
      <div className="breadcrumb">
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

export default BreadCrumb;