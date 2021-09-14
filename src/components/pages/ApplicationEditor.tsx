import * as React from "react";
import { Typography, Divider, List, ListItem, AppBar, WithStyles, withStyles, Drawer, Button, CircularProgress, ListItemText, ListItemSecondaryAction, Fade, Box, ListItemAvatar, Avatar, LinearProgress } from "@material-ui/core";
import { History } from "history";
import AppSettingsView from "../views/AppSettingsView";
import strings from "../../localization/strings";
import styles from "../../styles/editor-view";
import { connect, ConnectedProps } from "react-redux";
import { ContentVersion, ErrorContextType } from "../../types";
import Api from "../../api";
import { Customer, Device, Application, Resource, ResourceType } from "../../generated/client";
import ResourceTreeItem from "../generic/ResourceTreeItem";
import AddResourceDialog from "../generic/AddResourceDialog";
import ResourceSettingsView from "../views/ResourceSettingsView";
import { TreeItem as TreeItemSortable } from "react-sortable-tree";
import MenuResourceSettingsView from "../views/MenuResourceSettingsView";
import SettingsIcon from "@material-ui/icons/Tune";
import PageResourceSettingsView from "../views/PageResourceSettingsView";
import { getLocalizedTypeString } from "../../commons/resourceTypeHelper";
import AppLayout from "../layouts/app-layout";
import { ErrorContext } from "../containers/ErrorHandler";
import { toast } from "react-toastify";
import PDFResourceSettingsView from "../views/PDFResourceSettingsView";
import { blueGrey } from "@material-ui/core/colors";
import ChevronRight from "@material-ui/icons/ChevronRight";
import { setCustomer } from "features/customer-slice";
import { setApplication } from "features/application-slice";
import { setContentVersions, selectContentVersion } from "features/content-version-slice";
import { setDevice } from "features/device-slice";
import { deleteResources, selectResource, setResources, updateResources } from "features/resource-slice";
import { ReduxDispatch, ReduxState } from "app/store";
import ResourceTree from "components/generic/ResourceTree";

/**
 * Component properties
 */
