import * as React from "react";
import { Typography, Divider, List, ListItem, AppBar, WithStyles, withStyles, Drawer, CircularProgress, ListItemText, ListItemSecondaryAction, Fade, Box, ListItemAvatar, Avatar, LinearProgress } from "@material-ui/core";
import { History } from "history";
import AppSettingsView from "../views/AppSettingsView";
import strings from "../../localization/strings";
import styles from "../../styles/editor-view";
import { connect, ConnectedProps } from "react-redux";
import { ContentVersion, ErrorContextType } from "../../types";
import Api from "../../api";
import { Customer, Device, Application, Resource, ResourceType } from "../../generated/client";
import AddResourceDialog from "../generic/AddResourceDialog";
import ResourceSettingsView from "../views/ResourceSettingsView";
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
import { setContentVersions, selectContentVersionId, updateContentVersion } from "features/content-version-slice";
import { setDevice } from "features/device-slice";
import { deleteResources, selectResource, setLockedResourceIds, setResources, updateResources } from "features/resource-slice";
import { ReduxDispatch, ReduxState } from "app/store";
import ResourceTree from "components/generic/ResourceTree";
import ContentVersionControls from "components/generic/ContentVersionControls";
import SlideshowResourceSettingsView from "components/views/SlideshowResourceSettingsView";
import IntroResourceSettingsView from "components/views/IntroResourceSettingsView";
import LanguageResourceSettingsView from "components/views/LanguageResourceSettingsView";
import LanguageMenuResourceSettingsView from "components/views/LanguageMenuResourceSettingsView";
import ApplicationResourceSettingsView from "components/views/ApplicationResourceSettingsView";
import AudioResourceSettingsView from "../views/AudioResourceSettingsView";
import GenericDialog from "components/generic/GenericDialog";
import ResourceLocksProvider from "components/containers/resource-locks-provider";
import MqttConnector from "components/containers/mqtt-connector";
import { Config } from "app/config";

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
 * Unsaved confirmation details
 */
interface ConfirmationDetails {
  resource?: Resource;
  type: "RESOURCE";
}

/**
 * Component state
 */
interface State {
  addResourceDialogOpen: boolean;
  deleteResourceDialogOpen: boolean;
  deleteApplicationDialogOpen: boolean;
  childToDelete?: Resource;
  parentResourceId?: string;
  rootResource?: Resource;
  treeResizing: boolean;
  treeWidth: number;
  isSaving: boolean;
  loading: boolean;
  deleting: boolean;
  confirmationRequired: boolean;
  confirmationDetails?: ConfirmationDetails;
  currentLockedResource?: Resource;
  savingLock: boolean;
}

/**
 * Component for application editor
 */
class ApplicationEditor extends React.Component<Props, State> {

  static contextType: React.Context<ErrorContextType> = ErrorContext;

