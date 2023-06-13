import * as React from "react";
import { Box, Button, Divider, List, ListItem, ListItemIcon, ListItemText, Popover, Tooltip, Typography, WithStyles, withStyles } from "@material-ui/core";
import { ReduxDispatch, ReduxState } from "app/store";
import { connect, ConnectedProps } from "react-redux";
import styles from "styles/generic/content-version-controls";
import { addContentVersion, deleteContentVersion, selectContentVersionId, updateContentVersion } from "features/content-version-slice";
import { ApiRequestMetadata, ContentVersion, ErrorContextType } from "types";
import strings from "localization/strings";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import AddIcon from "@material-ui/icons/AddCircle";
import PlayCircleOutlineOutlinedIcon from "@material-ui/icons/PlayCircleOutlineOutlined";
import { setApplication } from "features/application-slice";
import { Application, ResourceType } from "generated/client";
import Api from "api";
import { toast } from "react-toastify";
import { ErrorContext } from "components/containers/ErrorHandler";
import AddContentVersionDialog from "./AddContentVersionDialog";
import moment from "moment";
import GenericDialog from "./GenericDialog";
import VisibleWithRole from "../containers/VisibleWithRole";

/**
 * Component properties
 */
interface Props extends ExternalProps { }

/**
 * Component state
 */
interface State {
  popOverAnchor: HTMLElement | null;
  addContentVersionDialogOpen: boolean;
  deleteVersionDialogOpen: boolean;
  creating: boolean;
}

/**
 * Content version controls
 */
class ContentVersionControls extends React.Component<Props, State> {

