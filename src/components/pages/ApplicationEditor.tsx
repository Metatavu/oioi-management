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
import { Customer, Device, Application, Resource, ResourceType } from "../../generated/client/src";
import ResourceTreeItem from "../generic/ResourceTreeItem";
import AddResourceDialog from "../generic/AddResourceDialog";
import ResourceSettingsView from "../views/ResourceSettingsView";
import { setCustomer } from "../../actions/customer";
import { setDevice } from "../../actions/device";
import { setApplications } from "../../actions/applications";
import { updateResources, openResource, updatedResourceView } from "../../actions/resources";
import SortableTree, { TreeItem as TreeItemSortable, NodeData, FullTree, OnMovePreviousAndNextLocation, ExtendedNodeData, changeNodeAtPath, OnDragPreviousAndNextLocation } from 'react-sortable-tree';
import FileExplorerTheme from 'react-sortable-tree-theme-file-explorer';
import MenuResourceSettingsView from "../views/MenuResourceSettingsView";

const addIconPath = (
  <path d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7zm-1-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
);

/**
 * Component props
 */
interface Props extends WithStyles<typeof styles> {
  history: History;
  customerId: string;
  deviceId: string;
  applicationId: string;
  auth: AuthState;
  setCustomer: typeof setCustomer;
  setDevice: typeof setDevice;
  setApplications: typeof setApplications;
  resources: Resource[];
  openedResource?: Resource;
  resourceViewUpdated: number;
  updateResources: typeof updateResources;
  openResource: typeof openResource;
  updatedResourceView: typeof updatedResourceView;
}

interface State {
  addResourceDialogOpen: boolean;
  parentResourceId?: string;
  mobileOpen: boolean;
  customer?: Customer;
  device?: Device;
  application?: Application;
  openedResource?: Resource;
  treeData?: ResourceTreeItem[];
}

