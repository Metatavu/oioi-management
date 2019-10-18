import * as React from "react";
import Header from "../generic/Header";
import { Container } from "@material-ui/core";
import BreadCrumb from "../generic/BreadCrumb";
import CustomerPage from "./CustomerPage";

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
        <Container>
          <CustomerPage />
        </Container>
      </div>
    );
  }
}

export default IndexPage;