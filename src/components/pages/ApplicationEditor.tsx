import * as React from "react";
// tslint:disable-next-line: max-line-length
import { Typography, createStyles, Theme, Divider, List, ListItem, ListItemIcon, ListItemText, Hidden, AppBar, Toolbar, IconButton, WithStyles, withStyles, Drawer, SvgIcon } from "@material-ui/core";
import { History } from "history";
import TreeView from "@material-ui/lab/TreeView";
import SettingsIcon from "@material-ui/icons/Settings";
import MenuIcon from "@material-ui/icons/Menu";
import LanguageIcon from "@material-ui/icons/Language";
import { fade } from "@material-ui/core/styles";
import TreeItem from "@material-ui/lab/TreeItem";
import TransitionComponent from "../generic/TransitionComponent";

const pageIconPath = <path d="M24 17H1.14441e-05V1.90735e-06H24V17ZM23 1H1V16H23V1Z"/>;
const folderIconPath = <path d="M17.9999 18H-0.000127792V6H17.9999V18ZM20.9998 15H19.9998V4H2.99982V3H20.9998V15ZM0.999872 7H16.9999V17H0.999872V7ZM24 12H23V0.999998H6V-1.90735e-06H24V12Z" />;

interface Props extends WithStyles<typeof styles> {
  history: History,
}

interface State {
  mobileOpen: boolean
}

const drawerWidth = 240;

const styles = (theme: Theme) =>
  createStyles({
    root: {
      display: "grid",
      gridTemplateColumns: "auto 1fr",
      gridTemplateRows: "auto auto 1fr",
      gridTemplateAreas: "\"drawer appbar\" \"drawer content\" \"drawer content\"",
      boxShadow: "0 0 20px rgba(0, 0, 0, 0.2)",
      height: "100%"
    },
    drawer: {
      gridArea: "drawer",
      position: "relative",
      [theme.breakpoints.up("sm")]: {
        width: drawerWidth,
        flexShrink: 0,
      },
    },
    appBar: {
      height: 65,
      backgroundColor: "#F6F6F6",
      color: "#000",
      gridArea: "appbar",
      borderBottomWidth: 0.5,
      borderBottom: "1px solid rgba(0, 0, 0, 0.2)",
    },
    menuButton: {
      marginRight: theme.spacing(2),
      [theme.breakpoints.up("sm")]: {
        display: "none",
      },
    },
    toolbar: theme.mixins.toolbar,
    drawerPaper: {
      backgroundColor: "#fff",
      position: "absolute",
      width: drawerWidth,
      height: "100%",
    },
    content: {
      gridArea: "content",
      flexGrow: 1,
      padding: theme.spacing(3),
      background: "#F6F6F6"
    },
    treeRoot: {
      margin: 10
    },
    treeContent: {
      minHeight: 30
    },
    treeIconContainer: {
      marginRight: 5,
      "& .close": {
        opacity: 0.3,
      },
    },
    treeGroup: {
      marginLeft: 12,
      paddingLeft: 12,
      borderLeft: `1px dashed ${fade(theme.palette.text.primary, 0.4)}`,
    },
    treeLabel: {
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis"
    }
  });

