/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from "react";
// tslint:disable-next-line: max-line-length
import {
  Typography,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Hidden,
  AppBar,
  Toolbar,
  IconButton,
  WithStyles,
  withStyles,
  Drawer,
  SvgIcon,
  Button,
  Dialog
} from "@material-ui/core";
import { History } from "history";
import TreeView from "@material-ui/lab/TreeView";
import SettingsIcon from "@material-ui/icons/Settings";
import MenuIcon from "@material-ui/icons/Menu";
import TreeItem from "@material-ui/lab/TreeItem";
import TransitionComponent from "../generic/TransitionComponent";
import AppSettingsView from "../views/AppSettingsView";
import strings from "../../localization/strings";
import styles from "../../styles/editor-view";
import { ReduxState, ReduxActions } from "../../store";
import { Dispatch } from "redux";
import { connect } from "react-redux";
import { AuthState } from "../../types";
import ApiUtils from "../../utils/ApiUtils";
import { Customer, Device, Application, Resource } from "../../generated/client/src";
import ResourceTreeItem from "../generic/ResourceTreeItem";
import AddResourceDialog from "../generic/AddResourceDialog";
import ResourceSettingsView from "../views/ResourceSettingsView";
import { updateResources } from "../../actions/resources";
import { ResourceState } from "../../reducers/resources";

const addIconPath = (
  <path d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7zm-1-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
);

interface Props extends WithStyles<typeof styles> {
  history: History;
  customerId: string;
  deviceId: string;
  applicationId: string;
  auth: AuthState;
  resources: Resource[];
  updateResources: typeof updateResources;
}

interface State {
  addResourceDialogOpen: boolean;
  parentResourceId?: string;
  mobileOpen: boolean;
  customer?: Customer;
  device?: Device;
  application?: Application;
  rootResources: Resource[];
  openedResource?: Resource;
  afterResourceSave?: (resource: Resource) => void;
}

