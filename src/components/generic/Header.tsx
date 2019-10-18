import * as React from "react";
import { AppBar, IconButton, Toolbar } from "@material-ui/core";
import SignOutIcon from "@material-ui/icons/ExitToAppSharp";
import logo from "../../resources/svg/oioi-logo.svg";

interface Props {

}

interface State {

}

class Header extends React.Component<Props, State> {

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
      <AppBar color={"primary"} elevation={0} position="relative" className="header">
        <Toolbar>
          <div className="logo-container">
            <img className="logo" src={logo} alt="OiOi Logo"></img>
          </div>
          <IconButton edge="end" className="sign-out-btn">
            <SignOutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
    );
  }
}

export default Header;