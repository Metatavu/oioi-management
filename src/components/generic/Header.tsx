import * as React from "react";
import { AppBar, IconButton, Toolbar } from "@material-ui/core";
import SignOutIcon from "@material-ui/icons/ExitToAppSharp";
import logo from "../../resources/svg/oioi-logo.svg";
import { Link } from "react-router-dom";

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
            <Link to="/">
              <img className="logo" src={logo} alt="OiOi Logo"></img>
            </Link>
          </div>
          <IconButton edge="end" className="sign-out-btn" onClick={this.onLogOutClick}>
            <SignOutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
    );
  }

  /**
   * Edit customer method
   */
  private onLogOutClick = () => {
    alert("You can run but you can't hide!");
  }
}

export default Header;