class ApplicationEditor extends React.Component<Props, State> {
  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      addResourceDialogOpen: false,
      mobileOpen: false,
      rootResources: []
    };
  }

  public componentDidMount = async () => {
    const { auth, customerId, deviceId, applicationId, updateResources } = this.props;

    if (!auth || !auth.token) {
      return;
    }

    const customersApi = ApiUtils.getCustomersApi(auth.token);
    const devicesApi = ApiUtils.getDevicesApi(auth.token);
    const applicationsApi = ApiUtils.getApplicationsApi(auth.token);
    const resourcesApi = ApiUtils.getResourcesApi(auth.token);

    const [customer, device, application] = await Promise.all([
      customersApi.findCustomer({ customer_id: customerId }),
      devicesApi.findDevice({ customer_id: customerId, device_id: deviceId }),
      applicationsApi.findApplication({ customer_id: customerId, device_id: deviceId, application_id: applicationId })
    ]);

    const rootResources = await resourcesApi.listResources({
      customer_id: customerId,
      device_id: deviceId,
      application_id: applicationId,
      parent_id: application.root_resource_id
    });

    updateResources(rootResources);

    this.setState({
      customer: customer,
      device: device,
      application: application
    });
  };

  /**
   * Component render method
   */
  public render() {
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        <AppBar elevation={0} position="relative" className={classes.appBar}>
          <Toolbar>
            <IconButton color="inherit" aria-label="open drawer" edge="start" onClick={this.handleDrawerToggle} className={classes.menuButton}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h3" noWrap>
              {!this.state.openedResource && this.state.application && this.state.application.name + " " + strings.applicationSettings}
              {this.state.openedResource && this.state.openedResource.name + " " + strings.resourceSettings}
            </Typography>
          </Toolbar>
        </AppBar>
        {this.renderResponsiveDrawer()}
        {this.renderEditor()}
      </div>
    );
  }

  /**
   * Render responsive drawer method
   */
  private renderResponsiveDrawer = () => {
    const { classes } = this.props;

    console.log("PLÄÄÄ");

    return (
      <nav className={classes.drawer} aria-label="mailbox folders">
        <Drawer
          classes={{
            paper: classes.drawerPaper
          }}
          variant="permanent"
          anchor="left"
          open
        >
          {this.renderDrawer()}
        </Drawer>
      </nav>
    );
  };

  /**
   * Render drawer method
   */
  private renderDrawer = () => {
    const { classes, resources } = this.props;

    const treeItems = resources
      .map(resource => this.renderTreeItem(resource))
      .sort((a, b) => {
        return a.props.orderNumber - b.props.orderNumber;
      });

    return (
      <div>
        <List>
          <ListItem button onClick={() => this.setState({ openedResource: undefined })}>
            <ListItemIcon>
              <SettingsIcon color="primary" />
            </ListItemIcon>
            <ListItemText primary={strings.applicationSettings} />
          </ListItem>
        </List>
        <Divider />
        <TreeView classes={{ root: classes.treeRoot }}>
          {treeItems}
          {this.renderAdd()}
        </TreeView>
        <AddResourceDialog
          open={this.state.addResourceDialogOpen}
          parentResourceId={this.state.parentResourceId || ""}
          onSave={this.onSaveNewResourceClick}
          handleClose={this.onDialogCloseClick}
        />
      </div>
    );
  };

  /**
   * Render treeItem method
   */
  private renderTreeItem = (resource: Resource) => {
    const { classes, customerId, deviceId, applicationId } = this.props;
    const orderNumber = resource.order_number;

    return (
      <ResourceTreeItem
        key={resource.id}
        resource={resource}
        orderNumber={orderNumber || 0}
        customerId={customerId}
        deviceId={deviceId}
        applicationId={applicationId}
        classes={classes}
        onOpenResource={this.onOpenResourceClick}
        onDelete={this.onChildDelete}
        onAddClick={this.onChildAddClick}
      />
    );
  };

  private onChildDelete = (childResourceId: string) => {
    const { rootResources } = this.state;
    this.setState({
      rootResources: rootResources.filter(c => c.id !== childResourceId)
    });
  };

  private onChildAddClick = (parentResourceId: string, afterSave: (resource: Resource) => void) => {
    this.setState({
      afterResourceSave: afterSave,
      addResourceDialogOpen: true,
      parentResourceId: parentResourceId
    });
  };

  /**
   * Render editor method
   */
  private renderEditor = () => {
    const { classes, customerId } = this.props;
    const { openedResource, application } = this.state;

    if (openedResource && openedResource != null) {
      return (
        <main className={classes.content}>
          <ResourceSettingsView resource={openedResource} customerId={customerId} onUpdate={this.onUpdateResource} onDelete={this.onDeleteResource} />
        </main>
      );
    } else if (application && application != null) {
      return (
        <main className={classes.content}>
          <AppSettingsView application={application} onUpdate={this.onUpdateApplication} />
        </main>
      );
    } else {
      return <main className={classes.content}></main>;
    }
  };

  /**
   * Render add resource treeItem method
   */
  private renderAdd = () => {
    const parentResourceId = this.state.application && this.state.application.root_resource_id;

    if (!parentResourceId) {
      return <TreeItem nodeId={"loading"} label={strings.loading} />;
    }

    return (
      <TreeItem
        TransitionComponent={TransitionComponent}
        nodeId={parentResourceId + "add"}
        icon={<SvgIcon fontSize="small">{addIconPath}</SvgIcon>}
        onClick={() => this.onAddNewResourceClick(parentResourceId)}
        label={strings.addNewResource}
      />
    );
  };

  /**
   * Toggle mobile drawer open/close
   */
  private handleDrawerToggle = () => {
    this.setState({ mobileOpen: !this.state.mobileOpen });
  };

  /**
   * on add resource click method
   */
  private onAddNewResourceClick = (parentResourceId: string) => {
    this.setState({
      addResourceDialogOpen: true,
      parentResourceId: parentResourceId
    });
  };

  /**
   * on open resource click method
   */
  private onOpenResourceClick = async (resource: Resource) => {
    const { auth } = this.props;
    if (!auth || !auth.token || !resource.id) {
      return;
    }

    this.setState({
      openedResource: resource
    });
  };

  /**
   * on save new resource method
   */
  private onSaveNewResourceClick = async (resource: Resource) => {
    const { auth, customerId, deviceId, applicationId } = this.props;
    const { rootResources } = this.state;

    if (!auth || !auth.token) {
      return;
    }

    const resourcesApi = ApiUtils.getResourcesApi(auth.token);
    const newResource = await resourcesApi.createResource({
      customer_id: customerId,
      device_id: deviceId,
      application_id: applicationId,
      resource: resource
    });

    if (this.state.afterResourceSave) {
      this.state.afterResourceSave(newResource);
    } else {
      rootResources.push(newResource);
    }

    this.setState({
      afterResourceSave: undefined,
      addResourceDialogOpen: false,
      rootResources: rootResources
    });
  };

  /**
   * Update resource method
   *
   * TODO: handle error if resourceId was undefined
   */
  private onUpdateResource = async (resource: Resource) => {
    const { auth, customerId, deviceId, applicationId, resources, updateResources } = this.props;
    const resourceId = resource.id;

    if (!auth || !auth.token || !resourceId) {
      return;
    }

    const resourcesApi = ApiUtils.getResourcesApi(auth.token);
    const updatedResource = await resourcesApi.updateResource({
      resource: resource,
      customer_id: customerId,
      device_id: deviceId,
      application_id: applicationId,
      resource_id: resourceId
    });

    const resourceList: Resource[] = [...resources];
    const foundDeprecatedResourceIndex = resources.findIndex(item => item.id === resource.id);

    resourceList[foundDeprecatedResourceIndex] = updatedResource;

    updateResources(resourceList);

    this.setState({
      openedResource: updatedResource
    });
  };

  /**
   * Delete resource method
   */
  private onDeleteResource = async (resource: Resource) => {
    const { auth, customerId, deviceId, applicationId } = this.props;
    const resourceId = resource.id;

    if (!auth || !auth.token || !resourceId) {
      return;
    }

    const resourcesApi = ApiUtils.getResourcesApi(auth.token);
    const childResources = await resourcesApi.listResources({
      customer_id: customerId,
      device_id: deviceId,
      application_id: applicationId,
      parent_id: resourceId
    });

    /**
     * TODO: prettier delete confirmation
     */
    if (window.confirm(`${strings.deleteResourceDialogDescription} ${resource.name} ${childResources && strings.andAllChildren}?`)) {
      await resourcesApi.deleteResource({ customer_id: customerId, device_id: deviceId, application_id: applicationId, resource_id: resourceId });

      this.setState({
        openedResource: undefined
      });
    }
  };

  /**
   * Update application method
   */
  private onUpdateApplication = async (application: Application) => {
    const { auth, customerId, deviceId, applicationId } = this.props;

    if (!auth || !auth.token) {
      return;
    }

    const applicationsApi = ApiUtils.getApplicationsApi(auth.token);
    const updatedApplication = await applicationsApi.updateApplication({
      application: application,
      customer_id: customerId,
      device_id: deviceId,
      application_id: applicationId
    });

    this.setState({
      application: updatedApplication
    });
  };

  /**
   * Close dialog method
   *
   * TODO: handle prompt if unsaved
   */
  private onDialogCloseClick = () => {
    this.setState({ addResourceDialogOpen: false });
  };
}

const mapStateToProps = (state: ReduxState) => ({
  auth: state.auth,
  resources: state.resource.resources
});

const mapDispatchToProps = (dispatch: Dispatch<ReduxActions>) => {
  return {
    updateResources: (resources: Resource[]) => dispatch(updateResources(resources))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(ApplicationEditor));
