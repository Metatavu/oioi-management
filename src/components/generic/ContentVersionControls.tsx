import * as React from "react";
import { Box, Button, Divider, List, ListItem, ListItemIcon, ListItemText, Popover, Tooltip, Typography, WithStyles, withStyles } from "@material-ui/core";
import { ReduxDispatch, ReduxState } from "app/store";
import { connect, ConnectedProps } from "react-redux";
import styles from "styles/generic/content-version-controls";
import { addContentVersion, deleteContentVersion, selectContentVersion, updateContentVersion } from "features/content-version-slice";
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
}

/**
 * Content version controls
 */
class ContentVersionControls extends React.Component<Props, State> {

  static contextType: React.Context<ErrorContextType> = ErrorContext;

  constructor(props: Props) {
    super(props);
    this.state = {
      popOverAnchor: null,
      addContentVersionDialogOpen: false
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
        <Typography variant="h5">
          { `${strings.contentVersionControls.contentVersion}:` }
        </Typography>
        { this.renderContentVersionSelect() }
        { this.renderSetAsActiveVersion() }
        { this.renderActiveContentVersion() }
        { this.renderAddNewDialog() }
      </Box>
    );
  }

  /**
   * Renders content version select
   */
  private renderContentVersionSelect = () => {
    const { classes, selectedContentVersion } = this.props;

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
    const { application, selectedContentVersion } = this.props;

    const alreadyActive = application?.activeContentVersionResourceId === selectedContentVersion?.id;

    const tooltipTitle = alreadyActive ?
      strings.contentVersionControls.alreadyActive :
      !selectedContentVersion ?
        strings.contentVersionControls.notSelected :
        "";

    return (
      <Tooltip title={ tooltipTitle }>
        <div>
          <Button
            color="primary"
            disabled={ !application || !selectContentVersion || alreadyActive }
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
    const { selectedContentVersion } = this.props;

    const disabled = selectedContentVersion?.id === contentVersion.id;

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
  private renderAddNewButton = () => {
    return (
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
  }

  /**
   * Renders add new dialog
   */
  private renderAddNewDialog = () => {
    const { addContentVersionDialogOpen } = this.state;

    return (
      <AddContentVersionDialog
        open={ addContentVersionDialogOpen }
        onSave={ this.onAddNewContentVersion }
        onClose={ () => this.setState({ addContentVersionDialogOpen: false }) }
      />
    );
  }

  /**
   * Event handler creator for select content version
   *
   * @param contentVersion content version
   */
  private onSelectContentVersion = (contentVersion: ContentVersion) => () => {
    const { selectContentVersion } = this.props;

    selectContentVersion(contentVersion);
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
    const { keycloak, application, addContentVersion, selectContentVersion } = this.props;

    const metadata = this.getRequestMetaData();

    if (!keycloak?.token || !application || !metadata) {
      return;
    }

    try {
      const contentVersion = copyId ?
        await this.copyContentVersion(name, slug, copyId, metadata) :
        await this.createContentVersion(name, slug, metadata);

      addContentVersion(contentVersion);
      selectContentVersion(contentVersion);
    } catch (error) {
      this.context.setError(strings.errorManagement.contentVersion.create, error);
    }
  }

  /**
   * Event handler for set as active version
   */
  private onSetAsActiveVersion = async () => {
    const { keycloak, application, selectedContentVersion, setApplication } = this.props;

    const metadata = this.getRequestMetaData();

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
      const updatedApplication = await Api.getApplicationsApi(keycloak.token).updateApplication({
        ...metadata,
        application: {
          ...application,
          activeContentVersionResourceId: selectedContentVersion.id
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
  selectedContentVersion: state.contentVersion.selectedContentVersion
});

/**
 * Function for declaring dispatch functions
 *
 * @param dispatch Redux dispatch
 */
const mapDispatchToProps = (dispatch: ReduxDispatch) => ({
  selectContentVersion: (contentVersion: ContentVersion) => dispatch(selectContentVersion(contentVersion)),
  addContentVersion: (contentVersion: ContentVersion) => dispatch(addContentVersion(contentVersion)),
  updateContentVersion: (contentVersion: ContentVersion) => dispatch(updateContentVersion(contentVersion)),
  deleteContentVersion: (contentVersion: ContentVersion) => dispatch(deleteContentVersion(contentVersion)),
  setApplication: (application: Application) => dispatch(setApplication(application))
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type ExternalProps = ConnectedProps<typeof connector> & WithStyles<typeof styles>;

export default connector(withStyles(styles)(ContentVersionControls));