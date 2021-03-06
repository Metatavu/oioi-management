/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from "react";
// tslint:disable-next-line: max-line-length
import {
  Typography,
  Divider,
  List,
  ListItem,
  AppBar,
  WithStyles,
  withStyles,
  Drawer,
  Button,
  CircularProgress,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
} from "@material-ui/core";
import { History } from "history";
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
import { setApplication } from "../../actions/application";
import { openResource, updatedResourceView } from "../../actions/resources";
import SortableTree, { TreeItem as TreeItemSortable, NodeData, FullTree, OnMovePreviousAndNextLocation, ExtendedNodeData, OnDragPreviousAndNextLocation } from "react-sortable-tree";
import FileExplorerTheme from "react-sortable-tree-theme-file-explorer";
import MenuResourceSettingsView from "../views/MenuResourceSettingsView";
import AddIcon from "@material-ui/icons/AddCircle";
import ChevronRight from "@material-ui/icons/ChevronRight";
import PageResourceSettingsView from "../views/PageResourceSettingsView";
import theme from "../../styles/theme";
import { getLocalizedTypeString } from "../../commons/resourceTypeHelper";

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
  setApplication: typeof setApplication;
  customer?: Customer;
  device?: Device;
  application?: Application;
  openedResource?: Resource;
  resourceViewUpdated: number;
  openResource: typeof openResource;
  updatedResourceView: typeof updatedResourceView;
}

interface State {
  addResourceDialogOpen: boolean;
  parentResourceId?: string;
  rootResource?: Resource;
  treeData?: ResourceTreeItem[];
  confirmationRequired: boolean;
  treeResizing: boolean;
  treeWidth: number;
}

