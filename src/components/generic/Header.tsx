import * as React from "react";
import { AppBar, Box, IconButton, MenuItem, Select, Toolbar, WithStyles, withStyles } from '@material-ui/core';
import SignOutIcon from "@material-ui/icons/ExitToAppSharp";
import logo from "../../resources/svg/oioi-logo.svg";
import { Link } from "react-router-dom";
import styles from "../../styles/header";
import { ReduxState, ReduxActions } from "../../store";
import { Dispatch } from "redux";
import { logout } from "../../actions/auth";
import { connect } from "react-redux";
import { AuthState } from "../../types";
import { setLocale } from "../../actions/locale";
import strings from "../../localization/strings";

interface HeaderProps {
  logout: typeof logout;
  auth: AuthState;
}

interface OtherProps extends WithStyles<typeof styles> {
  locale: string;
  setLocale: typeof setLocale;
}

/**
 * Intersection type for all component properties
 */
type Props = HeaderProps & OtherProps;

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
      <AppBar
        color="primary"
        elevation={ 0 }
        position="relative"
        className={ classes.header }
      >
        <Toolbar>
          <Box className={ classes.logoContainer }>
            <Link to="/">
              <img
                className={ classes.logo }
                src={ logo }
                alt="OiOi Logo"
              />
            </Link>
          </Box>
          <Box>
            { this.renderLanguageSelection() }
          </Box>
          <IconButton 
            edge="end"
            className={ classes.signOutBtn }
            onClick={ this.onLogOutClick }>
            <SignOutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
    );
  }

  /**
   * Renders language selection
   */
  private renderLanguageSelection = () => {
    const { classes } = this.props;
    return (
      <Select
        className={ classes.languageSelect }
        value={ strings.getLanguage() }
        onChange={ event => setLocale(event.target.value as string) }
      >
      {
        strings.getAvailableLanguages().map(language =>
          <MenuItem key={ language } value={ language }>
            { language }
          </MenuItem>
        )
      }
      </Select>
    );
  };

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
  auth: state.auth,
  locale: state.locale.locale
});

const mapDispatchToProps = (dispatch: Dispatch<ReduxActions>) => {
  return {
    logout: () => dispatch(logout()),
    setLocale: (locale: string) => dispatch(setLocale(locale))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(Header));