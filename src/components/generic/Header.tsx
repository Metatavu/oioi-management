import * as React from "react";
import { AppBar, IconButton, Toolbar, WithStyles, withStyles } from '@material-ui/core';
import SignOutIcon from "@material-ui/icons/ExitToAppSharp";
import logo from "../../resources/svg/oioi-logo.svg";
import { Link } from "react-router-dom";
import styles from "../../styles/header";
import { ReduxState, ReduxActions } from "../../store";
import { Dispatch } from "redux";
import { logout } from "../../actions/auth";
import { connect } from "react-redux";
import { AuthState } from "../../types";

interface Props extends WithStyles<typeof styles> {
  logout: typeof logout
  auth: AuthState
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
   * Handle logout
   */
  private onLogOutClick = () => {
    const { auth, logout } = this.props;
    if (!auth) {
      return;
    }

    logout();
    auth.logout();
  }
}

const mapStateToProps = (state: ReduxState) => ({
  auth: state.auth
});

const mapDispatchToProps = (dispatch: Dispatch<ReduxActions>) => {
  return {
    logout: () => dispatch(logout())
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(Header));