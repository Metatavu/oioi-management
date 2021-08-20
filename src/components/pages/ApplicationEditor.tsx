import * as React from "react";
import { Typography, Divider, List, ListItem, AppBar, WithStyles, withStyles, Drawer, Button, CircularProgress, ListItemIcon, ListItemText, ListItemSecondaryAction, Fade, Box } from "@material-ui/core";
import { History } from "history";
import AppSettingsView from "../views/AppSettingsView";
import strings from "../../localization/strings";
import styles from "../../styles/editor-view";
import { ReduxState, ReduxActions } from "../../store";
import { Dispatch } from "redux";
import { connect } from "react-redux";
import { AuthState, ErrorContextType } from "../../types";
import ApiUtils from "../../utils/api";
import { Customer, Device, Application, Resource, ResourceType } from "../../generated/client/src";
import ResourceTreeItem from "../generic/ResourceTreeItem";
import AddResourceDialog from "../generic/AddResourceDialog";
import ResourceSettingsView from "../views/ResourceSettingsView";
import { setCustomer } from "../../actions/customer";
import { setDevice } from "../../actions/device";
import { setApplication } from "../../actions/application";
import { openResource, updatedResourceView } from "../../actions/resources";
import SortableTree, { TreeItem as TreeItemSortable, NodeData, FullTree, OnMovePreviousAndNextLocation, ExtendedNodeData, OnDragPreviousAndNextLocation, TreeItem } from "react-sortable-tree";
import FileExplorerTheme from "react-sortable-tree-theme-file-explorer";
import MenuResourceSettingsView from "../views/MenuResourceSettingsView";
import AddIcon from "@material-ui/icons/AddCircle";
import ChevronRight from "@material-ui/icons/ChevronRight";
import PageResourceSettingsView from "../views/PageResourceSettingsView";
import theme from "../../styles/theme";
import { getLocalizedTypeString } from "../../commons/resourceTypeHelper";
import AppLayout from "../layouts/app-layout";
import { ErrorContext } from "../containers/ErrorHandler";
import { resolveChildResourceTypes } from "../../commons/resourceTypeHelper";

/**
 * Component properties
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

/**
 * Component state
 */
interface State {
  addResourceDialogOpen: boolean;
  parentResourceId?: string;
  rootResource?: Resource;
  treeData?: ResourceTreeItem[];
  confirmationRequired: boolean;
  treeResizing: boolean;
  treeWidth: number;
  isSaving: boolean;
}

/**
 * Resource tree item
 */
interface ResourceTreeItem extends TreeItemSortable {
  id?: string;
  resource?: Resource;
}

/**
 * Component for application editor
 */
class ApplicationEditor extends React.Component<Props, State> {