  private resourceLockInterval?: NodeJS.Timeout;

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
      deleteResourceDialogOpen: false,
      deleteApplicationDialogOpen: false,
      confirmationRequired: false,
      treeResizing: false,
      treeWidth: 400,
      loading: true,
      deleting: false,
      currentLockedResource: undefined,
      savingLock: false
    };
  }

  /**
   * Component did mount life cycle method
   */
  public componentDidMount = async () => {
    document.addEventListener("mousemove", this.handleMousemove);
    document.addEventListener("mouseup", this.handleMouseup);
    window.addEventListener("beforeunload", this.componentCleanup);

    await this.fetchData();

    this.setState({ loading: false });
  };

  /**
   * Component did update life cycle method
   *
   * @param prevProps previous properties
   */
  public componentDidUpdate = async (prevProps: Props) => {
    const { application, selectedContentVersionId } = this.props;

    if (prevProps.application?.id !== application?.id) {
      this.setState({ loading: true });
      await this.fetchData();
      this.setState({ loading: false });
    }

    if (selectedContentVersionId && prevProps.selectedContentVersionId !== selectedContentVersionId) {
      this.setState({ loading: true });
      await this.setResources(selectedContentVersionId);
      this.setState({ loading: false });
    }
  };

  /**
   * Component will unmount life cycle method
   */
  public componentWillUnmount = () => {
    const { selectResource } = this.props;

    this.componentCleanup();
    selectResource(undefined);
    window.removeEventListener("beforeunload", this.componentCleanup);
    document.removeEventListener("mousemove", this.handleMousemove);
    document.removeEventListener("mouseup", this.handleMouseup);
  }

  /**
   * Component render method
   */
  public render = () => {
    const { classes, selectedResource, applicationId } = this.props;
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
              { selectedResource &&
                <Typography variant="h3" noWrap>
                  { selectedResource && getLocalizedTypeString(resourceType) }
                </Typography>
              }
              { !selectedResource &&
                <ContentVersionControls/>
              }
            </div>
          </AppBar>
          <MqttConnector>
            <ResourceLocksProvider
              applicationId={ applicationId }
            >
              { this.renderResponsiveDrawer() }
              { this.renderEditor() }
              { this.renderSavingOverlay() }
              { this.renderDeleteResourceDialog() }
              { this.renderDeleteApplicationDialog() }
              { this.renderConfirmUnsaved() }
            </ResourceLocksProvider>
          </MqttConnector>
        </div>
      </AppLayout>
    );
  }

  /**
   * Renders confirm unsaved dialog
   */
  private renderConfirmUnsaved = () => {
    const { confirmationDetails } = this.state;

    return (
      <GenericDialog
        title={ strings.confirmUnsavedChangesDialog.title }
        positiveButtonText={ strings.confirmUnsavedChangesDialog.confirm }
        cancelButtonText={ strings.confirmUnsavedChangesDialog.cancel }
        open={ !!confirmationDetails }
        onClose={ this.onConfirmUnsavedCancel }
        onConfirm={ this.onConfirmUnsavedConfirm }
        onCancel={ this.onConfirmUnsavedCancel }
      >
        { strings.confirmUnsavedChangesDialog.text }
      </GenericDialog>
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
    const { addResourceDialogOpen } = this.state;

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
          open={ addResourceDialogOpen }
          onClose={ this.onDialogCloseClick }
        />
      </>
    );
  };

  /**
   * Renders resource tree
   */
  private renderResourceTree = () => {
    const { classes, lockedResourceIds } = this.props;
    const { loading, savingLock } = this.state;

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

    return (
      <ResourceTree
        savingLock={ savingLock }
        lockedResourceIds={ lockedResourceIds }
        selectResource={ this.onResourceTreeSelectResource }
        isResourceLocked={ this.isResourceLocked }
      />
    );
  }

  /**
   * Render editor method
   */
  private renderEditor = () => {
    const {
      classes,
      customerId,
      deviceId,
      selectedResource,
      application,
      contentVersions,
      selectedContentVersionId
    } = this.props;
    const { loading, rootResource } = this.state;

    if (loading || !rootResource) {
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

    const selectedContentVersion = contentVersions.find(contentVersion => contentVersion.id === selectedContentVersionId);

    if (application && selectedContentVersion) {
      return (
        <main className={ classes.content }>
          <AppSettingsView
            confirmationRequired={ this.confirmationRequired }
            onUpdateApplication={ this.onUpdateApplication }
            onUpdateContentVersionResource={ this.onUpdateResource }
            rootResourceId={ rootResource.id!! }
            customerId={ customerId }
            deviceId={ deviceId }
            selectedContentVersion={ selectedContentVersion }
            onDeleteApplicationClick={ this.onDeleteApplication }
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

    const SettingsViewComponent = this.getResourceSettingsViewComponent(resource.type);

    return (
      <SettingsViewComponent
        keycloak={ keycloak }
        resource={ resource }
        customerId={ customerId }
        deviceId={ deviceId }
        applicationId={ applicationId }
        confirmationRequired={ this.confirmationRequired }
        onUpdate={ this.onUpdateResource }
        onDelete={ () => this.setState({ deleteResourceDialogOpen: true }) }
        onAddChild={ this.onAddNewResourceClick }
        onSave={ this.onUpdateResource }
        onDeleteChild={ child => this.setState({ deleteResourceDialogOpen: true, childToDelete: child }) }
      />
    );
  }

  /**
   * Returns resource settings view component
   *
   * @param type resource type
   */
  private getResourceSettingsViewComponent = (type: ResourceType) => {
    switch (type) {
      case ResourceType.MENU: return MenuResourceSettingsView;
      case ResourceType.LANGUAGE: return LanguageResourceSettingsView;
      case ResourceType.LANGUAGEMENU: return LanguageMenuResourceSettingsView;
      case ResourceType.APPLICATION: return ApplicationResourceSettingsView;
      case ResourceType.INTRO: return IntroResourceSettingsView;
      case ResourceType.SLIDESHOW: return SlideshowResourceSettingsView;
      case ResourceType.SLIDESHOWPDF: return PDFResourceSettingsView;
      case ResourceType.AUDIO: return AudioResourceSettingsView;
      case ResourceType.PAGE: return PageResourceSettingsView;
      default: return ResourceSettingsView;
    }
  }

  /**
   * Renders delete resource dialog
   */
  private renderDeleteResourceDialog = () => {
    const { selectedResource } = this.props;
    const { deleteResourceDialogOpen, childToDelete, deleting } = this.state;

    if (!childToDelete && !selectedResource) {
      return null;
    }

    return (
      <GenericDialog
        open={ deleteResourceDialogOpen }
        onClose={ () => this.setState({ deleteResourceDialogOpen: false, childToDelete: undefined }) }
        onCancel={ () => this.setState({ deleteResourceDialogOpen: false, childToDelete: undefined }) }
        onConfirm={ () => this.onDeleteResource((childToDelete || selectedResource)!) }
        title={ this.getDeleteResourceTitle(childToDelete || selectedResource!) }
        positiveButtonText={ strings.delete }
        cancelButtonText={ strings.cancel }
        style={{ minWidth: 500 }}
        showLoader={ deleting }
      >
        <Typography>
          { strings.actionCannotBeReverted }
        </Typography>
      </GenericDialog>
    );
  }

  /**
   * Renders delete application dialog
   */
  private renderDeleteApplicationDialog = () => {
    const { deleteApplicationDialogOpen } = this.state;

    return (
      <GenericDialog
        open={ deleteApplicationDialogOpen }
        onClose={ () => this.setState({ deleteApplicationDialogOpen: false }) }
        onCancel={ () => this.setState({ deleteApplicationDialogOpen: false }) }
        onConfirm={ this.onDeleteApplication }
        title={ strings.applicationSettings.deleteApplication }
        style={{ minWidth: 500 }}
      />
    )
  }

  /**
   * Event handler for delete application click
   */
  private onDeleteApplication = async () => {
    const { history, keycloak, customerId, deviceId, applicationId } = this.props;

    if (!keycloak?.token) {
      return;
    }

    try {
      await Api.getApplicationsApi(keycloak.token).deleteApplication({
        customerId: customerId,
        deviceId: deviceId,
        applicationId: applicationId
      });

      toast.success(strings.deleteSuccessMessage);
      history.push(`/${customerId}/devices/${deviceId}/applications`);
    } catch (error) {
      this.context.setError(strings.errorManagement.application.delete, error);
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
   * @param childResources child resources to be updated (optional)
   */
  private onUpdateResource = async (resource: Resource, childResources?: Resource[]) => {
    const {
      keycloak,
      customerId,
      deviceId,
      applicationId,
      selectResource,
      updateResources,
      updateContentVersion
    } = this.props;

    if (!keycloak || !keycloak.token) {
      return;
    }

    const { token } = keycloak

    this.setState({ isSaving: true });

    try {
      if (!resource.id) {
        throw new Error("No resource ID");
      }

      const updateResourceCalls = [];

      updateResourceCalls.push(Api.getResourcesApi(token).updateResource({
        resource: resource,
        customerId: customerId,
        deviceId: deviceId,
        applicationId: applicationId,
        resourceId: resource.id
      }));

      if (childResources) {
        childResources.forEach(childResource =>
          updateResourceCalls.push(Api.getResourcesApi(token).updateResource({
            resource: childResource,
            customerId: customerId,
            deviceId: deviceId,
            applicationId: applicationId,
            resourceId: childResource.id!
          }))
        );
      };

      const updatedResources = await Promise.all(updateResourceCalls);
      const updatedResource = updatedResources[0];

      updateResources(updatedResources);
      const resourceType = resource.type;

      if (resourceType === ResourceType.CONTENTVERSION) {
        updateContentVersion(updatedResource);
      } else {
        selectResource(updatedResource);
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
   * Returns delete resource title
   *
   * @param resourceType resource type
   */
  private getDeleteResourceTitle = (resource: Resource) => strings.formatString(
    strings.deleteConfirmationsByType[resource.type as keyof typeof strings.deleteConfirmationsByType],
    resource.name
  ) as string;

  /**
   * Delete resource method
   *
   * @param resource resource
   */
  private onDeleteResource = async (resource: Resource) => {
    const { keycloak, customerId, deviceId, applicationId, deleteResources, lockedResourceIds } = this.props;

    this.setState({
      deleting: true
    });

    if (!keycloak || !keycloak.token || !resource?.id) {
      return;
    }

    const resourcesApi = Api.getResourcesApi(keycloak.token);

    try {
      // TODO: commented code is incomplete but potential solution for the resource lock 404 errors
      // const lockResource = this.getLockResource(resource);
      // if (!lockResource) throw new Error("Error obtaining lock resource");

      // await this.releaseLock(lockResource);
      await resourcesApi.deleteResource({
        customerId: customerId,
        deviceId: deviceId,
        applicationId: applicationId,
        resourceId: resource.id
      });

      deleteResources([ resource ]);

      // setLockedResourceIds(lockedResourceIds.filter(lockedResourceId => lockedResourceId !== resource.id));
      this.setState({
        deleting: false
      });
      toast.success(strings.deleteSuccessMessage);
      this.setState({ deleteResourceDialogOpen: false, childToDelete: undefined });
    } catch (error) {
      this.context.setError(strings.errorManagement.resource.delete, error);
    }
  };

  /**
   * Confirm unsaved confirm handler
   */
  private onConfirmUnsavedConfirm = () => {
    const { confirmationDetails } = this.state;

    if (confirmationDetails?.type === "RESOURCE") {
      this.selectResource(confirmationDetails?.resource);
    }

    this.setState({
      confirmationRequired: false,
      confirmationDetails: undefined
    });
  };

  /**
   * Confirm unsaved cancel handler
   */
  private onConfirmUnsavedCancel = () => {
    this.setState({
      confirmationDetails: undefined
    });
  };

  /**
   * Resource tree select resource event handler
   *
   * @param resource selected resource
   */
  private onResourceTreeSelectResource = (resource?: Resource) => {
    const { confirmationRequired } = this.state;

    if (!confirmationRequired) {
      this.selectResource(resource);
    } else {
      this.setState({
        confirmationDetails: {
          type: "RESOURCE",
          resource: resource
        }
      });
    }
  }

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
      selectContentVersionId,
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
      selectContentVersionId(activeContentVersion.id);
      setResources(resources);

      this.setState({ rootResource: rootResource });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : error;
      this.context.setError(errorMessage, error);
    }
  }

  /**
   * Sets resources to ones found under content version with given ID
   *
   * @param contentVersionId content version ID
   */
  private setResources = async (contentVersionId: string) => {
    const { setResources } = this.props;

    try {
      const resources = await this.listChildResources(contentVersionId);
      const childResources = await Promise.all(resources.map(resource => this.listChildResources(resource.id!)));
      resources.push(...childResources.flat());
      setResources(resources);
    } catch (error) {
      this.context.setError(strings.errorManagement.resource.list, error);
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
   *
   * @returns found device
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
   *
   * @returns found application
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
   *
   * @returns found resource
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
   *
   * @returns list of resources
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
   *
   * @returns list of child resources
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

  /**
   * Handler for selecting selected resource
   *
   * @param resource selected resource
   */
  private selectResource = async (resource: Resource | undefined) => {
    if (this.isResourceLocked(resource)) {
      this.selectResource(undefined);
      this.context.setError(strings.errorManagement.resource.otherUserEditing);
    } else {
      const previouslyLockedResource = this.state.currentLockedResource;
      const lockResource = this.getLockResource(resource);

      if (await this.releaseAndAcquireLock(lockResource, previouslyLockedResource)) {
        this.props.selectResource(resource);
      } else {
        this.props.selectResource(undefined);
        this.context.setError(strings.errorManagement.resource.otherUserEditing);
      }
    }
  }

  /**
   * Returns whether given resource is locked or not
   *
   * @param resource resource
   * @returns whether given resource is locked or not
   */
  private isResourceLocked = (resource?: Resource): boolean => {
    const { currentLockedResource } = this.state;
    const { lockedResourceIds } = this.props;
    const resourceId = resource?.id;

    if (!resource || !resourceId) {
      return false;
    }

    if (resource?.id !== currentLockedResource?.id && lockedResourceIds.includes(resourceId)) {
      return true;
    }

    const parentResource = this.findResourceById(resource?.parentId);
    if (parentResource && this.shouldLockParent(parentResource.type)) {
      const parentId = parentResource.id!;
      return parentId !== currentLockedResource?.id && lockedResourceIds.includes(parentId);
    };

    return false;
  }

  /**
   * Component clean up for unmount and beforeunload page event
   */
  private componentCleanup = () => {
    const { currentLockedResource } = this.state;

    if (currentLockedResource) {
      this.releaseLock(currentLockedResource);
      this.releaseLockWithServiceWorker(currentLockedResource);
    }
  }

  /**
   * Releases single resource lock
   *
   * @param lockResource lock resource
   */
  private releaseLock = async (lockResource: Resource) => {
    const { keycloak, customer, device, application } = this.props;

    if (!keycloak?.token || !customer?.id || !device?.id || !application?.id || !lockResource.id) {
      return;
    }

    if (this.resourceLockInterval) {
      clearInterval(this.resourceLockInterval);
      this.resourceLockInterval = undefined;
    }

    try {
      await Api.getResourcesApi(keycloak.token).deleteResourceLock({
        customerId: customer.id,
        deviceId: device.id,
        applicationId: application.id,
        resourceId: lockResource.id
      });

      this.setState({
        currentLockedResource: undefined
      });
    } catch (error) {
      console.error("Failed to release lock", error);
    }
  }

  /**
   * Acquires a resource lock
   *
   * @param lockResource resource to be locked
   * @return whether lock was acquired successfully
   */
  private acquireLock = async (lockResource: Resource): Promise<boolean> => {
    const { keycloak, customer, device, application } = this.props;

    if (!keycloak?.token || !customer?.id || !device?.id || !application?.id || !lockResource?.id) {
      return false;
    }

    const resourcesApi = Api.getResourcesApi(keycloak.token);

    try {
      await resourcesApi.updateResourceLock({
        customerId: customer.id,
        deviceId: device.id,
        applicationId: application.id,
        resourceId: lockResource.id,
        resourceLock: {}
      });

      this.setState({
        currentLockedResource: lockResource
      });

      this.resourceLockInterval = setInterval(this.renewLock, 10000);

      return true;
    } catch (error) {
      console.error("Failed to obtain lock", error);
    }

    return false;
  }

  /**
   * Release old resource lock and acquire new lock for selected resource
   *
   * @param newLockResource new resource to be locked
   * @param previousLockResource previously locked resource
   * @return whether lock was acquired successfully
   */
  private releaseAndAcquireLock = async (newLockResource?: Resource, previousLockResource?: Resource): Promise<boolean> => {
    if (newLockResource?.id === previousLockResource?.id) {
      return true;
    }

    let result = true;

    this.setState({
      savingLock: true
    });

    try {
      if (previousLockResource) {
        await this.releaseLock(previousLockResource);
      }
    } catch (error) {
      console.error("Error while releasing lock", error);
    }

    try {
      if (newLockResource) {
        result = await this.acquireLock(newLockResource);
      }
    } catch (error) {
      console.error("Error while acquiring lock", error);
    }

    this.setState({
      savingLock: false
    });

    return result;
  }

  /**
   * Renews single lock
   */
  private renewLock = async () => {
    const { keycloak, customer, device, application } = this.props;
    const { currentLockedResource } = this.state;

    if (!keycloak?.token || !customer?.id || !device?.id || !application?.id || !currentLockedResource?.id) {
      return;
    }

    await Api.getResourcesApi(keycloak.token).updateResourceLock({
      customerId: customer.id,
      deviceId: device.id,
      applicationId: application.id,
      resourceId: currentLockedResource.id,
      resourceLock: {}
    });
  }

  /**
   * Returns lock resource for given resource.
   *
   * Lock resource can be either the resource itself or it's parent depending on the
   * type of the parent resource
   *
   * @param resource resource
   * @returns lock resource
   */
  private getLockResource = (resource: Resource | undefined) => {
    if (!resource) {
      return undefined;
    }

    const parentResource = this.findResourceById(resource.parentId);
    if (!parentResource) {
      return resource;
    }

    return this.shouldLockParent(parentResource.type) ? parentResource : resource;
  }

  /**
   * Returns whether parent should be locked instead of current resource
   *
   * @param parentType type of
   * @returns whether parent should be locked instead of current resource
   */
  private shouldLockParent = (parentType: ResourceType) => parentType === ResourceType.PAGE;

  /**
   * Finds resource by id
   *
   * @param id id
   * @returns found resource or undefined if not found
   */
  private findResourceById = (id: string | undefined) => {
    if (!id) {
      return undefined;
    }

    const { resources } = this.props;

    return resources.find(resource => resource.id === id);
  }

  /**
   * Releases lock with service worker
   *
   * @param lockedResource locked resource
   */
  private releaseLockWithServiceWorker = (lockedResource: Resource) => {
    const { keycloak, customer, device, application } = this.props;

    if (!keycloak?.token || !customer?.id || !device?.id || !application?.id || !lockedResource?.id) {
      return;
    }

    navigator.serviceWorker.controller?.postMessage({
      url: `${Config.get().api.baseUrl}/v1/customers/${customer.id}/devices/${device.id}/applications/${application.id}/resources/${lockedResource.id}/lock`,
      method: "DELETE",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        "Authorization": `Bearer ${keycloak.token}`
      },
      body: JSON.stringify({
        customerId: customer.id,
        deviceId: device.id,
        applicationId: application.id,
        resourceId: lockedResource.id
      })
    });
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
  selectedContentVersionId: state.contentVersion.selectedContentVersionId,
  resources: state.resource.resources,
  selectedResource: state.resource.selectedResource,
  lockedResourceIds: state.resource.lockedResourceIds
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
  selectContentVersionId: (contentVersionId: string | undefined) => dispatch(selectContentVersionId(contentVersionId)),
  updateContentVersion: (contentVersion: ContentVersion) => dispatch(updateContentVersion(contentVersion)),
  setResources: (resources: Resource[]) => dispatch(setResources(resources)),
  selectResource: (resource?: Resource) => dispatch(selectResource(resource)),
  updateResources: (resources: Resource[]) => dispatch(updateResources(resources)),
  deleteResources: (resources: Resource[]) => dispatch(deleteResources(resources))
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type ExternalProps = ConnectedProps<typeof connector> & WithStyles<typeof styles>;

export default connector(withStyles(styles)(ApplicationEditor));