interface ResourceTreeItem extends TreeItemSortable {
  id?: string;
  resource?: Resource;
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
      confirmationRequired: false,
      treeResizing: false,
      treeWidth: 300
    };
  }

  public componentWillUnmount = () => {
    document.removeEventListener('mousemove', e => this.handleMousemove(e));
    document.removeEventListener('mouseup', e => this.handleMouseup(e));
  }

  /**
   * Component did mount
   */
  public componentDidMount = async () => {

    const { auth,
            customerId,
            deviceId,
            applicationId,
            setDevice,
            setCustomer,
            setApplication,
            customer,
            device,
            application,
            openResource,
            openedResource
          } = this.props;

    if (!auth || !auth.token) {
      return;
    }

    document.addEventListener('mousemove', e => this.handleMousemove(e));
    document.addEventListener('mouseup', e => this.handleMouseup(e));

    if (openedResource) {
      openResource(undefined);
    }
    const customersApi = ApiUtils.getCustomersApi(auth.token);
    const devicesApi = ApiUtils.getDevicesApi(auth.token);
    const applicationsApi = ApiUtils.getApplicationsApi(auth.token);
    const resourcesApi = ApiUtils.getResourcesApi(auth.token);

    let currentCustomer = customer;
    if (!currentCustomer || currentCustomer.id !== customerId) {
      currentCustomer = await customersApi.findCustomer({ customer_id: customerId });
      setCustomer(currentCustomer);
    }
    let currentDevice = device;
    if (!currentDevice || currentDevice.id !== deviceId) {
      currentDevice = await devicesApi.findDevice({ customer_id: customerId, device_id: deviceId });
      setDevice(currentDevice);
    }

    let currentApplication = application;
    if (!currentApplication || currentApplication.id !== applicationId) {
      currentApplication = await applicationsApi.findApplication({ customer_id: customerId, device_id: deviceId, application_id: applicationId });
      setApplication(currentApplication);
    }

    const rootResource = await resourcesApi.findResource({
      customer_id: customerId,
      device_id: deviceId,
      application_id: applicationId,
      resource_id: currentApplication.root_resource_id!
    });

    this.setState({
      rootResource: rootResource
    });
  };

  public componentDidUpdate = async (prevProps: Props, prevState: State) => {
    const prevRootResourceId = prevState.rootResource ? prevState.rootResource.id : undefined
    if (this.state.rootResource && this.state.rootResource.id !== prevRootResourceId) {
      await this.loadTree();
    }
    if (prevProps.openedResource && !this.props.openedResource) {
      this.setState({
        treeData: this.treeDataRenderAddButton(this.state.treeData || [], undefined)
      });
    }
  };

  /**
   * Component render method
   */
  public render() {
    const { classes, openedResource, resourceViewUpdated } = this.props;
    let resourceType = ResourceType.ROOT;

    if (openedResource) {
      resourceType = openedResource.type;
    }
    const localString = getLocalizedTypeString(resourceType);
    return (
      <div style={this.state.treeResizing ? { userSelect: "none" } : {}} className={ classes.root }>
        <AppBar elevation={ 0 } position="relative" className={ classes.appBar }>
          <div className={ classes.toolbar }>
            <Typography variant="h3" noWrap>
              { openedResource && localString }
            </Typography>
            <Button
              disableElevation
              className={ classes.deleteButton }
              color="primary"
              variant="contained"
              disabled={ openedResource ? false : true }
              onClick={ this.onChildDelete }
              >
              { strings.delete }
            </Button>
          </div>
        </AppBar>
        { this.renderResponsiveDrawer() }
        { this.renderEditor() }
      </div>
    );
  }

  private handleMousedown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    this.setState({ treeResizing: true });
  };
  
  private handleMousemove = (e: MouseEvent) => {
    if (!this.state.treeResizing) {
      return;
    }
  
    let offsetRight = (e.clientX - document.body.offsetLeft);
    let minWidth = 300;
    this.setState({ treeWidth: Math.max(minWidth, offsetRight) });
  };
  
  private handleMouseup = (e: MouseEvent )=> {
    if (this.state.treeResizing) {
      this.setState({ treeResizing: false });
    }
  };

  /**
   * Render responsive drawer method
   */
  private renderResponsiveDrawer = () => {
    const { classes } = this.props;

    return (
      <nav style={{width: this.state.treeWidth}} className={ classes.drawer } aria-label="mailbox folders">
        <Drawer
          classes={ { paper: classes.drawerPaper } }
          variant="permanent"
          anchor="left"
          PaperProps={{ style: { width: this.state.treeWidth }}}
          open
        >
          <div
            id="dragger"
            style={{left: this.state.treeWidth - 10}}
            onMouseDown={event => {
              this.handleMousedown(event);
            }}
            className={classes.dragger}
          />
          { this.renderDrawer() }
        </Drawer>
      </nav>
    );
  };

  /**
   * Render drawer method
   */
  private renderDrawer = () => {
    const { auth, classes, customer, device, application, openedResource } = this.props;
    const { parentResourceId } = this.state;
    const { treeData } = this.state;
    return (
      <>
        <List disablePadding>
          <ListItem style={{ height: 54 }} selected={ openedResource === undefined } button onClick={ () => this.props.openResource(undefined) }>
            <Typography variant="h4">{ strings.applicationSettings.settings }</Typography>
            <ListItemSecondaryAction>
              <ChevronRight />
            </ListItemSecondaryAction>
          </ListItem>
        </List>
        <Divider />
        { treeData &&
          <>
            { this.renderAdd(this.props.application!.root_resource_id) }
            <SortableTree
              className={ classes.treeWrapper }
              rowHeight={ 48 }
              treeData={ treeData }
              onChange={ this.setTreeData }
              onMoveNode={ this.moveResource }
              canDrop={ this.canDrop }
              canDrag={ this.canDrag }
              canNodeHaveChildren={ this.canHaveChildren }
              theme={ FileExplorerTheme }
            />
          </>
        }
        { !treeData &&
          <div style={{ padding: "1rem" }}><CircularProgress /></div>
        }
        <AddResourceDialog
          open={ this.state.addResourceDialogOpen }
          auth={ auth}
          customerId={ customer ? customer.id : "" }
          deviceId={ device ? device.id : "" }
          applicationId={ application ? application.id : "" }
          rootResourceId={ application ? application.root_resource_id : "" }
          parentResourceId={ parentResourceId || "" }
          onSave={ this.onSaveNewResourceClick }
          handleClose={ this.onDialogCloseClick }
        />
      </>
    );
  };

  /**
   * Loads entire tree
   */
  private loadTree = async () => {
    const { application, customer, device, auth } = this.props;
    const { rootResource } = this.state;
    if (!rootResource || !auth || !auth.token || !application || !customer || !device) {
      return;
    }
    const topLevelResources = await ApiUtils.getResourcesApi(auth.token).listResources({
      application_id: application.id!,
      customer_id: customer.id!,
      device_id: device.id!,
      parent_id: rootResource.id
    });
    const treeData: ResourceTreeItem[] = await Promise.all(
      topLevelResources.map( async resource => {
        return await {
          title: this.renderTreeItem(resource),
          children: await this.loadTreeChildren(resource.id || "", resource),
          resource: resource
        };
      })
    );
    this.setState({
      treeData: treeData
    });
  }

  /**
   * Loads all children of the parent
   *
   * @param parentId id of tree item parent
   */
  private loadTreeChildren = async (parent_id: string, parent: Resource): Promise<ResourceTreeItem[]> => {
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

    const childResourcePromises = childResources.map(async resource => {
      return {
        title: this.renderTreeItem(resource),
        children: await this.loadTreeChildren(resource.id || "", resource),
        resource: resource
      } as ResourceTreeItem;
    });

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
    const { auth, customerId, deviceId, applicationId, application } = this.props;
    const { treeData } = this.state;
    if (!auth || !auth.token) {
      return null;
    }
    try {
      const resourcesApi = ApiUtils.getResourcesApi(auth.token);
      if (treeData && data.nextParentNode && data.nextParentNode.children && Array.isArray(data.nextParentNode.children)) {
        data.nextParentNode.children
        .filter(child => child.resource)
        .forEach((child, index) => {
          const resource = child.resource;
          resource.order_number = index + 1;
          resource.parent_id = data.nextParentNode!.resource.id;
          resourcesApi.updateResource({
            resource: resource,
            customer_id: customerId,
            device_id: deviceId,
            application_id: applicationId,
            resource_id: resource.id || ""
          });
        });
        this.setState({
          treeData: this.treeDataRearrange(treeData, application ? application.root_resource_id! : "", data.nextParentNode.resource.id)
        });
      } else if (treeData) {
        (treeData as TreeItemSortable[])
        .filter((child: TreeItemSortable) => child.resource)
        .forEach((child: TreeItemSortable, index: number) => {
          const resource = child.resource;
          resource.order_number = index + 1;
          resourcesApi.updateResource({
            resource: resource,
            customer_id: customerId,
            device_id: deviceId,
            application_id: applicationId,
            resource_id: resource.id || ""
          });
        });
        this.setState({
          treeData: this.treeDataRearrange(treeData, application ? application.root_resource_id! : "", application ? application.root_resource_id! : "")
        });
      }
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * Rearranges tree data layer
   *
   * @param treeData current tree data layer
   * @param parent_id parent id of the current layer
   * @param changes_id parent id of the layer that needs to be rearranged
   */
  private treeDataRearrange = (treeData: ResourceTreeItem[], parent_id: string, changes_id: string): ResourceTreeItem[] => {
    if (parent_id === changes_id) {
      return [...treeData
      .filter(data => data.resource)
      .sort((a, b) => {
        return (a.resource!.order_number || 0) - (b.resource!.order_number || 0);
      }), {
        title: this.renderAdd(changes_id)
      } as ResourceTreeItem];
    }
    return treeData.map((data) => {
      return {...data, children: data.children && Array.isArray(data.children) && data.resource && data.resource.id ? this.treeDataRearrange(data.children as ResourceTreeItem[], data.resource.id, changes_id) : []};
    });
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
    if ((data.nextParent && !this.canHaveChildren(data.nextParent)) || (!this.typeCheck(data.nextParent ? data.nextParent.resource : undefined, data.node.resource))) {
      return false;
    }
    return true;
  }

  /**
   * Returns boolean value based on whether parent and child are compatible
   *
   * @param parent parent resource
   * @param child child resource
   */
  private typeCheck = (parent?: Resource, child?: Resource) => {
    if (parent && child) {
      switch(parent.type) {
        case ResourceType.INTRO:
          if (child.type === ResourceType.PAGE) {
            return true;
          }
          return false;
        case ResourceType.LANGUAGEMENU:
          if (child.type === ResourceType.LANGUAGE) {
            return true;
          }
          return false;
        case ResourceType.LANGUAGE:
          if (child.type === ResourceType.MENU || child.type === ResourceType.SLIDESHOW) {
            return true;
          }
          return false;
        case ResourceType.MENU:
          if (child.type === ResourceType.SLIDESHOW || child.type === ResourceType.MENU) {
            return true;
          }
          return false;
        case ResourceType.SLIDESHOW:
          if (child.type === ResourceType.PAGE) {
            return true;
          }
          return false;
        case ResourceType.PAGE:
          if (child.type === ResourceType.VIDEO || child.type === ResourceType.TEXT || child.type === ResourceType.PDF || child.type === ResourceType.IMAGE) {
            return true;
          }
          return false;
        default:
          return false;
      }
    } else if (child && (child.type === ResourceType.INTRO || child.type === ResourceType.LANGUAGEMENU)) {
      return true;
    } else {
      return false;
    }
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
    const { classes, customerId, deviceId, applicationId, openedResource } = this.props;

    return (
      <ResourceTreeItem
        key={ resource.id }
        resource={ resource }
        customerId={ customerId }
        deviceId={ deviceId }
        applicationId={ applicationId }
        classes={ classes }
        onOpenResource={ this.onOpenResourceClick }
        onDelete={ this.onChildDelete }
      />
    );
  };

  /**
   * Render editor method
   */
  private renderEditor = () => {
    const { classes, customerId, deviceId, openedResource, application, auth } = this.props;
    const { rootResource } = this.state;
    if (!rootResource) {
      return (
        <main className={ classes.content }>
          <CircularProgress />
        </main>
      ); 
    }
    if (openedResource) {
      return (
        <main className={ classes.content }>
          { this.renderResourceSettingsView(openedResource, customerId) }
        </main>
      );
    } else if (application) {
      return (
        <main className={ classes.content }>
          <AppSettingsView
            auth={ auth }
            application={ application }
            confirmationRequired={ this.confirmationRequired }
            onUpdateApplication={ this.onUpdateApplication }
            onUpdateRootResource={ this.onUpdateResource }
            rootResource={ rootResource }
            customerId={ customerId }
            deviceId={ deviceId }
          />
        </main>
      );
    } else {
      return <main className={ classes.content }></main>;
    }
  };

  private renderResourceSettingsView = (resource: Resource, customerId: string) => {
    const { auth, deviceId, applicationId, resourceViewUpdated } = this.props;

    switch (resource.type) {
      case ResourceType.MENU:
      case ResourceType.LANGUAGE:
      case ResourceType.LANGUAGEMENU:
      case ResourceType.SLIDESHOW:
      case ResourceType.INTRO:
        return <MenuResourceSettingsView
          resource={ resource }
          customerId={ customerId }
          confirmationRequired={ this.confirmationRequired }
          onUpdate={ this.onUpdateResource }
          onDelete={ this.onDeleteResource }
          resourcesUpdated={ resourceViewUpdated }
          auth={ auth }
          deviceId={ deviceId }
          applicationId={ applicationId }
        />;
      case ResourceType.PAGE:
        return <PageResourceSettingsView
          resource={ resource }
          customerId={ customerId }
          resourcesUpdated={ resourceViewUpdated }
          confirmationRequired={ this.confirmationRequired }
          onAddChild={ this.onAddNewResourceClick }
          onSave={ this.onUpdateResource }
          onSaveChildren={ this.onUpdateChildResources }
          onDelete={ this.onDeleteResource }
          onDeleteChild={ this.onDeleteResource }
          auth={ auth }
          deviceId={ deviceId }
          applicationId={ applicationId }
        />;
      default:
        return <ResourceSettingsView
          resource={ resource }
          customerId={ customerId }
          onUpdate={ this.onUpdateResource }
          onDelete={ this.onDeleteResource }
          confirmationRequired={ this.confirmationRequired }
        />;
    }
  }

  /**
   * Render add resource treeItem method
   */
  private renderAdd = (parent_id?: string) => {
    const { classes } = this.props;
    const { treeData } = this.state;

    if (!parent_id) {
      return;
    }

    if (parent_id === this.props.application!.root_resource_id) {
      if (treeData && (!treeData.find(data => data.resource && data.resource.type === ResourceType.INTRO) || !treeData.find(data => data.resource && data.resource.type === ResourceType.LANGUAGEMENU))) {
        return (
          <>
            <ListItem className={ classes.treeAddItem } onClick={ () => this.onAddNewResourceClick(parent_id) } key={ parent_id + "add" }>
              <ListItemIcon style={ { minWidth: 0, marginRight: theme.spacing(1) } }><AddIcon /></ListItemIcon>
              <ListItemText className={ classes.addResourceBtnText } primary={ strings.addNewIntroOrLanguageMenu } />
            </ListItem>
          </>
        );
      } else {
        return;
      }
    }

    return (
      <ListItem className={ classes.treeAddItem } onClick={ () => this.onAddNewResourceClick(parent_id) } key={ parent_id + "add" }>
        <ListItemIcon style={ { minWidth: 0, marginRight: theme.spacing(1) } }><AddIcon /></ListItemIcon>
        <ListItemText className={ classes.addResourceBtnText } primary={ strings.addNew } />
      </ListItem>
    );
  };

  /**
   * Child delete
   */
  private onChildDelete = async () => {
    const { auth, openedResource, openResource, customerId, deviceId, applicationId, updatedResourceView } = this.props;
    const { treeData } = this.state;
    if (!auth || !auth.token) {
      return;
    }
    const resourcesApi = ApiUtils.getResourcesApi(auth.token);
    if (openedResource && window.confirm(`${strings.deleteResourceDialogDescription} ${openedResource.name} ${ strings.andAllChildren}?`)) {
      const childResourceId = openedResource.id;
      openResource(undefined);
      updatedResourceView();
      if (childResourceId) {
        await resourcesApi.deleteResource({ customer_id: customerId, device_id: deviceId, application_id: applicationId, resource_id: openedResource.id || "" });
        this.setState({
          treeData: this.treeDataDelete(childResourceId, treeData || [])
        });
      }
    }
  };

  /**
   * Deletes item and all of it's children from the tree
   * 
   * @param id id of the deleted item
   * @param data array of current search level
   */
  private treeDataDelete = (id: string, data: ResourceTreeItem[]): ResourceTreeItem[] => {
    return  data.filter(item => !item.resource || (item.resource.id !== id))
    .map(item => {
      return { ...item, children: (item.children) ? this.treeDataDelete(id, item.children as ResourceTreeItem[]) : [] };
    });
  }

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
    const { confirmationRequired, treeData } = this.state;
    if (confirmationRequired) {
      if (window.confirm(`${strings.continueWithoutSaving}`)) {
        openResource(resource);
        this.setState({
          confirmationRequired: false
        });
      }
      return;
    }
    openResource(resource);
    this.setState({
      treeData: this.treeDataRenderAddButton(treeData || [], resource || "")
    });
  };

  /**
   * Renders add button under the chosen resource
   * 
   * @param data tree data object
   * @param resource resource
   */
  private treeDataRenderAddButton = (data: ResourceTreeItem[], resource?: Resource): ResourceTreeItem[] => {
    if (!resource) {
      return data.filter(item => item.resource).map((item) => { return {...item, children: item.children && Array.isArray(item.children) ? this.treeDataRenderAddButton(item.children, resource) : []} })
    }
    return data
    .filter(item => item.resource)
    .map((item) => {
      if (resource.id === item.resource!.id && this.canHaveChildren(item as TreeItemSortable)) {
        return {...item, children: item.children && Array.isArray(item.children) ? [...this.treeDataRenderAddButton(item.children as ResourceTreeItem[], resource), { title: this.renderAdd(resource.id) }] : [{ title: this.renderAdd(resource.id) }]}
      }
      return {...item, children: item.children ? this.treeDataRenderAddButton(item.children as ResourceTreeItem[], resource) : [] };
    });
  }

  /**
   * on save new resource method
   */
  private onSaveNewResourceClick = async (resource: Resource, copyContentFromId?: string) => {
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

    if (newResource.type == ResourceType.PAGE) {
      await this.createPagePredefinedResources(newResource.id!);
    }

    if (copyContentFromId) {
      await this.copyContentFrom(copyContentFromId, newResource.id!);
    }
  };

  private createPagePredefinedResources = async (pageId: string) => {
    const { auth, customerId, deviceId, applicationId } = this.props;

    if (!auth || !auth.token) {
      return;
    }
    const resourcesApi = ApiUtils.getResourcesApi(auth.token);
    const title = await resourcesApi.createResource({
      application_id: applicationId,
      customer_id: customerId,
      device_id: deviceId,
      resource: {
        name: "Otsikko",
        slug: "title",
        type: ResourceType.TEXT,
        order_number: 1,
        parent_id: pageId
      }
    });
    this.setState({ treeData: this.treeDataAdd(this.treeItemFromResource(title), this.state.treeData || []) });

    const ingress = await resourcesApi.createResource({
      application_id: applicationId,
      customer_id: customerId,
      device_id: deviceId,
      resource: {
        name: "Ingressi",
        slug: "nameText",
        type: ResourceType.TEXT,
        order_number: 2,
        parent_id: pageId
      }
    });
    this.setState({ treeData: this.treeDataAdd(this.treeItemFromResource(ingress), this.state.treeData || []) });

    const content = await resourcesApi.createResource({
      application_id: applicationId,
      customer_id: customerId,
      device_id: deviceId,
      resource: {
        name: "Kuvaus",
        slug: "content",
        type: ResourceType.TEXT,
        order_number: 3,
        parent_id: pageId
      }
    });
    this.setState({ treeData: this.treeDataAdd(this.treeItemFromResource(content), this.state.treeData || []) });

    const background = await resourcesApi.createResource({
      application_id: applicationId,
      customer_id: customerId,
      device_id: deviceId,
      resource: {
        name: "Taustakuva",
        slug: "background",
        type: ResourceType.IMAGE,
        order_number: 4,
        parent_id: pageId
      }
    });
    this.setState({ treeData: this.treeDataAdd(this.treeItemFromResource(background), this.state.treeData || []) });
  }

  /**
   * Copies all content recursively from old parent under new parent
   */
  private copyContentFrom = async (oldParentId: string, newParentId: string) => {
    const { auth, customerId, deviceId, applicationId } = this.props;

    if (!auth || !auth.token) {
      return;
    }
    const resourcesApi = ApiUtils.getResourcesApi(auth.token);
    const resources = await resourcesApi.listResources({
      application_id: applicationId,
      customer_id: customerId,
      device_id: deviceId,
      parent_id: oldParentId
    });

    for (let i = 0; i < resources.length; i++) {
      let res = resources[i];
      let copy = { ...res, id: undefined, parent_id: newParentId }
      let created = await resourcesApi.createResource({
        application_id: applicationId,
        customer_id: customerId,
        device_id: deviceId,
        resource: copy
      });
      this.setState({ treeData: this.treeDataAdd(this.treeItemFromResource(created), this.state.treeData || []) });
      await this.copyContentFrom(res.id!, created.id!);
    }

  }

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
    };
  }

  /**
   * Adds item under the parent element
   *
   * @param newItem item to be added
   * @param data array of current search level
   */
  private treeDataAdd = (newItem: ResourceTreeItem, data: ResourceTreeItem[]): ResourceTreeItem[] => {
    const { application } = this.props;
    if (newItem.resource!.parent_id === application!.root_resource_id) {
      return [...data.filter(item => item.resource), newItem];
    }
    return data.map((item) => {
      if (item.resource && item.children && Array.isArray(item.children)) {
        return {...item, children: item.resource.id === newItem.resource!.parent_id ? [...item.children.filter(item => item.resource) as ResourceTreeItem[], newItem, { title: this.renderAdd(newItem.resource!.parent_id)} as ResourceTreeItem] as ResourceTreeItem[] : this.treeDataAdd(newItem, item.children as ResourceTreeItem[])};
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
    const { auth, customerId, deviceId, applicationId, openResource, updatedResourceView } = this.props;
    const { treeData } = this.state;
    const resourceId = resource.id;
    if (!auth || !auth.token || !resourceId || !treeData) {
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
    if (updatedResource.type !== ResourceType.ROOT) {
      openResource(updatedResource);
    } else {
      this.setState({ 
        rootResource: updatedResource,
      });
    }
    updatedResourceView();
    this.setState({
      confirmationRequired: false,
      treeData: this.updateTreeData(updatedResource, treeData)
    });
  };

  /**
   * Updates tree data when resource is updated
   * 
   * @param resource updated resource
   * @param data tree data object
   */
  private updateTreeData = (resource: Resource, data: ResourceTreeItem[]): ResourceTreeItem[] => {
    return data.map((item) => {
      if (item.resource && item.resource.id === resource.id) {
        return {...item, resource: resource, title: this.renderTreeItem(resource)};
      }
      return {...item, children: item.children ? this.updateTreeData(resource, item.children as ResourceTreeItem[]) : []};
    });
  }

  /**
   * Handles update child resources
   *
   * @param childResources child resources
   */
  private onUpdateChildResources = async (childResources: Resource[]) => {
    const { auth, customerId, deviceId, applicationId, updatedResourceView } = this.props;
    const { treeData } = this.state;
    if (!auth || !auth.token) {
      return;
    }

    const resourcesApi = ApiUtils.getResourcesApi(auth.token);
    const updateChildResourcePromises = childResources.map(resource =>
      resourcesApi.updateResource({
        resource: resource,
        customer_id: customerId,
        device_id: deviceId,
        application_id: applicationId,
        resource_id: resource.id!
      })
    );

    const resources = await Promise.all(updateChildResourcePromises);
    updatedResourceView();
    this.setState({
      treeData: this.treeDataUpdateChildResources(treeData || [], resources)
    });
  }

  /**
   * Updates child resources
   * 
   * @param data tree data object
   * @param resources child resources
   */
  private treeDataUpdateChildResources = (data: ResourceTreeItem[], resources: Resource[]): ResourceTreeItem[] => {
    return data.map((item) => {
      if (resources.length > 0 && item.resource && resources[0].parent_id === item.resource.id) {
        return {...item, children: item.children && Array.isArray(item.children) ? item.children.map((child, index) => { return {...child, title: child.resource ? this.renderTreeItem(resources[index]) : this.renderAdd(resources[0].parent_id), resource: child.resource ? resources[index] : undefined } }) : []};
      }
      return {...item, children: item.children && Array.isArray(item.children) ? this.treeDataUpdateChildResources(item.children, resources) : []};
    });
  }

  /**
   * Delete resource method
   */
  private onDeleteResource = async (resource: Resource, nextOpenResource?: Resource) => {
    const { auth, customerId, deviceId, applicationId, openResource, updatedResourceView } = this.props;
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
    const hasChildren = childResources.length > 0;
    const subjectToDelete = hasChildren ? `${resource.name} ${strings.andAllChildren}` : resource.name;
    if (window.confirm(`${strings.deleteResourceDialogDescription} ${subjectToDelete}?`)) {
      await resourcesApi.deleteResource({ customer_id: customerId, device_id: deviceId, application_id: applicationId, resource_id: resourceId });
      openResource(nextOpenResource);
      this.setState({
        treeData: this.treeDataDelete(resource.id || "", this.state.treeData || [])
      });

      updatedResourceView();
    }
  };

  private confirmationRequired = (value: boolean) => {
    this.setState({
      confirmationRequired: value,
    });
  }

  /**
   * Update application method
   */
  private onUpdateApplication = async (application: Application) => {
    const { auth, customerId, deviceId, applicationId, setApplication } = this.props;

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

    setApplication(updatedApplication);
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
  openedResource: state.resource.resourceOpen,
  customer: state.customer.customer,
  device: state.device.device,
  application: state.application.application,
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
    setApplication: (application: Application) => dispatch(setApplication(application)),
    updatedResourceView: () => dispatch(updatedResourceView()),
    openResource: (resource?: Resource) => dispatch(openResource(resource))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(ApplicationEditor));