  static contextType: React.Context<ErrorContextType> = ErrorContext;

  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      isSaving: false,
      addResourceDialogOpen: false,
      confirmationRequired: false,
      treeResizing: false,
      treeWidth: 300
    };
  }

  /**
   * Component will unmount life cycle method
   */
  public componentWillUnmount = () => {
    document.removeEventListener("mousemove", this.handleMousemove);
    document.removeEventListener("mouseup", this.handleMouseup);
  }

  /**
   * Component did mount life cycle method
   */
  public componentDidMount = async () => {
    const { openResource, openedResource } = this.props;

    document.addEventListener("mousemove", this.handleMousemove);
    document.addEventListener("mouseup", this.handleMouseup);

    if (openedResource) {
      openResource(undefined);
    }

    await this.fetchData();
    await this.loadTree();
  };

  /**
   * Component did update life cycle method
   *
   * @param prevProps previous properties
   * @param prevState previous state
   */
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
    const { classes, openedResource } = this.props;
    const { treeResizing } = this.state;

    const resourceType = openedResource ? openedResource.type : ResourceType.ROOT;
    const localString = getLocalizedTypeString(resourceType);

    return (
      <AppLayout>
        <div
          style={ treeResizing ? { userSelect: "none" } : {} }
          className={ classes.root }
        >
          <AppBar
            elevation={ 0 }
            position="relative"
            className={ classes.appBar }
          >
            <div className={ classes.toolbar }>
              <Typography variant="h3" noWrap>
                { openedResource && localString }
              </Typography>
              <Button
                disableElevation
                className={ classes.deleteButton }
                color="primary"
                variant="contained"
                disabled={ !openedResource }
                onClick={ this.onChildDelete }
              >
                { strings.delete }
              </Button>
            </div>
          </AppBar>
          { this.renderResponsiveDrawer() }
          { this.renderEditor() }
          { this.renderSavingOverlay() }
        </div>
      </AppLayout>
    );
  }

  /**
   * Event handler for mouse down
   */
  private handleMousedown = () => {
    this.setState({ treeResizing: true });
  };

  /**
   * Event handler for mouse move
   *
   * @param event mouse event
   */
  private handleMousemove = (event: MouseEvent) => {
    if (!this.state.treeResizing) {
      return;
    }

    const offsetRight = (event.clientX - document.body.offsetLeft);
    const minWidth = 300;
    this.setState({ treeWidth: Math.max(minWidth, offsetRight) });
  };

  /**
   * Event handler for mouse up
   */
  private handleMouseup = ()=> {
    if (this.state.treeResizing) {
      this.setState({ treeResizing: false });
    }
  };

  /**
   * Render saving overlay
   */
  private renderSavingOverlay = () => {
    const { classes } = this.props;
    const { isSaving } = this.state;

    return (
      <Fade in={ isSaving }>
        <Box className={ classes.savingDialogRoot }>
          <CircularProgress />
          <Box mt={ 2 }>
            <Typography>
              { strings.saving }
            </Typography>
          </Box>
        </Box>
      </Fade>
    );
  }

  /**
   * Render responsive drawer method
   */
  private renderResponsiveDrawer = () => {
    const { classes } = this.props;
    const { treeWidth } = this.state;

    return (
      <nav
        style={{ width: treeWidth }}
        className={ classes.drawer }
      >
        <Drawer
          classes={{ paper: classes.drawerPaper }}
          variant="permanent"
          anchor="left"
          PaperProps={{ style: { width: treeWidth } }}
          open
        >
          <Box
            id="dragger"
            style={{ left: treeWidth - 10 }}
            onMouseDown={ this.handleMousedown }
            className={ classes.dragger }
            title={ strings.applicationEditor.dragSidebar }
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
    const {
      auth,
      classes,
      customer,
      device,
      application,
      openedResource,
      openResource
    } = this.props;
    const { treeData, parentResourceId } = this.state;

    return (
      <>
        <List disablePadding>
          <ListItem
            style={{ height: 54 }}
            selected={ openedResource === undefined }
            button
            onClick={ () => openResource(undefined) }
          >
            <Typography variant="h4">
              { strings.applicationSettings.settings }
            </Typography>
            <ListItemSecondaryAction>
              <ChevronRight />
            </ListItemSecondaryAction>
          </ListItem>
        </List>
        <Divider />
        { treeData &&
          <>
            { application &&
              this.renderAdd(application.rootResourceId)
            }
            <SortableTree
              className={ classes.treeWrapper }
              rowHeight={ 36 }
              treeData={ treeData }
              onChange={ treeData => this.setState({ treeData: treeData }) }
              onMoveNode={ this.moveResource }
              canDrop={ this.canDrop }
              canDrag={ this.canDrag }
              canNodeHaveChildren={ this.canHaveChildren }
              theme={ FileExplorerTheme }
            />
          </>
        }
        { !treeData &&
          <div style={{ padding: "1rem" }}>
            <CircularProgress />
          </div>
        }
        <AddResourceDialog
          open={ this.state.addResourceDialogOpen }
          auth={ auth }
          customerId={ customer ? customer.id : "" }
          deviceId={ device ? device.id : "" }
          applicationId={ application ? application.id : "" }
          rootResourceId={ application ? application.rootResourceId : "" }
          parentResourceId={ parentResourceId || "" }
          onSave={ this.onSaveNewResourceClick }
          handleClose={ this.onDialogCloseClick }
        />
      </>
    );
  };

  /**
   * Render treeItem method
   *
   * @param resource resource
   */
  private renderTreeItem = (resource: Resource) => {
    const {
      classes,
      customerId,
      deviceId,
      applicationId
    } = this.props;

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
      return <main className={ classes.content }/>;
    }
  };

  /**
   * Renders resource settings view
   *
   * @param resource resource
   * @param customerId customer ID
   */
  private renderResourceSettingsView = (resource: Resource, customerId: string) => {
    const { auth, deviceId, applicationId, resourceViewUpdated } = this.props;

    switch (resource.type) {
      case ResourceType.MENU:
      case ResourceType.LANGUAGE:
      case ResourceType.LANGUAGEMENU:
      case ResourceType.SLIDESHOW:
      case ResourceType.APPLICATION:
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
   *
   * @param parentId parent ID
   */
  private renderAdd = (parentId?: string) => {
    const { classes } = this.props;
    const { treeData } = this.state;

    if (!parentId) {
      return null;
    }

    if (parentId === this.props.application!.rootResourceId) {
      if (treeData && (!treeData.find(data => data.resource && data.resource.type === ResourceType.INTRO) || !treeData.find(data => data.resource && data.resource.type === ResourceType.LANGUAGEMENU))) {
        return (
          <>
            <ListItem className={ classes.treeAddItem } onClick={ () => this.onAddNewResourceClick(parentId) } key={ parentId + "add" }>
              <ListItemIcon style={{ minWidth: 0, marginRight: theme.spacing(1) }}>
                <AddIcon fontSize="small"/>
              </ListItemIcon>
              <ListItemText className={ classes.addResourceBtnText } primary={ strings.addNewIntroOrLanguageMenu } />
            </ListItem>
          </>
        );
      } else {
        return null;
      }
    }

    return (
      <ListItem className={ classes.treeAddItem } onClick={ () => this.onAddNewResourceClick(parentId) } key={ parentId + "add" }>
        <ListItemIcon style={ { minWidth: 0, marginRight: theme.spacing(1) } }><AddIcon fontSize="small" /></ListItemIcon>
        <ListItemText className={ classes.addResourceBtnText } primary={ strings.addNew } />
      </ListItem>
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

    let topLevelResources: Resource[] = []; 
    try {
      topLevelResources = await ApiUtils.getResourcesApi(auth.token).listResources({
        applicationId: application.id!,
        customerId: customer.id!,
        deviceId: device.id!,
        parentId: rootResource.id
      });
    } catch (error) {
      this.context.setError(strings.errorManagement.resource.list, error);
      return;
    }

    try {
      const treeData: ResourceTreeItem[] = await Promise.all(topLevelResources.map(async (resource) => {
        return {
          title: this.renderTreeItem(resource),
          children: await this.loadTreeChildren(resource.id || ""),
          resource: resource
        }
      }));
      this.setState({ treeData: treeData });
    } catch (error) {
      this.context.setError(strings.errorManagement.resource.listChild, error);
    }
  }

  /**
   * Loads all children of the parent
   *
   * @param parentId id of tree item parent
   */
  private loadTreeChildren = async (parentId: string): Promise<ResourceTreeItem[]> => {
    const { auth, customerId, deviceId, applicationId } = this.props;
    const data: ResourceTreeItem[] = [];

    if (!auth || !auth.token) {
      return data;
    }

    let childResources: Resource[] = [];
    const resourcesApi = ApiUtils.getResourcesApi(auth.token);

    try {
      childResources = await resourcesApi.listResources({
        customerId: customerId,
        deviceId: deviceId,
        applicationId: applicationId,
        parentId: parentId
      });

      return await Promise.all(
        childResources.map(async resource => ({
          title: this.renderTreeItem(resource),
          children: await this.loadTreeChildren(resource.id || ""),
          resource: resource
        }))
      );
    } catch (error) {
      return Promise.reject(error);
    }
  }

  /**
   * Moves resource under new parent
   *
   * @param data tree data change info object
   */
  private moveResource = async (data: NodeData & FullTree & OnMovePreviousAndNextLocation) => {
    const {
      auth,
      customerId,
      deviceId,
      applicationId,
      application
    } = this.props;
    const { treeData } = this.state;

    if (!auth || !auth.token) {
      return null;
    }

    try {
      const resourcesApi = ApiUtils.getResourcesApi(auth.token);
      if (treeData && data.nextParentNode && data.nextParentNode.children && Array.isArray(data.nextParentNode.children)) {
        data.nextParentNode.children
        .filter(child => !!child.resource)
        .map(async ({ resource }, index) =>
          await resourcesApi.updateResource({
            customerId: customerId,
            deviceId: deviceId,
            applicationId: applicationId,
            resourceId: resource.id || "",
            resource: {
              ...resource,
              orderNumber: index + 1,
              parentId: data.nextParentNode!.resource.id
            }
          })
        );

        this.setState({
          treeData: this.treeDataRearrange(
            treeData,
            application && application.rootResourceId || "",
            data.nextParentNode.resource.id
          )
        });
      } else if (treeData) {
        (treeData as TreeItemSortable[])
          .filter(child => !!child.resource)
          .map(async ({ resource }, index) =>
            await resourcesApi.updateResource({
              resource: {
                ...resource,
                orderNumber: index + 1
              },
              customerId: customerId,
              deviceId: deviceId,
              applicationId: applicationId,
              resourceId: resource.id || ""
            })
          );

        const rootResourceId = application && application.rootResourceId || "";

        this.setState({
          treeData: this.treeDataRearrange(
            treeData,
            rootResourceId,
            rootResourceId
          )
        });
      }
    } catch (error) {
      this.context.setError(strings.errorManagement.resource.update, error);
    }
  }

  /**
   * Rearranges tree data layer
   *
   * @param treeData current tree data layer
   * @param parentId parent id of the current layer
   * @param changesId parent id of the layer that needs to be rearranged
   */
  private treeDataRearrange = (treeData: ResourceTreeItem[], parentId: string, changesId: string): ResourceTreeItem[] => {
    if (parentId === changesId) {
      const arrangedTreeData = treeData
        .filter(data => !!data.resource)
        .sort((a, b) => (a.resource!.orderNumber || 0) - (b.resource!.orderNumber || 0));

      return [
        ...arrangedTreeData,
        { title: this.renderAdd(changesId) }
      ];
    }
    return treeData.map((data) => ({
      ...data,
      children: data.children && data.children.length && data.resource && data.resource.id ?
        this.treeDataRearrange(data.children as ResourceTreeItem[], data.resource.id, changesId) :
        []
    }));
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
    if (
      (data.nextParent && !this.canHaveChildren(data.nextParent)) ||
      (!this.typeCheck(data.nextParent ? data.nextParent.resource : undefined, data.node.resource))
    ) {
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
    if (node.resource && node.resource.type) {
      const resource: Resource = node.resource;
      const resourceType = resource.type;
      const allowedChildTypes = resolveChildResourceTypes(resourceType);
      return allowedChildTypes.length > 0;
    } else {
      return true;
    }
  }

  /**
   * Child delete
   */
  private onChildDelete = async () => {
    const {
      auth,
      openedResource,
      openResource,
      customerId,
      deviceId,
      applicationId,
      updatedResourceView
    } = this.props;
    const { treeData } = this.state;

    if (!auth || !auth.token) {
      return;
    }

    if (openedResource && window.confirm(`${strings.deleteResourceDialogDescription} ${openedResource.name} ${ strings.andAllChildren}?`)) {
      const childResourceId = openedResource.id;
      openResource(undefined);
      updatedResourceView();
      if (childResourceId) {
        try {
          await ApiUtils.getResourcesApi(auth.token).deleteResource({
            customerId: customerId,
            deviceId: deviceId,
            applicationId: applicationId,
            resourceId: openedResource.id || ""
          });

          this.setState({
            treeData: this.treeDataDelete(childResourceId, treeData || [])
          });
        } catch (error) {
          this.context.setError(
            strings.formatString(strings.errorManagement.resource.delete, openedResource.name),
            error
          );
        }
      }
    }
  };

  /**
   * Deletes item and all of it"s children from the tree
   *
   * @param id id of the deleted item
   * @param data array of current search level
   */
  private treeDataDelete = (id: string, data: ResourceTreeItem[]): ResourceTreeItem[] => (
    data.filter(item => !item.resource || (item.resource.id !== id))
      .map(item => ({ ...item, children: (item.children) ? this.treeDataDelete(id, item.children as ResourceTreeItem[]) : [] })
    )
  );

  /**
   * on add resource click method
   *
   * @param parentResourceId parent resource ID
   */
  private onAddNewResourceClick = (parentResourceId: string) => {
    this.setState({
      addResourceDialogOpen: true,
      parentResourceId: parentResourceId
    });
  };

  /**
   * on open resource click method
   *
   * @param resource resource
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
          return {
            ...item,
            children: item.children && Array.isArray(item.children) ?
              [...this.treeDataRenderAddButton(item.children as ResourceTreeItem[], resource), { title: this.renderAdd(resource.id) }] :
              [{ title: this.renderAdd(resource.id) }]
          }
        }
        return { ...item, children: item.children ? this.treeDataRenderAddButton(item.children as ResourceTreeItem[], resource) : [] };
      });
  }

  /**
   * Event handler for save new resource click
   *
   * @param resource resource
   * @param copyContentFromId if content should be copied from ID
   */
  private onSaveNewResourceClick = async (resource: Resource, copyContentFromId?: string) => {
    const { auth, customerId, deviceId, applicationId, updatedResourceView } = this.props;

    if (!auth || !auth.token) {
      return;
    }

    const { setError } = this.context;

    try {
      const newResource = await ApiUtils.getResourcesApi(auth.token).createResource({
        customerId: customerId,
        deviceId: deviceId,
        applicationId: applicationId,
        resource: resource
      });


      updatedResourceView();
      this.setState({
        addResourceDialogOpen: false,
        treeData: this.treeDataAdd(this.treeItemFromResource(newResource), this.state.treeData || [])
      });

      if (newResource.type === ResourceType.PAGE) {
        await this.createPagePredefinedResources(newResource.id!);
      }

      if (copyContentFromId) {
        await this.copyContentFrom(copyContentFromId, newResource.id!);
      }
    } catch (error) {
      setError(strings.errorManagement.resource.create, error);
      return;
    }
  };

  /**
   * Creates page with pre-defined resources
   *
   * @param pageId page id 
   */
  private createPagePredefinedResources = async (pageId: string) => {
      const title = await this.createResource("Otsikko", "title", ResourceType.TEXT, 1, pageId);
      const content = await this.createResource("Leipäteksti", "text_content", ResourceType.TEXT, 3, pageId);
      const background = await this.createResource("Taustakuva", "background", ResourceType.IMAGE, 4, pageId);
  
      if (!title || !content || !background) {
        return;
      }
  
      const treeData = this.state.treeData || [];

      this.setState({ treeData: this.treeDataAdd(this.treeItemFromResource(title), treeData) });
      this.setState({ treeData: this.treeDataAdd(this.treeItemFromResource(content), treeData) });
      this.setState({ treeData: this.treeDataAdd(this.treeItemFromResource(background), treeData) });
  }

  /**
   * Creates single resource with given parameters
   *
   * @param name resource name 
   * @param slug resource slug
   * @param type resource type
   * @param orderNumber resource order number
   * @param pageId resource page ID
   * @returns Promise of created resource
   */
  private createResource = async (name: string, slug: string, type: ResourceType, orderNumber: number, pageId: string): Promise<Resource | undefined> => {
    const { auth, customerId, deviceId, applicationId } = this.props;

    if (!auth || !auth.token) {
      return;
    }

    const resourcesApi = ApiUtils.getResourcesApi(auth.token);

    try {
      return await resourcesApi.createResource({
        applicationId: applicationId,
        customerId: customerId,
        deviceId: deviceId,
        resource: {
          name: name,
          slug: slug,
          type: type,
          orderNumber: orderNumber,
          parentId: pageId
        }
      });
    } catch (error) {
      return Promise.reject(strings.errorManagement.resource.create)
    }
  }

  /**
   * Copies all content recursively from old parent under new parent
   *
   * @param oldParentId old parent ID
   * @param newParentId new parent ID
   */
  private copyContentFrom = async (oldParentId: string, newParentId: string) => {
    const { auth, customerId, deviceId, applicationId } = this.props;

    if (!auth || !auth.token) {
      return;
    }

    const resourcesApi = ApiUtils.getResourcesApi(auth.token);
    const resources = await resourcesApi.listResources({
      applicationId: applicationId,
      customerId: customerId,
      deviceId: deviceId,
      parentId: oldParentId
    });

    for (const res of resources) {
      const copy = { ...res, id: undefined, parentId: newParentId }
      const created = await resourcesApi.createResource({
        applicationId: applicationId,
        customerId: customerId,
        deviceId: deviceId,
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
   * @returns updated list of resource tree items
   */
  private treeDataAdd = (newItem: ResourceTreeItem, data: ResourceTreeItem[]): ResourceTreeItem[] => {
    const { application } = this.props;

    if (newItem.resource!.parentId === application!.rootResourceId) {
      return [ ...data.filter(item => item.resource), newItem ];
    }

    return data.map((item) => {
      if (item.resource && item.children && Array.isArray(item.children)) {
        return {
          ...item,
          children: item.resource.id === newItem.resource!.parentId ?
            [...item.children.filter(item => item.resource) as ResourceTreeItem[], newItem, { title: this.renderAdd(newItem.resource!.parentId)} as ResourceTreeItem] as ResourceTreeItem[] :
            this.treeDataAdd(newItem, item.children as ResourceTreeItem[])
        };
      } else {
        return item;
      }
    });
  }

  /**
   * Update resource method
   * TODO: handle error if resourceId was undefined
   *
   * @param resource resource
   */
  private onUpdateResource = async (resource: Resource) => {
    const { auth, customerId, deviceId, applicationId, openResource, updatedResourceView } = this.props;
    const { treeData } = this.state;
    const resourceId = resource.id;

    if (!auth || !auth.token || !resourceId || !treeData) {
      return;
    }

    this.setState({ isSaving: true });

    try {
      const updatedResource = await ApiUtils.getResourcesApi(auth.token).updateResource({
        resource: resource,
        customerId: customerId,
        deviceId: deviceId,
        applicationId: applicationId,
        resourceId: resourceId
      });
  
      if (updatedResource.type !== ResourceType.ROOT) {
        openResource(updatedResource);
      } else {
        this.setState({ rootResource: updatedResource });
      }

      updatedResourceView();
      this.setState({
        isSaving: false,
        confirmationRequired: false,
        treeData: this.updateTreeData(updatedResource, treeData)
      });
    } catch (error) {
      this.context.setError(strings.errorManagement.resource.update, error);
      this.clear();
    }
  };

  /**
   * Updates tree data when resource is updated
   *
   * @param resource updated resource
   * @param data tree data object
   * @returns updated list of resource tree items
   */
  private updateTreeData = (resource: Resource, data: ResourceTreeItem[]): ResourceTreeItem[] => {
    return data.map(item => {
      if (item.resource && item.resource.id === resource.id) {
        return {
          ...item,
          resource: resource,
          title: this.renderTreeItem(resource)
        };
      }

      return {
        ...item,
        children: item.children ?
          this.updateTreeData(resource, item.children as ResourceTreeItem[]) :
          []
      };
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

    try {
      const updatedResources: Resource[] = [];
      for (const resource of childResources) {
        updatedResources.push(
          await ApiUtils.getResourcesApi(auth.token).updateResource({
            resource: resource,
            customerId: customerId,
            deviceId: deviceId,
            applicationId: applicationId,
            resourceId: resource.id!
          })
        );
      }

      updatedResourceView();
      this.setState({
        treeData: this.treeDataUpdateChildResources(treeData || [], updatedResources)
      });
    } catch (error) {
      this.context.setError(strings.errorManagement.resource.updateChild);
    }

  }

  /**
   * Updates child resources
   *
   * @param data tree data object
   * @param resources child resources
   * @returns updated list of resource tree items
   */
  private treeDataUpdateChildResources = (data: ResourceTreeItem[], resources: Resource[]): ResourceTreeItem[] => {
    return data.map(item => {
      if (resources.length > 0 && item.resource && resources[0].parentId === item.resource.id) {
        return {
          ...item,
          children:
            item.children && Array.isArray(item.children) ?
            item.children.map((child, index) => {
              return {
                ...child,
                title: child.resource ?
                  this.renderTreeItem(resources[index]) :
                  this.renderAdd(resources[0].parentId), resource: child.resource ? resources[index] : undefined
              } 
            }) :
            []
        };
      }
      return {
        ...item,
        children:
          item.children && Array.isArray(item.children) ?
          this.treeDataUpdateChildResources(item.children, resources) :
          []
      };
    });
  }

  /**
   * Delete resource method
   *
   * @param resource resource
   * @param nextOpenResource next open resource
   */
  private onDeleteResource = async (resource: Resource, nextOpenResource?: Resource) => {
    const { auth, customerId, deviceId, applicationId, openResource, updatedResourceView } = this.props;
    const resourceId = resource.id;

    if (!auth || !auth.token || !resourceId) {
      return;
    }

    const resourcesApi = ApiUtils.getResourcesApi(auth.token);
    const { setError } = this.context;

    let childResources: Resource[] = [];
    try {
      childResources = await resourcesApi.listResources({
        customerId: customerId,
        deviceId: deviceId,
        applicationId: applicationId,
        parentId: resourceId
      });
    } catch (error) {
      setError(strings.errorManagement.resource.listChild, error);
      return;
    }


    /**
     * TODO: prettier delete confirmation
     */
    const hasChildren = childResources.length > 0;
    const subjectToDelete = hasChildren ? `${resource.name} ${strings.andAllChildren}` : resource.name;
    if (window.confirm(`${strings.deleteResourceDialogDescription} ${subjectToDelete}?`)) {

      try {
        await resourcesApi.deleteResource({
          customerId: customerId,
          deviceId: deviceId,
          applicationId: applicationId,
          resourceId: resourceId
        });
        openResource(nextOpenResource);

        this.setState({
          treeData: this.treeDataDelete(resource.id || "", this.state.treeData || [])
        });
  
        updatedResourceView();
      } catch (error) {
        setError(strings.errorManagement.resource.delete, error);
      }
    }
  };

  /**
   * Does leaving the current resource need confirmation
   *
   * @param value value
   */
  private confirmationRequired = (value: boolean) => {
    this.setState({
      confirmationRequired: value,
    });
  }

  /**
   * Update application method
   *
   * @param application application
   */
  private onUpdateApplication = async (application: Application) => {
    const { auth, customerId, deviceId, applicationId, setApplication } = this.props;

    if (!auth || !auth.token) {
      return;
    }

    try {
      const updatedApplication = await ApiUtils.getApplicationsApi(auth.token).updateApplication({
        application: application,
        customerId: customerId,
        deviceId: deviceId,
        applicationId: applicationId
      });
  
      setApplication(updatedApplication);
    } catch (error) {
      this.context.setError(
        strings.formatString(strings.errorManagement.application.update, application.name),
        error
      );
    }

    this.clear();
  };

  /**
   * Close dialog method
   *
   * TODO: handle prompt if unsaved
   */
  private onDialogCloseClick = () => {
    this.setState({ addResourceDialogOpen: false });
  };

  /**
   * Clear confirmation dialog
   */
  private clear = () => {
    this.setState({
      confirmationRequired: false,
      isSaving: false
    });
  }

  /**
   * Fetches initial data
   */
  private fetchData = async () => {
    const {
      auth,
      customerId,
      deviceId,
      applicationId,
      customer,
      device,
      application,
      setDevice,
      setCustomer,
      setApplication,
    } = this.props;

    if (!auth || !auth.token) {
      return;
    }

    const token = auth.token;
    const { setError } = this.context;

    if (!customer || customer.id !== customerId) {
      try {
        const foundCustomer = await ApiUtils.getCustomersApi(token).findCustomer({ customerId: customerId });
        setCustomer(foundCustomer);
      } catch (error) {
        setError(strings.errorManagement.customer.find, error);
        return;
      }
    }

    if (!device || device.id !== deviceId) {
      try {
        const foundDevice = await ApiUtils.getDevicesApi(token).findDevice({ customerId: customerId, deviceId: deviceId });
        setDevice(foundDevice);
      } catch (error) {
        setError(strings.errorManagement.device.find, error);
        return;
      }
    }

    let currentApplication = application;
    if (!application || application.id !== applicationId) {
      try {
        currentApplication = await ApiUtils.getApplicationsApi(token).findApplication({
          customerId: customerId,
          deviceId: deviceId,
          applicationId: applicationId
        });
  
        setApplication(currentApplication);
      } catch (error) {
        setError(strings.errorManagement.application.find, error);
        return;
      }
    }

    if (!currentApplication) {
      return;
    }

    try {
      const rootResource = await ApiUtils.getResourcesApi(token).findResource({
        customerId: customerId,
        deviceId: deviceId,
        applicationId: applicationId,
        resourceId: currentApplication.rootResourceId!
      });

      this.setState({ rootResource: rootResource });
    } catch (error) {
      setError(strings.errorManagement.resource.find, error);
    }
  }
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
 * @param dispatch Redux dispatch
 */
const mapDispatchToProps = (dispatch: Dispatch<ReduxActions>) => ({
  setCustomer: (customer: Customer) => dispatch(setCustomer(customer)),
  setDevice: (device: Device) => dispatch(setDevice(device)),
  setApplication: (application: Application) => dispatch(setApplication(application)),
  updatedResourceView: () => dispatch(updatedResourceView()),
  openResource: (resource?: Resource) => dispatch(openResource(resource))
});

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(ApplicationEditor));