interface ResourceTreeItem extends TreeItemSortable {
  id?: string;
  resource: Resource;
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
    };
  }

  /**
   * Component did mount
   */
  public componentDidMount = async () => {
    await this.fetchResourceData();
    await this.loadTree();
  };

  public componentDidUpdate = async (prevProps: Props, prevState: State) => {
    if (prevProps.resourceViewUpdated !== this.props.resourceViewUpdated) {
      await this.fetchResourceData();
    }
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
        { this.renderResponsiveDrawer()}
        {this.renderEditor()}
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
        <Drawer
          classes={{
            paper: classes.drawerPaper
          }}
          variant="permanent"
          anchor="left"
          open
        >
          { this.renderDrawer() }
        </Drawer>
      </nav>
    );
  };

  /**
   * Render drawer method
   */
  private renderDrawer = () => {
    const { auth, resources } = this.props;
    const { parentResourceId, customer, device, application } = this.state;
    let { treeData } = this.state;
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
        { treeData &&
          <SortableTree 
          style={{ height: 700, padding: 3 }}
          rowHeight={ 30 }
          treeData={ treeData }
          onChange={ this.setTreeData }
          onMoveNode={ this.moveResource }
          canDrop={ this.canDrop }
          canDrag={ this.canDrag }
          canNodeHaveChildren={ this.canHaveChildren }
          theme={ FileExplorerTheme }
          />
        }
        <AddResourceDialog
          open={this.state.addResourceDialogOpen}
          auth={auth}
          resources={ resources }
          customerId={customer ? customer.id : ""}
          deviceId={device ? device.id : ""}
          applicationId={application ? application.id : ""}
          rootResourceId={application ? application.root_resource_id : ""}
          parentResourceId={parentResourceId || ""}
          onSave={this.onSaveNewResourceClick}
          handleClose={this.onDialogCloseClick}
        />
      </div>
    );
  };

  /**
   * Loads entire tree
   */
  private loadTree = async () => {
    const { application } = this.state;
    const treeData: ResourceTreeItem[] = await Promise.all(
      this.props.resources.map( async (resource) => {
        return await {
          title: this.renderTreeItem(resource),
          children: await this.loadTreeChildren(resource.id || "", resource),
          resource: resource
        }
      })
    );
    treeData.push({
      title: this.renderAdd(application!.root_resource_id || "")
    } as ResourceTreeItem);
    this.setState({
      treeData: treeData
    });
  }

  /**
   * Loads all children of the parent
   * 
   * @param parent_id id of tree item parent
   */
  private loadTreeChildren = async (parent_id: string, parent:Resource): Promise<ResourceTreeItem[]> => {
    const { auth, customerId, deviceId, applicationId } = this.props;
    const data: ResourceTreeItem[] = [];
    if (!auth || !auth.token) {
      return data;
    }
    let childResources: Resource[] = [];
    const resourcesApi = ApiUtils.getResourcesApi(auth.token);
    try {
      childResources = await resourcesApi.listResources({
        customer_id: customerId,
        device_id: deviceId,
        application_id: applicationId,
        parent_id: parent_id
      });
    } catch (error) {
      // no children found
    }

    const childResourcePromises = childResources.map(async (resource) => {
      return {
        title: this.renderTreeItem(resource),
        children: await this.loadTreeChildren(resource.id || "", resource),
        resource: resource
      } as ResourceTreeItem;
    });

    const addNewChild = new Promise<ResourceTreeItem>((resolve, reject) => {
      resolve({
        title: this.renderAdd(parent_id)
      } as ResourceTreeItem);
    });

    if (this.canHaveChildren({ title: "", resource: parent })) {
      childResourcePromises.push(addNewChild);
    }
    
    return await Promise.all(childResourcePromises);
  }

  /**
   * Sets tree data
   * 
   * @param data updated tree data object
   */
  private setTreeData = (data: ResourceTreeItem[]) => {
    this.setState({
      treeData: data
    });
  }

  /**
   * Moves resource under new parent
   * 
   * @param data tree data change info object
   */
  private moveResource = async (data: NodeData & FullTree & OnMovePreviousAndNextLocation) => {
    const { resources, updateResources, auth, customerId, deviceId, applicationId } = this.props;
    if (!auth || !auth.token) {
      return null;
    }
    try {
      const resourcesApi = ApiUtils.getResourcesApi(auth.token);
      if (data.nextParentNode && data.nextParentNode.children && Array.isArray(data.nextParentNode.children)) {
        data.nextParentNode.children.forEach( async (child, index) => {
          const resource = child.resource;
          if (resource) {
            resource.order_number = index + 1;
            await resourcesApi.updateResource({
              resource: resource,
              customer_id: customerId,
              device_id: deviceId,
              application_id: applicationId,
              resource_id: resource.id || ""
            });
          }
        });
      }
      updateResources(resources);
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * Returns boolean value based on check whether item can be dragged
   * 
   * @param data tree data object
   */
  private canDrag = (data: ExtendedNodeData) => {
    if (data.node.resource) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Returns boolean value based on check whether item can be dropped
   */
  private canDrop = (data: OnDragPreviousAndNextLocation & NodeData) => {
    if ((data.nextParent && !this.canHaveChildren(data.nextParent)) || (data.nextParent && data.nextParent.children && Array.isArray(data.nextParent.children) && data.nextParent.children[data.nextParent.children.length - 1] === data.node) || (!data.nextParent && data.nextTreeIndex === this.props.resources.length)) {
      return false;
    }
    return true;
  }

  /**
   * Returns boolean value based on check whether item can have children
   * 
   * @param node node to check
   */
  private canHaveChildren = (node: TreeItemSortable) => {
    if (node.resource && node.resource.type !== ResourceType.IMAGE && node.resource.type !== ResourceType.PDF && node.resource.type !== ResourceType.TEXT && node.resource.type !== ResourceType.VIDEO) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Render treeItem method
   */
  private renderTreeItem = (resource: Resource) => {
    const { classes, customerId, deviceId, applicationId } = this.props;

    return (
      <ResourceTreeItem
        key={resource.id}
        resource={resource}
        customerId={customerId}
        deviceId={deviceId}
        applicationId={applicationId}
        classes={classes}
        onOpenResource={this.onOpenResourceClick}
        onDelete={this.onChildDelete}
      />
    );
  };

  /**
   * Render editor method
   */
  private renderEditor = () => {
    const { classes, customerId, openedResource } = this.props;
    const { application } = this.state;
    if (openedResource) {
      return (
        <main className={classes.content}>
          { this.renderResourceSettingsView(openedResource, customerId) }
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

  private renderResourceSettingsView = (resource: Resource, customerId: string) => {
    const { auth, deviceId, applicationId } = this.props;

    switch (resource.type) {
      case ResourceType.MENU:
      case ResourceType.LANGUAGE:
      case ResourceType.SLIDESHOW:
      case ResourceType.INTRO:
        return <MenuResourceSettingsView 
            resource={resource}
            customerId={customerId}
            onUpdate={this.onUpdateResource}
            onDelete={this.onDeleteResource}
            auth={ auth }
            deviceId={ deviceId }
            applicationId={ applicationId }
          />;
      default:
        return <ResourceSettingsView resource={resource} customerId={customerId} onUpdate={this.onUpdateResource} onDelete={this.onDeleteResource} />;

    }
  }

  /**
   * Render add resource treeItem method
   */
  private renderAdd = (parent_id?: string) => {
    if (!parent_id) {
      return <TreeItem nodeId={"loading"} label={strings.loading} />;
    }

    return (
      <TreeItem
        TransitionComponent={TransitionComponent}
        nodeId={parent_id + "add"}
        icon={<SvgIcon fontSize="small">{addIconPath}</SvgIcon>}
        onMouseUp={ () => this.onAddNewResourceClick(parent_id) }
        label={strings.addNewResource}
      />
    );
  };

  /**
   * Fetches resource data
   */
  private fetchResourceData = async () => {
    const { auth, customerId, deviceId, applicationId, setCustomer, setDevice, setApplications, updateResources } = this.props;

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

    setCustomer(customer);
    setDevice(device);
    setApplications([application]);
  };

  /**
   * Child delete
   */
  private onChildDelete = (childResourceId: string) => {
    const { openedResource, updatedResourceView, openResource } = this.props;
    const { treeData } = this.state;

    if (openedResource && openedResource.id === childResourceId) {
      openResource(undefined);
    }

    updatedResourceView();

    this.setState({
      treeData: this.treeDataDelete(childResourceId, treeData || [])
    });
  };

  /**
   * Deletes item and all of it's children from the tree
   * 
   * @param id id of the deleted item
   * @param data array of current search level
   */
  private treeDataDelete = (id: string, data: ResourceTreeItem[]): ResourceTreeItem[] => {
    return  data.filter(item => !item.resource || (item.resource.id !== id))
    .map((item) => {
      return {...item, children: (item.children) ? this.treeDataDelete(id, item.children as ResourceTreeItem[]) : [] }
    });
  }

  /**
   * Child add click
   */
  private onChildAddClick = (parentResourceId: string) => {
    this.setState({
      addResourceDialogOpen: true,
      parentResourceId: parentResourceId
    });
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
    const { openResource } = this.props;
    openResource(resource);
  };

  /**
   * on save new resource method
   */
  private onSaveNewResourceClick = async (resource: Resource) => {
    const { auth, customerId, deviceId, applicationId, updatedResourceView } = this.props;

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

    updatedResourceView();

    this.setState({
      addResourceDialogOpen: false,
      treeData: this.treeDataAdd(this.treeItemFromResource(newResource), this.state.treeData || [])
    });
  };

  /**
   * Changes resource to resource tree item
   * 
   * @param resource resource to be converted
   */
  private treeItemFromResource = (resource: Resource) => {
    return {
      title: this.renderTreeItem(resource),
      children: [],
      resource: resource
    }
  }

  /**
   * Adds item under the parent element
   * 
   * @param newItem item to be added
   * @param data array of current search level
   */
  private treeDataAdd = (newItem: ResourceTreeItem, data: ResourceTreeItem[]): ResourceTreeItem[] => {
    const { application } = this.state;
    const newItemWithAddButton = this.canHaveChildren(newItem as TreeItemSortable) ? {...newItem, children: [{ title: this.renderAdd(newItem.resource.id)} as ResourceTreeItem ]} : newItem;
    if (newItem.resource.parent_id === application!.root_resource_id) {
      return [...data.filter(item => item.resource), newItemWithAddButton, { title: this.renderAdd(newItemWithAddButton.resource.parent_id) } as ResourceTreeItem];
    }
    return data.map((item) => {
      if (item.resource && item.children && Array.isArray(item.children)) {
        return {...item, children: item.resource.id === newItem.resource.parent_id ? [...item.children.filter(item => item.resource) as ResourceTreeItem[], newItemWithAddButton, { title: this.renderAdd(newItem.resource.parent_id)} as ResourceTreeItem] as ResourceTreeItem[] : this.treeDataAdd(newItem, item.children as ResourceTreeItem[])};
      } else {
        return item;
      }
    });
  }

  /**
   * Update resource method
   *
   * TODO: handle error if resourceId was undefined
   */
  private onUpdateResource = async (resource: Resource) => {
    const { auth, customerId, deviceId, applicationId, updatedResourceView, openResource } = this.props;
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

    openResource(updatedResource);
    updatedResourceView();
  };

  /**
   * Delete resource method
   */
  private onDeleteResource = async (resource: Resource) => {
    const { auth, customerId, deviceId, applicationId, openResource } = this.props;
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

      openResource(undefined);

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

/**
 * Maps redux state to props
 *
 * @param state redux state
 */
const mapStateToProps = (state: ReduxState) => ({
  auth: state.auth,
  resources: state.resource.resources,
  openedResource: state.resource.resourceOpen,
  resourceViewUpdated: state.resource.resourceViewUpdated
});

/**
 * Function for declaring dispatch functions
 *
 * @param dispatch
 */
const mapDispatchToProps = (dispatch: Dispatch<ReduxActions>) => {
  return {
    setCustomer: (customer: Customer) => dispatch(setCustomer(customer)),
    setDevice: (device: Device) => dispatch(setDevice(device)),
    setApplications: (applications: Application[]) => dispatch(setApplications(applications)),
    updateResources: (resources: Resource[]) => dispatch(updateResources(resources)),
    updatedResourceView: () => dispatch(updatedResourceView()),
    openResource: (resource?: Resource) => dispatch(openResource(resource))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(ApplicationEditor));
