import * as React from "react";
import { AppBar, Box, IconButton, MenuItem, Select, Toolbar, WithStyles, withStyles } from '@material-ui/core';
import SignOutIcon from "@material-ui/icons/ExitToAppSharp";
import logo from "../../resources/svg/oioi-logo.svg";
import { Link } from "react-router-dom";
import styles from "../../styles/header";
import { ReduxState, ReduxDispatch } from "app/store";
import { connect, ConnectedProps } from "react-redux";
import strings from "../../localization/strings";
import { logout } from "features/auth-slice";
import { setLocale } from "features/locale-slice";

/**
 * Component props
 */
interface Props extends ExternalProps { }

/**
 * Header component
 */
class Header extends React.Component<Props> {

  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = { };
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
    const { classes, locale, setLocale } = this.props;
    return (
      <Select
        className={ classes.languageSelect }
        value={ locale }
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
    const { keycloak, logout } = this.props;
    if (!keycloak) {
      return;
    }

    logout();
    keycloak.logout();
  }
}

/**
 * Map Redux state to component properties
 *
 * @param state Redux state
 */
const mapStateToProps = (state: ReduxState) => ({
  keycloak: state.auth.keycloak,
  locale: state.locale.locale
});

/**
 * Map Redux dispatch to component properties
 *
 * @param dispatch Redux dispatch
 */
const mapDispatchToProps = (dispatch: ReduxDispatch) => ({
  logout: () => dispatch(logout()),
  setLocale: (locale: string) => dispatch(setLocale(locale))
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type ExternalProps = ConnectedProps<typeof connector> & WithStyles<typeof styles>;

export default connector(withStyles(styles)(Header));