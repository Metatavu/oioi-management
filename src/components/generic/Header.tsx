import * as React from "react";
import { AppBar, IconButton, Toolbar, WithStyles, withStyles } from '@material-ui/core';
import SignOutIcon from "@material-ui/icons/ExitToAppSharp";
import logo from "../../resources/svg/oioi-logo.svg";
import { Link } from "react-router-dom";
import styles from "../../styles/header";

interface Props extends WithStyles<typeof styles> {

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
    const { classes } = this.props;
    return (
      <AppBar color={"primary"} elevation={0} position="relative" className={ classes.header }>
        <Toolbar>
          <div className={ classes.logoContainer }>
            <Link to="/">
              <img className={ classes.logo } src={logo} alt="OiOi Logo"></img>
            </Link>
          </div>
          <IconButton edge="end" className={ classes.signOutBtn } onClick={this.onLogOutClick}>
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

export default withStyles(styles)(Header);