interface Props extends ExternalProps {
  history: History;
  customerId: string;
  deviceId: string;
  applicationId: string;
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
  loading: boolean;
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
      treeWidth: 400,
      loading: true
    };
  }

  /**
   * Component did mount life cycle method
   */
  public componentDidMount = async () => {
    document.addEventListener("mousemove", this.handleMousemove);
    document.addEventListener("mouseup", this.handleMouseup);

    await this.fetchData();

    this.setState({ loading: false });
  };

  /**
   * Component did update life cycle method
   *
   * @param prevProps previous properties
   * @param prevState previous state
   */
  public componentDidUpdate = async (prevProps: Props, prevState: State) => {
    if (prevProps.application?.id !== this.props.application?.id) {
      await this.fetchData();
    }
  };

  /**
   * Component will unmount life cycle method
   */
  public componentWillUnmount = () => {
    const { selectResource } = this.props;

    selectResource(undefined);
    document.removeEventListener("mousemove", this.handleMousemove);
    document.removeEventListener("mouseup", this.handleMouseup);
  }

  /**
   * Component render method
   */
  public render = () => {
    const { classes, selectedResource } = this.props;
    const { treeResizing } = this.state;

    const resourceType = selectedResource ? selectedResource.type : ResourceType.ROOT;

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
                { selectedResource && getLocalizedTypeString(resourceType) }
              </Typography>
              <Button
                disableElevation
                className={ classes.deleteButton }
                color="primary"
                variant="contained"
                disabled={ !selectedResource }
                onClick={ this.onResourceDelete }
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
    const { treeResizing } = this.state;

    if (!treeResizing) {
      return;
    }

    const offsetRight = (event.clientX - document.body.offsetLeft);
    const minWidth = 300;
    this.setState({ treeWidth: Math.max(minWidth, offsetRight) });
  };

  /**
   * Event handler for mouse up
   */
  private handleMouseup = () => {
    const { treeResizing } = this.state;

    if (treeResizing) {
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
    const { selectedResource, selectResource } = this.props;

    return (
      <>
        <List disablePadding>
          <ListItem
            button
            style={{ height: 54 }}
            selected={ selectedResource === undefined }
            onClick={ () => selectResource(undefined) }
          >
            <ListItemAvatar>
              <Avatar style={{ height: 28, width: 28, background: blueGrey[900] }}>
                <SettingsIcon fontSize="small" htmlColor="#fff" />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary={ strings.applicationSettings.settings } />
            <ListItemSecondaryAction>
              <ChevronRight/>
            </ListItemSecondaryAction>
          </ListItem>
        </List>
        <Divider/>
        { this.renderResourceTree() }
        <AddResourceDialog
          open={ this.state.addResourceDialogOpen }
          onClose={ this.onDialogCloseClick }
        />
      </>
    );
  };

  /**
   * Renders resource tree
   */
  private renderResourceTree = () => {
    const { classes } = this.props;
    const { loading } = this.state;

    if (loading) {
      return (
        <Box className={ classes.treeLoaderContainer }>
          <Box textAlign="center">
            <LinearProgress/>
            <Box mt={ 2 }>
              <Typography>
                { strings.applicationEditor.loadingContentTree }
              </Typography>
            </Box>
          </Box>
        </Box>
      );
    }

    return <ResourceTree/>;
  }

  /**
   * Render editor method
   */
  private renderEditor = () => {
    const { classes, customerId, deviceId, selectedResource, application, keycloak } = this.props;
    const { rootResource } = this.state;

    if (!rootResource) {
      return (
        <main className={ classes.content }>
          <Box className={ classes.loaderContainer }>
            <Box>
              <CircularProgress />
            </Box>
          </Box>
        </main>
      );
    }

    if (selectedResource) {
      return (
        <main className={ classes.content }>
          { this.renderResourceSettingsView(selectedResource, customerId) }
        </main>
      );
    }

    if (application) {
      return (
        <main className={ classes.content }>
          <AppSettingsView
            keycloak={ keycloak }
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
    }

    return <main className={ classes.content }/>;
  };

  /**
   * Renders resource settings view
   *
   * @param resource resource
   * @param customerId customer ID
   */
  private renderResourceSettingsView = (resource: Resource, customerId: string) => {
    const { keycloak, deviceId, applicationId } = this.props;

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
          keycloak={ keycloak }
          deviceId={ deviceId }
          applicationId={ applicationId }
        />;
      case ResourceType.PAGE:
        return <PageResourceSettingsView
          resource={ resource }
          customerId={ customerId }
          confirmationRequired={ this.confirmationRequired }
          onAddChild={ this.onAddNewResourceClick }
          onSave={ this.onUpdateResource }
          onSaveChildren={ this.onUpdateChildResources }
          onDelete={ this.onDeleteResource }
          onDeleteChild={ this.onDeleteResource }
          keycloak={ keycloak }
          deviceId={ deviceId }
          applicationId={ applicationId }
        />;
      case ResourceType.SLIDESHOWPDF:
        return <PDFResourceSettingsView
          resource={ resource }
          customerId={ customerId }
          confirmationRequired={ this.confirmationRequired }
          onSave={ this.onUpdateResource }
          onDelete={ this.onDeleteResource }
          keycloak={ keycloak }
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
   * Event handler for resource delete
   */
  private onResourceDelete = async () => {
    const {
      keycloak,
      selectedResource,
      deleteResources,
      customerId,
      deviceId,
      applicationId
    } = this.props;

    if (!keycloak?.token) {
      return;
    }

    if (selectedResource?.id && window.confirm(`${strings.deleteResourceDialogDescription} ${selectedResource.name} ${ strings.andAllChildren}?`)) {
      try {
        await Api.getResourcesApi(keycloak.token).deleteResource({
          customerId: customerId,
          deviceId: deviceId,
          applicationId: applicationId,
          resourceId: selectedResource.id || ""
        });

        deleteResources([ selectedResource, ...this.getResourceBranch(selectedResource) ]);
        toast.success(strings.deleteSuccessMessage);
      } catch (error) {
        this.context.setError(
          strings.formatString(strings.errorManagement.resource.delete, selectedResource.name),
          error
        );
      }
    }
  };

  /**
   * Returns whole branch of resource tree structure starting from given parent resource
   *
   * @param parentResource parent resource
   *
   * @returns List of resources
   */
  private getResourceBranch = (parentResource: Resource): Resource[] => {
    const { resources } = this.props;

    return resources.reduce<Resource[]>((list, resource) => {
      const children = resources.filter(resource => resource.parentId === parentResource.id);

      if (children) {
        list.push(...children.map(this.getResourceBranch).flat());
      }

      return list;
    }, []);
  }

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
   * Update resource method
   *
   * @param resource resource
   */
  private onUpdateResource = async (resource: Resource) => {
    const { keycloak, customerId, deviceId, applicationId, selectResource, updateResources } = this.props;

    if (!keycloak || !keycloak.token) {
      return;
    }

    this.setState({ isSaving: true });

    try {
      if (!resource.id) {
        throw new Error("No resource ID");
      }

      const updatedResource = await Api.getResourcesApi(keycloak.token).updateResource({
        resource: resource,
        customerId: customerId,
        deviceId: deviceId,
        applicationId: applicationId,
        resourceId: resource.id
      });

      updateResources([ updatedResource ]);

      if (updatedResource.type !== ResourceType.ROOT) {
        selectResource(updatedResource);
      } else {
        this.setState({ rootResource: updatedResource });
      }

      this.setState({
        isSaving: false,
        confirmationRequired: false
      });

      toast.success(strings.updateSuccessMessage);
    } catch (error) {
      this.context.setError(strings.errorManagement.resource.update, error);
      this.clear();
    }
  };

  /**
   * Handles update child resources
   *
   * @param childResources child resources
   */
  private onUpdateChildResources = async (childResources: Resource[]) => {
    const { keycloak, customerId, deviceId, applicationId, updateResources } = this.props;
    const token = keycloak?.token;

    if (!token) {
      return;
    }

    try {
      const updatedResources = await Promise.all(
        childResources.map(resource =>
          Api.getResourcesApi(token).updateResource({
            resource: resource,
            customerId: customerId,
            deviceId: deviceId,
            applicationId: applicationId,
            resourceId: resource.id!
          })
        )
      );

      updateResources(updatedResources);
    } catch (error) {
      this.context.setError(strings.errorManagement.resource.updateChild);
    }

  }

  /**
   * Delete resource method
   *
   * @param resource resource
   * @param nextSelectResource next open resource
   */
  private onDeleteResource = async (resource: Resource, nextSelectResource?: Resource) => {
    const { keycloak, customerId, deviceId, applicationId, selectResource } = this.props;

    if (!keycloak || !keycloak.token || !resource.id) {
      return;
    }

    const resourcesApi = Api.getResourcesApi(keycloak.token);
    const { setError } = this.context;

    let childResources: Resource[] = [];
    try {
      childResources = await resourcesApi.listResources({
        customerId: customerId,
        deviceId: deviceId,
        applicationId: applicationId,
        parentId: resource.id
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
          resourceId: resource.id
        });

        selectResource(nextSelectResource);
        toast.success(strings.deleteSuccessMessage);
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
    this.setState({ confirmationRequired: value });
  }

  /**
   * Update application method
   *
   * @param application application
   */
  private onUpdateApplication = async (application: Application) => {
    const { keycloak, customerId, deviceId, applicationId, setApplication } = this.props;

    if (!keycloak?.token) {
      return;
    }

    try {
      const updatedApplication = await Api.getApplicationsApi(keycloak.token).updateApplication({
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
      setDevice,
      setCustomer,
      setApplication,
      setContentVersions,
      selectContentVersion,
      setResources
    } = this.props;

    try {
      const [ customer, device, application ] = await Promise.all([
        this.getCustomer(),
        this.getDevice(),
        this.getApplication()
      ]);

      const [ rootResource, contentVersions ] = await Promise.all([
        this.getRootResource(application),
        this.listContentVersions(application)
      ]);

      const activeContentVersion = contentVersions.find(version => version.id === application.activeContentVersionResourceId);

      if (!activeContentVersion?.id) {
        throw new Error("No active content version");
      }

      const resources = await this.listChildResources(activeContentVersion.id);
      const childResources = await Promise.all(resources.map(resource => this.listChildResources(resource.id!)));
      resources.push(...childResources.flat());

      setCustomer(customer);
      setDevice(device);
      setApplication(application);
      setContentVersions(contentVersions);
      selectContentVersion(activeContentVersion);
      setResources(resources);

      this.setState({ rootResource: rootResource });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : error;
      this.context.setError(errorMessage, error);
    }
  }

  /**
   * Returns customer
   */
  private getCustomer = async (): Promise<Customer> => {
    const { keycloak, customerId, customer } = this.props;

    if (customer?.id === customerId) {
      return customer;
    }

    if (!keycloak?.token) {
      throw new Error("No keycloak token");
    }

    try {
      return await Api.getCustomersApi(keycloak.token).findCustomer({ customerId: customerId });
    } catch (error) {
      return Promise.reject(new Error(strings.errorManagement.customer.find));
    }
  }

  /**
   * Returns device
   */
  private getDevice = async (): Promise<Device> => {
    const { keycloak, customerId, deviceId, device } = this.props;

    if (device?.id === deviceId) {
      return device;
    }

    if (!keycloak?.token) {
      throw new Error("No keycloak token");
    }

    try {
      return await Api.getDevicesApi(keycloak.token).findDevice({
        customerId: customerId,
        deviceId: deviceId
      });
    } catch (error) {
      return Promise.reject(new Error(strings.errorManagement.device.find));
    }
  }

  /**
   * Returns application
   */
  private getApplication = async (): Promise<Application> => {
    const { keycloak, customerId, deviceId, applicationId, application } = this.props;

    if (application?.id === applicationId) {
      return application;
    }

    if (!keycloak?.token) {
      throw new Error("No keycloak token");
    }

    try {
      return await Api.getApplicationsApi(keycloak.token).findApplication({
        customerId: customerId,
        deviceId: deviceId,
        applicationId: applicationId
      });
    } catch (error) {
      return Promise.reject(new Error(strings.errorManagement.application.find));
    }
  }

  /**
   * Returns root resource
   *
   * @param application application
   */
  private getRootResource = async (application: Application): Promise<Resource> => {
    const { keycloak, customerId, deviceId, applicationId } = this.props;

    if (!keycloak?.token) {
      throw new Error("No keycloak token");
    }

    if (!application.rootResourceId) {
      throw new Error("No root resource ID in application");
    }

    try {
      return await Api.getResourcesApi(keycloak.token).findResource({
        customerId: customerId,
        deviceId: deviceId,
        applicationId: applicationId,
        resourceId: application.rootResourceId
      });
    } catch (error) {
      return Promise.reject(new Error(strings.errorManagement.resource.find));
    }
  }

  /**
   * Lists content versions
   *
   * @param application application
   */
  private listContentVersions = async (application: Application): Promise<Resource[]> => {
    const { keycloak, customerId, deviceId, applicationId } = this.props;

    if (!keycloak?.token) {
      throw new Error("No keycloak token");
    }

    if (!application.rootResourceId) {
      throw new Error("No root resource ID in application");
    }

    try {
      return await Api.getResourcesApi(keycloak.token).listResources({
        customerId: customerId,
        deviceId: deviceId,
        applicationId: applicationId,
        resourceType: ResourceType.CONTENTVERSION,
        parentId: application.rootResourceId
      });
    } catch (error) {
      return Promise.reject(new Error(strings.errorManagement.contentVersion.list));
    }
  }

  /**
   * List child resources
   *
   * @param parentId parent ID
   */
  private listChildResources = async (parentId: string): Promise<Resource[]> => {
    const { keycloak, customerId, deviceId, applicationId } = this.props;

    if (!keycloak?.token) {
      throw new Error("No keycloak token");
    }

    try {
      return await Api.getResourcesApi(keycloak.token).listResources({
        customerId: customerId,
        deviceId: deviceId,
        applicationId: applicationId,
        parentId: parentId
      });
    } catch (error) {
      return Promise.reject(new Error(strings.errorManagement.resource.listChild));
    }
  }
}

/**
 * Maps redux state to props
 *
 * @param state redux state
 */
const mapStateToProps = (state: ReduxState) => ({
  keycloak: state.auth.keycloak,
  locale: state.locale.locale,
  customer: state.customer.customer,
  device: state.device.device,
  application: state.application.application,
  contentVersions: state.contentVersion.contentVersions,
  selectedContentVersion: state.contentVersion.selectedContentVersion,
  resources: state.resource.resources,
  selectedResource: state.resource.selectedResource
});

/**
 * Function for declaring dispatch functions
 *
 * @param dispatch Redux dispatch
 */
const mapDispatchToProps = (dispatch: ReduxDispatch) => ({
  setCustomer: (customer: Customer) => dispatch(setCustomer(customer)),
  setDevice: (device: Device) => dispatch(setDevice(device)),
  setApplication: (application: Application) => dispatch(setApplication(application)),
  setContentVersions: (contentVersions: ContentVersion[]) => dispatch(setContentVersions(contentVersions)),
  selectContentVersion: (contentVersion: ContentVersion) => dispatch(selectContentVersion(contentVersion)),
  setResources: (resources: Resource[]) => dispatch(setResources(resources)),
  selectResource: (resource?: Resource) => dispatch(selectResource(resource)),
  updateResources: (resources: Resource[]) => dispatch(updateResources(resources)),
  deleteResources: (resources: Resource[]) => dispatch(deleteResources(resources))
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type ExternalProps = ConnectedProps<typeof connector> & WithStyles<typeof styles>;

export default connector(withStyles(styles)(ApplicationEditor));