import * as React from "react";
import Header from "../generic/Header";
import BreadCrumb from "../generic/BreadCrumb";
import CustomersList from "./CustomersList";
import { Route } from "react-router";
import DevicesList from "./DevicesList";
import ApplicationsList from "./ApplicationsList";
import ApplicationEditor from "./ApplicationEditor";

interface Props {

}

interface State {

}

class IndexPage extends React.Component<Props, State> {

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
      <div className="wrapper">
        <Header></Header>
        <BreadCrumb></BreadCrumb>
        <div>
          <Route
            path="/"
            exact={true}
            render={ ({ history }) => (
              <CustomersList history= {history} />
            )}
          />
          <Route
            path="/devices"
            exact={true}
            render={ ({ history }) => (
              <DevicesList history= {history}/>
            )}
          />
          <Route
            path="/applications"
            exact={true}
            render={ ({ history }) => (
              <ApplicationsList history= {history}/>
            )}
          />
          <Route
            path="/application-editor"
            exact={true}
            render={ ({ history }) => (
              <ApplicationEditor history= {history} />
            )}
          />
        </div>
      </div>
    );
  }
}

export default IndexPage;