class ApplicationEditor extends React.Component<Props, State> {

  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      mobileOpen: false
    };
  }
  /**
   * Component render method
   */
  public render() {
    const { classes } = this.props;
    return (
      <div className={ classes.root }>
        <AppBar elevation={ 0 } position="relative" className={ classes.appBar }>
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={ this.handleDrawerToggle }
              className={ classes.menuButton }
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap>
              Application settings
            </Typography>
          </Toolbar>
        </AppBar>
        { this.renderResponsiveDrawer() }
        { this.renderEditor() }
      </div>
    );
  }

  /**
   * Render responsive drawer method
   */
  private renderResponsiveDrawer = () => {
    const { classes } = this.props;
    return (
      <nav className={classes.drawer} aria-label="mailbox folders">
        {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
        <Hidden smUp implementation="css">

          <Drawer
            variant="temporary"
            anchor="left"
            open={ this.state.mobileOpen }
            onClose={ this.handleDrawerToggle }
            classes={{
              paper: classes.drawerPaper,
            }}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
            >
              { this.renderDrawer() }
          </Drawer>
        </Hidden>
        <Hidden xsDown implementation="css">
          <Drawer

            classes={{
              paper: classes.drawerPaper,
            }}
            variant="permanent"
            anchor="left"
            open
          >
            { this.renderDrawer() }
          </Drawer>
        </Hidden>
      </nav>
    );
  }

  /**
   * Render drawer method
   */
  private renderDrawer = () => {
    const { classes } = this.props;
    const  treeItemStyles  = { iconContainer: classes.treeIconContainer, group: classes.treeGroup, content: classes.treeContent, label: classes.treeLabel };
    return (
    <div>
      <List>
        <ListItem button>
          <ListItemIcon><SettingsIcon color="primary" /></ListItemIcon>
          <ListItemText primary="Application settings" />
        </ListItem>
      </List>
      <Divider />
      <TreeView classes={{ root: classes.treeRoot }}>
        <TreeItem TransitionComponent={TransitionComponent} classes={ treeItemStyles } icon={ <SvgIcon fontSize="small">{ pageIconPath }</SvgIcon> } nodeId="1" label="Teaser" />
        <TreeItem TransitionComponent={TransitionComponent} classes={ treeItemStyles } icon={ <LanguageIcon fontSize="small" />} nodeId="2" label="Language" />
        <TreeItem TransitionComponent={TransitionComponent} classes={ treeItemStyles } icon={ <MenuIcon fontSize="small" /> } nodeId="3" label="Menu" >
          <TreeItem TransitionComponent={TransitionComponent} classes={ treeItemStyles } icon={ <MenuIcon fontSize="small" /> } nodeId="4" label="Näin Saimaa syntyi">
            <TreeItem TransitionComponent={TransitionComponent} classes={ treeItemStyles } icon={ <MenuIcon fontSize="small" /> } nodeId="5" label="1. Mannerlaattojen jakautuminen">
              <TreeItem TransitionComponent={TransitionComponent} classes={ treeItemStyles } icon={ <SvgIcon fontSize="small">{ folderIconPath }</SvgIcon> } nodeId="6" label="1620-1650 milj. v. sitten" />
              <TreeItem TransitionComponent={TransitionComponent} classes={ treeItemStyles } icon={ <SvgIcon fontSize="small">{ folderIconPath }</SvgIcon> } nodeId="7" label="1900 milj. v. vanhat blaablaa" />
            </TreeItem>
            <TreeItem TransitionComponent={TransitionComponent} classes={ treeItemStyles }  icon={ <MenuIcon fontSize="small" /> } nodeId="8" label="2. Poimuvuoriston muodostuminen">
              <TreeItem TransitionComponent={TransitionComponent} classes={ treeItemStyles } icon={ <SvgIcon fontSize="small">{ pageIconPath }</SvgIcon> } nodeId="9" label="1620-1650 milj. v. sitten" />
              <TreeItem TransitionComponent={TransitionComponent} classes={ treeItemStyles } icon={ <SvgIcon fontSize="small">{ pageIconPath }</SvgIcon> } nodeId="10" label="1900 milj. v. vanhat blaablaa" />
            </TreeItem>
          </TreeItem>
          <TreeItem TransitionComponent={TransitionComponent} classes={ treeItemStyles } icon={ <MenuIcon fontSize="small" /> } nodeId="11" label="Mikä on Saimaa Geopark?">
            <TreeItem TransitionComponent={TransitionComponent} classes={ treeItemStyles } icon={ <MenuIcon fontSize="small" /> } nodeId="12" label="Miksi se on olemassa?">
              <TreeItem TransitionComponent={TransitionComponent} classes={ treeItemStyles } icon={ <SvgIcon fontSize="small">{ pageIconPath }</SvgIcon> } nodeId="13" label="Löydä Saimaa" />
              <TreeItem TransitionComponent={TransitionComponent} classes={ treeItemStyles } icon={ <SvgIcon fontSize="small">{ pageIconPath }</SvgIcon> } nodeId="14" label="Taustakuva" />
            </TreeItem>
          </TreeItem>
        </TreeItem>
      </TreeView>
    </div>
    );
  }

  /**
   * Render editor method
   */
  private renderEditor = () => {
    const { classes } = this.props;
    return (
      <main className={classes.content}>
        <Typography paragraph>
          Se ois niinq setuppi tässä.
        </Typography>
      </main>
    );
  }

  /**
   * Toggle mobile drawer open/close
   */
  private handleDrawerToggle = () => {
    this.setState({ mobileOpen: !this.state.mobileOpen });
  }
}

export default withStyles(styles)(ApplicationEditor);