  static contextType: React.Context<ErrorContextType> = ErrorContext;

  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      popOverAnchor: null,
      addContentVersionDialogOpen: false,
      deleteVersionDialogOpen: false,
      creating: false
    }
  }

  /**
   * Component render
   */
  public render = () => {
    const { classes, contentVersions } = this.props;

    if (!contentVersions.length) {
      return <div/>;
    }

    return (
      <Box className={ classes.root }>
        <Box display="flex" alignItems="center">
          <Typography variant="h5">
            { `${strings.contentVersionControls.contentVersion}:` }
          </Typography>
          { this.renderContentVersionSelect() }
          { this.renderSetAsActiveVersion() }
          { this.renderActiveContentVersion() }
        </Box>
        <VisibleWithRole role="admin">
          <Box>
            { this.renderDeleteVersionButton() }
          </Box>
        </VisibleWithRole>
        { this.renderAddNewDialog() }
        { this.renderDeleteVersionDialog() }
      </Box>
    );
  }

  /**
   * Renders content version select
   */
  private renderContentVersionSelect = () => {
    const { classes } = this.props;
    const selectedContentVersion = this.getSelectedContentVersion();

    return (
      <>
        <Box
          className={ classes.contentVersionSelect }
          onClick={ ({ currentTarget }) => this.setState({ popOverAnchor: currentTarget }) }
        >
          <Typography>
            { selectedContentVersion?.name ?? strings.contentVersionControls.notSelected }
          </Typography>
          <ExpandMoreIcon/>
        </Box>
        { this.renderContentVersionPopOver() }
      </>
    );
  }

  /**
   * Renders set as active version
   */
  private renderSetAsActiveVersion = () => {
    const { application, selectedContentVersionId } = this.props;

    const alreadyActive = application?.activeContentVersionResourceId === selectedContentVersionId;

    const tooltipTitle = alreadyActive ?
      strings.contentVersionControls.alreadyActive :
      !selectedContentVersionId ?
        strings.contentVersionControls.notSelected :
        "";

    return (
      <Tooltip title={ tooltipTitle }>
        <div>
          <Button
            color="primary"
            disabled={ !application || !selectContentVersionId || alreadyActive }
            onClick={ this.onSetAsActiveVersion }
            startIcon={ <PlayCircleOutlineOutlinedIcon/> }
          >
            { strings.contentVersionControls.setActive }
          </Button>
        </div>
      </Tooltip>
    );
  }

  /**
   * Renders active content version
   */
  private renderActiveContentVersion = () => {
    const { classes, application, contentVersions } = this.props;

    const activeContentVersion = contentVersions.find(contentVersion =>
      contentVersion.id === application?.activeContentVersionResourceId
    );

    if (!activeContentVersion) {
      return null;
    }

    return (
      <Box className={ classes.activeVersion }>
        <Typography variant="h5">
          { `${strings.contentVersionControls.activeVersion}:` }
        </Typography>
        <Typography variant="h5">
          { activeContentVersion.name }
        </Typography>
      </Box>
    );
  }

  /**
   * Renders content version select
   */
  private renderContentVersionPopOver = () => {
    const { contentVersions } = this.props;
    const { popOverAnchor } = this.state;

    return (
      <Popover
        open={ !!popOverAnchor }
        anchorEl={ popOverAnchor }
        anchorOrigin={{
          horizontal: "left",
          vertical: "bottom"
        }}
        onClose={ () => this.setState({ popOverAnchor: null }) }
      >
        <List>
          {
            [ ...contentVersions ]
              .sort(this.sortByCreatedDate)
              .map(this.renderContentVersionOption)
          }
          <Divider/>
          { this.renderAddNewButton() }
        </List>
      </Popover>
    );
  }

  /**
   * Renders content version option
   *
   * @param contentVersion content version
   */
  private renderContentVersionOption = (contentVersion: ContentVersion) => {
    const { selectedContentVersionId } = this.props;

    const disabled = selectedContentVersionId === contentVersion.id;

    return (
      <ListItem
        button
        key={ contentVersion.id }
        disabled={ disabled }
        onClick={ this.onSelectContentVersion(contentVersion) }
      >
        <ListItemText primary={ contentVersion.name }/>
      </ListItem>
    );
  }

  /**
   * Renders add new button
   */
  private renderAddNewButton = () => (
    <ListItem
      button
      onClick={ () => this.setState({ addContentVersionDialogOpen: true, popOverAnchor: null }) }
    >
      <ListItemIcon>
        <AddIcon/>
      </ListItemIcon>
      <ListItemText primary={ strings.contentVersionControls.addNewVersion }/>
    </ListItem>
  );

  /**
   * Renders add new dialog
   */
  private renderAddNewDialog = () => {
    const { addContentVersionDialogOpen, creating } = this.state;

    return (
      <AddContentVersionDialog
        loading={ creating }
        open={ addContentVersionDialogOpen }
        onSave={ this.onAddNewContentVersion }
        onClose={ () => this.setState({ addContentVersionDialogOpen: false }) }
        loaderMessage={ strings.contentVersionControls.creatingContentVersion }
      />
    );
  }

  /**
   * Renders delete version button
   */
  private renderDeleteVersionButton = () => {
    const { classes, application, selectedContentVersionId } = this.props;

    const isActive = application?.activeContentVersionResourceId === selectedContentVersionId;

    const tooltipTitle = isActive ?
      strings.contentVersionControls.cannotDeleteActiveVersion :
      strings.contentVersionControls.deleteSelectedVersion;

    return (
      <Tooltip title={ tooltipTitle }>
        <div>
          <Button
            disableElevation
            className={ classes.deleteButton }
            color="primary"
            variant="contained"
            disabled={ isActive }
            onClick={ () => this.setState({ deleteVersionDialogOpen: true }) }
          >
            { strings.contentVersionControls.deleteVersion }
          </Button>
        </div>
      </Tooltip>
    );
  }

  /**
   * Render delete version confirmation dialog
   */
  private renderDeleteVersionDialog = () => {
    const { deleteVersionDialogOpen } = this.state;

    return (
      <GenericDialog
        showLoader
        title={ strings.contentVersionControls.deleteVersion }
        onCancel={ () => this.setState({ deleteVersionDialogOpen: false }) }
        onClose={ () => this.setState({ deleteVersionDialogOpen: false }) }
        onConfirm={ this.onDeleteVersion }
        open={ deleteVersionDialogOpen }
        cancelButtonText={ strings.cancel }
        positiveButtonText={ strings.delete }
        error={ false }
        loaderMessage={ strings.contentVersionControls.deletingContentVersion }
      >
        <Typography>
          { strings.contentVersionControls.deleteVersionConfirmationText }
        </Typography>
      </GenericDialog>
    );
  }

  /**
   * Event handler creator for select content version
   *
   * @param contentVersion content version
   */
  private onSelectContentVersion = (contentVersion: ContentVersion) => () => {
    const { selectContentVersionId } = this.props;

    selectContentVersionId(contentVersion.id);
    this.setState({ popOverAnchor: null });
  }

  /**
   * Event handler for add new content version
   *
   * @param name name
   * @param slug slug
   * @param copyId copy ID
   */
  private onAddNewContentVersion = async (name: string, slug: string, copyId?: string) => {
    const { keycloak, application, addContentVersion, selectContentVersionId } = this.props;
    const metadata = this.getRequestMetaData();

    this.setState({
      creating: true
    });

    if (!keycloak?.token || !application || !metadata) {
      return;
    }

    try {
      const contentVersion = copyId ?
        await this.copyContentVersion(name, slug, copyId, metadata) :
        await this.createContentVersion(name, slug, metadata);

      addContentVersion(contentVersion);
      selectContentVersionId(contentVersion.id);

      this.setState({
        creating: false,
        addContentVersionDialogOpen: false
      });
    } catch (error) {
      this.context.setError(strings.errorManagement.contentVersion.create, error);

      this.setState({
        creating: false,
        addContentVersionDialogOpen: false
      });
    }
  }

  /**
   * Event handler for set as active version
   */
  private onSetAsActiveVersion = async () => {
    const { keycloak, application, selectedContentVersionId, setApplication } = this.props;

    const metadata = this.getRequestMetaData();

    if (
      !keycloak?.token ||
      !application ||
      !metadata ||
      !selectedContentVersionId ||
      selectedContentVersionId === application.activeContentVersionResourceId
    ) {
      return;
    }

    try {
      const updatedApplication = await Api.getApplicationsApi(keycloak.token).updateApplication({
        ...metadata,
        application: {
          ...application,
          activeContentVersionResourceId: selectedContentVersionId
        }
      });

      setApplication(updatedApplication);
      toast.success(strings.contentVersionControls.activeVersionUpdateSuccess);
    } catch (error) {
      this.context.setError(strings.errorManagement.application.update, error);
    }
  }

  /**
   * Creates content version
   *
   * @param name name
   * @param slug slug
   * @param metadata metadata needed for request
   */
  private createContentVersion = async (name: string, slug: string, metadata: ApiRequestMetadata) => {
    const { keycloak, application, contentVersions } = this.props;

    if (!keycloak?.token || !application) {
      return Promise.reject("No token or application");
    }

    try {
      const resourcesApi = Api.getResourcesApi(keycloak.token);

      return await resourcesApi.createResource({
        ...metadata,
        resource: {
          name: name,
          slug: slug,
          type: ResourceType.CONTENTVERSION,
          parentId: application.rootResourceId,
          orderNumber: contentVersions.length + 1
        }
      });
    } catch (error) {
      return Promise.reject(error);
    }
  }

  /**
   * Copies content version from given copy ID
   *
   * @param name name
   * @param slug slug
   * @param copyId copy ID
   * @param metadata metadata needed for requests
   * @returns promise of created content version
   */
  private copyContentVersion = async (name: string, slug: string, copyId: string, metadata: ApiRequestMetadata): Promise<ContentVersion> => {
    const { keycloak, application } = this.props;

    if (!keycloak?.token || !application) {
      return Promise.reject("No token or application");
    }

    try {
      const resourcesApi = Api.getResourcesApi(keycloak.token);

      const createdVersion = await resourcesApi.createResource({
        ...metadata,
        copyResourceId: copyId,
        copyResourceParentId: application.rootResourceId
      });

      return await resourcesApi.updateResource({
        ...metadata,
        resourceId: createdVersion.id!,
        resource: {
          ...createdVersion,
          name: name,
          slug: slug
        }
      });
    } catch (error) {
      return Promise.reject(error);
    }
  }

  /**
   * Event handler for delete content version
   */
  private onDeleteVersion = async () => {
    const { keycloak, application, deleteContentVersion } = this.props;

    const metadata = this.getRequestMetaData();
    const selectedContentVersion = this.getSelectedContentVersion();

    if (
      !keycloak?.token ||
      !application ||
      !metadata ||
      !selectedContentVersion?.id ||
      selectedContentVersion.id === application.activeContentVersionResourceId
    ) {
      return;
    }

    try {
      await Api.getResourcesApi(keycloak.token).deleteResource({
        ...metadata,
        resourceId: selectedContentVersion.id
      });

      deleteContentVersion(selectedContentVersion);
      toast.success(strings.contentVersionControls.deleteVersionSuccess);
    } catch (error) {
      this.context.setError(strings.errorManagement.contentVersion.delete, error);
    }

    this.setState({ deleteVersionDialogOpen: false });
  }

  /**
   * Returns request metadata or undefined if something is missing
   */
  private getRequestMetaData = (): ApiRequestMetadata | undefined => {
    const { customer, device, application } = this.props;

    if (!customer?.id || !device?.id || !application?.id) {
      return;
    }

    return {
      customerId: customer.id,
      deviceId: device.id,
      applicationId: application.id
    };
  }

  /**
   * Sort content versions by created date in descending order
   *
   * @param versionA content version A
   * @param versionB content version B
   */
  private sortByCreatedDate = (versionA: ContentVersion, versionB: ContentVersion) => {
    const dateA = versionA.createdAt;
    const dateB = versionB.createdAt;

    if (!dateA && !dateB) return 0;
    if (!dateA && dateB) return 1;
    if (dateA && !dateB) return -1;

    return moment(dateB).diff(dateA);
  }

  /**
   * Returns selected content version or undefined if not set
   *
   * @returns selected content version or undefined if not set
   */
  private getSelectedContentVersion = () => {
    const { selectedContentVersionId, contentVersions } = this.props;
    if (!selectedContentVersionId) {
      return undefined;
    }

    return contentVersions.find(contentVersion => contentVersion.id === selectedContentVersionId);
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
  selectedContentVersionId: state.contentVersion.selectedContentVersionId
});

/**
 * Function for declaring dispatch functions
 *
 * @param dispatch Redux dispatch
 */
const mapDispatchToProps = (dispatch: ReduxDispatch) => ({
  selectContentVersionId: (contentVersionId: string | undefined) => dispatch(selectContentVersionId(contentVersionId)),
  addContentVersion: (contentVersion: ContentVersion) => dispatch(addContentVersion(contentVersion)),
  updateContentVersion: (contentVersion: ContentVersion) => dispatch(updateContentVersion(contentVersion)),
  deleteContentVersion: (contentVersion: ContentVersion) => dispatch(deleteContentVersion(contentVersion)),
  setApplication: (application: Application) => dispatch(setApplication(application))
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type ExternalProps = ConnectedProps<typeof connector> & WithStyles<typeof styles>;

export default connector(withStyles(styles)(ContentVersionControls));