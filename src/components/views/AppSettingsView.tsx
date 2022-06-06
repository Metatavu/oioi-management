import * as React from "react";
import { ReduxDispatch, ReduxState } from "app/store";
import { connect, ConnectedProps } from "react-redux";
import { addResources } from "features/resource-slice";
import { addContentVersion, selectContentVersion } from "features/content-version-slice";
import { withStyles, WithStyles, TextField, Button, Divider, Typography, CircularProgress, IconButton, Box, Accordion, AccordionSummary, AccordionDetails } from "@material-ui/core";
import styles from "../../styles/editor-view";
import strings from "../../localization/strings";
import { Application, Resource } from "../../generated/client";
import { Form, initForm, validateForm, MessageType } from "ts-form-validation";
import { ApplicationForm, applicationRules, ResourceSettingsForm } from "../../commons/formRules";
import AddIconDialog from "../generic/AddIconDialog";
import ImagePreview from "../generic/ImagePreview";
import { ErrorContextType } from "../../types";
import { IconKeys, getLocalizedIconTypeString, getDefaultIconURL } from "../../commons/iconTypeHelper";
import VisibleWithRole from "../containers/VisibleWithRole";
import AddIcon from "@material-ui/icons/Add";
import { ErrorContext } from "../containers/ErrorHandler";
import { toast } from "react-toastify";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import GenericDialog from "components/generic/GenericDialog";
import { ResourceUtils } from "utils/resource";
import AdminOnly from "components/containers/AdminOnly";
import { Config } from "app/config";
import WallJSONImporter from "utils/wall-json-importer";

/**
 * Component Props
 */
interface Props extends ExternalProps {
  customerId: string;
  deviceId: string;
  rootResourceId: string;
  selectedContentVersion: Resource;
  onUpdateApplication: (application: Application) => void;
  onUpdateContentVersionResource: (contentVersion: Resource) => void;
  confirmationRequired: (value: boolean) => void;
  onDeleteApplicationClick: (application: Application) => void;
}

/**
 * Component state
 */
interface State {
  applicationForm: Form<ApplicationForm>;
  resourceMap: Map<string, string>;
  iconsMap: Map<string, string>;
  iconDialogOpen: boolean;
  importingContent: boolean;
  dataChanged: boolean;
  deleteApplicationDialogOpen: boolean;
}

/**
 * Creates Application setting view component
 */
class AppSettingsView extends React.Component<Props, State> {

  static contextType: React.Context<ErrorContextType> = ErrorContext;

  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      applicationForm: initForm<ApplicationForm>(
        {
          name: ""
        },
        applicationRules
      ),
      resourceMap: new Map<string, string>(),
      iconsMap: new Map<string, string>(),
      iconDialogOpen: false,
      importingContent: false,
      dataChanged: false,
      deleteApplicationDialogOpen: false
    };
  }

  /**
   * Component did mount life cycle handler
   */
  public componentDidMount = () => {
    const { application } = this.props;

    if (!application) {
      return;
    }

    let applicationForm = initForm<ApplicationForm>(
      { name: application?.name },
      applicationRules
    );

    applicationForm = validateForm(applicationForm);
    this.updateMaps(applicationForm);
  }

  /**
   * Component did update life cycle handler
   *
   * @param prevProps previous props
   */
  public componentDidUpdate = (prevProps: Props) => {
    const { applicationForm } = this.state;

    if (prevProps.selectedContentVersion !== this.props.selectedContentVersion) {
      this.updateMaps(validateForm(applicationForm));
    }
  }

  /**
   * Component render method
   */
  public render = () => {
    const { classes, keycloak, selectedContentVersion } = this.props;
    const { importingContent, dataChanged, applicationForm } = this.state;

    if (importingContent) {
      return (
        <Box className={ classes.loaderContainer }>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
          >
            <Box mb={ 2 }>
              <CircularProgress/>
            </Box>
            <Typography>
              { strings.importInProgress }
            </Typography>
          </Box>
        </Box>
      );
    }

    return (
      <>
        <Button
          className={ classes.saveButton }
          color="primary"
          variant="outlined"
          disabled={ !applicationForm.isFormValid || !dataChanged }
          onClick={ this.onUpdateApplication }
        >
          { strings.save }
        </Button>
        <Box mb={ 3 }>
          <Typography variant="h3">
            { strings.applicationBasicInformation }
          </Typography>
        </Box>
        { this.renderFields() }
        <Box mb={ 3 } mt={ 3 }>
          <Divider/>
        </Box>
        <Box display="flex" alignItems="flex-start">
          <Box mb={ 1 } mr={ 4 }>
            <Box mb={ 1 }>
              <Typography variant="h4" style={{ whiteSpace: "nowrap" }}>
                { strings.applicationSettings.background }
              </Typography>
            </Box>
            { this.renderMedia("applicationImage") }
          </Box>

          <Box mb={ 1 }>
            <Box mb={ 1 }>
              <Typography variant="h4" style={{ whiteSpace: "nowrap" }}>
                { strings.applicationSettings.icon }
              </Typography>
            </Box>
            { this.renderMedia("applicationIcon") }
          </Box>
        </Box>
        <Box mb={ 3 } mt={ 3 }>
          <Divider/>
        </Box>
        <Box mb={ 1 }>
          <Typography variant="h4">
            { strings.applicationSettings.icons }
          </Typography>
        </Box>

        <Box className={ classes.gridRow }>
          { this.renderIconList() }
        </Box>
        <AddIconDialog
          keycloak={ keycloak }
          resource={ selectedContentVersion }
          onSave={ this.onIconFileChange }
          onToggle={ this.toggleDialog }
          open={ this.state.iconDialogOpen }
        />
        <AdminOnly>
          { this.renderAdvancedSettings() }
        </AdminOnly>
      </>
    );
  }

  /**
   * Renders advanced settings
   */
  private renderAdvancedSettings = () => {
    const { classes, application } = this.props;

    return (
      <>
        <Box mt={ 3 } mb={ 3 }>
          <Divider/>
        </Box>
        <Accordion>
          <AccordionSummary
            expandIcon={ <ExpandMoreIcon color="primary" /> }
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Typography variant="h4">
              { strings.applicationSettings.advancedSettings }
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box
              mt={ 3 }
              mb={ 3 }
              className={ classes.advancedSettingRow }
            >
              <Box display="flex">
                <Typography variant="h5">
                  { strings.applicationId }
                </Typography>
                <Box ml={ 1 }>
                  <Typography variant="body1">
                    { application?.id }
                  </Typography>
                </Box>
              </Box>
              <Button
                disableElevation
                className={ classes.deleteButton }
                color="primary"
                variant="contained"
                onClick={ this.toggleDeleteApplicationDialog }
              >
                { strings.applicationEditor.deleteApplication }
              </Button>
            </Box>
            { this.renderWallJsonUrls() }
            <Box display="flex" mb={ 3 }>
              <Box mr={ 1 }>
                { this.renderTextField(strings.applicationSettings.returnDelay, 1, "text", undefined, "returnDelay") }
              </Box>
              <Box ml={ 1 }>
                { this.renderTextField(strings.applicationSettings.bundleId, 1, "text", undefined, "bundleId") }
              </Box>
            </Box>
            <VisibleWithRole role="admin">
              <Divider/>
              <Box mt={ 3 } mb={ 1 }>
                <Button
                  variant="outlined"
                  component="label"
                >
                  { strings.importLabel }
                  <input
                    hidden
                    type="file"
                    onChange={ this.onImportWallJson }
                  />
                </Button>
              </Box>
            </VisibleWithRole>
          </AccordionDetails>
        </Accordion>
        { this.renderDeleteApplicationDialog() }
      </>
    );
  }

  /**
   * Renders active wall json and current version json url
   */
  private renderWallJsonUrls = () => {
    const { application, selectedContentVersion } = this.props;

    if (!application) {
      return null;
    }

    const activeUrl = `${ Config.get().api.baseUrl }/v1/application/${ application.id }`;
    const versionUrl = `${ Config.get().api.baseUrl }/v1/application/${ application.id }/version/${ selectedContentVersion?.slug }`;

    return (
      <Box mb={ 3 }>
        <Typography variant="h5">
          { strings.applicationSettingsView.activeJsonUrl }
        </Typography>
        <Typography>
          { activeUrl }
        </Typography>
        <Box mt={ 2 }>
          <Typography variant="h5">
            { strings.applicationSettingsView.versionJsonUrl }
          </Typography>
          <Typography>
            { versionUrl }
          </Typography>
        </Box>
      </Box>
    );
  }

  /**
   * Render delete application confirmation dialog
   */
  private renderDeleteApplicationDialog = () => {
    const { onDeleteApplicationClick, application } = this.props;
    const { deleteApplicationDialogOpen } = this.state;

    if (!application) {
      return null;
    }

    return (
      <GenericDialog
        title={ strings.applicationSettings.deleteApplication }
        onCancel={ this.toggleDeleteApplicationDialog }
        onClose={ this.toggleDeleteApplicationDialog }
        onConfirm={ () => onDeleteApplicationClick(application) }
        open={ deleteApplicationDialogOpen }
        cancelButtonText={ strings.cancel }
        positiveButtonText={ strings.delete }
      >
        <Typography>{ strings.applicationSettings.deleteApplicationConfirmationText }</Typography>
      </GenericDialog>
    );
  }

  /**
   * Toggle delete dialog
   */
    private toggleDeleteApplicationDialog = () => {
      this.setState({ deleteApplicationDialogOpen: !this.state.deleteApplicationDialogOpen });
    }

  /**
   * Renders text fields
   */
  private renderFields = () => {
    return (
      <>
        <Box mb={ 3 }>
          { this.renderTextField(strings.applicationName, 1, "text", "name") }
        </Box>
        <Box mb={ 3 }>
          { this.renderTextField(strings.applicationSettings.teaserText, 8, "text", undefined, "teaserText") }
        </Box>
      </>
    );
  }

  /**
   * Render text fields with given form keys
   *
   * @param label text field label
   * @param rows rows
   * @param type text field type
   * @param appKey key of ApplicationForm
   * @param resourceKey key of ResourceSettingsForm
   */
  private renderTextField = (
    label: string,
    rows: number,
    type: string,
    appKey?: keyof ApplicationForm,
    resourceKey?: keyof ResourceSettingsForm
  ) => {
    if (appKey) {
      const values = this.state.applicationForm.values;
      const { messages: { [appKey]: message } } = this.state.applicationForm;

      return (
        <TextField
          fullWidth
          multiline
          rows={ rows }
          type={ type }
          error={ message && message.type === MessageType.ERROR }
          helperText={ message && message.message }
          value={ values[appKey] || "" }
          onChange={ this.onHandleChange(appKey) }
          onBlur={ this.onHandleBlur(appKey) }
          name={ appKey }
          variant="outlined"
          label={ label }
        />
      );
    } else if (resourceKey) {
      return (
        <TextField
          fullWidth
          multiline
          rows={ rows }
          type={ type }
          value={ this.state.resourceMap.get(resourceKey) || "" }
          onChange={ this.onHandleResourceChange(resourceKey) }
          name={ resourceKey }
          variant="outlined"
          label={ label }
        />
      );
    }
  }

  /**
   * Render media elements
   *
   * @param key key
   */
  private renderMedia = (key: string) => {
    const { selectedContentVersion } = this.props;

    const previewItem = this.state.resourceMap.get(key) || "";
    return (
      <ImagePreview
        uploadDialogTitle={ strings.fileUpload.addImage }
        uploadButtonText={ previewItem ? strings.fileUpload.changeImage : strings.fileUpload.addImage }
        allowSetUrl={ true }
        imagePath={ previewItem }
        onUpload={ this.onPropertyFileOrUrlChange }
        onSetUrl={ this.onPropertyFileOrUrlChange }
        resource={ selectedContentVersion }
        uploadKey={ key }
        onDelete={ this.onPropertyFileDelete }
      />
    );
  }

  /**
   * Render media elements
   */
  private renderIconList = () => {
    const { iconsMap } = this.state;
    const { classes, selectedContentVersion } = this.props;

    const icons: JSX.Element[] = [];
    const allKeys = Object.values(IconKeys);

    iconsMap.forEach((value: string, key: string) => {
      const iconTypeKey = allKeys.find(k => key === k.toString());
      const preview = (
        <Box key={ key } className={ classes.gridItem }>
          <Typography variant="h5" color="textSecondary">{ iconTypeKey ? getLocalizedIconTypeString(iconTypeKey) : key }</Typography>
          <ImagePreview
            uploadDialogTitle={ strings.fileUpload.addImage }
            uploadButtonText={ value ? strings.fileUpload.changeImage : strings.fileUpload.addImage }
            key={ key }
            imagePath={ value }
            allowSetUrl={ false }
            onSetUrl={ () => {} }
            onUpload={ this.onIconFileChange }
            resource={ selectedContentVersion }
            uploadKey={ key }
            onDelete={ this.onIconFileDelete }
          />
        </Box>
      );

      icons.push(preview);
    });

    return (
      <>
        { icons }
        <VisibleWithRole role="admin">
          <Box className={ classes.gridItem }>
            <Box className={ classes.newItem }>
              <IconButton
                title={ strings.addNewIcon }
                className={ classes.iconButton }
                onClick={ this.toggleDialog }
              >
                <AddIcon fontSize="large" />
              </IconButton>
            </Box>
          </Box>
        </VisibleWithRole>
      </>
    );
  }

  /**
   * Event handler for import wall JSON from file
   *
   * @param event React change event
   */
  private onImportWallJson = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const {
      keycloak,
      customerId,
      deviceId,
      application,
      rootResourceId,
      addContentVersion,
      selectContentVersion
    } = this.props;

    const file = event.target.files?.item(0);

    if (!file || !keycloak?.token || !application?.id) {
      return;
    }

    const importer = new WallJSONImporter({
      accessToken: keycloak.token,
      customerId: customerId,
      deviceId: deviceId,
      applicationId: application.id,
      rootResourceId: rootResourceId
    });

    const reader = new FileReader();

    reader.onload = async ({ target }) => {
      if (!target?.result || target.result instanceof ArrayBuffer) {
        return;
      }

      this.setState({ importingContent: true });

      try {
        const contentVersion = await importer.import(JSON.parse(target.result));
        addContentVersion(contentVersion);
        selectContentVersion(contentVersion);

        toast.success(strings.importDone);
      } catch (error) {
        this.context.setError(strings.errorManagement.resource.create, error);
      }

      this.setState({ importingContent: false });
    }

    reader.readAsText(file);
  }

  /**
   * Update version resource maps and icon map data
   *
   * @param applicationForm application form
   */
  private updateMaps(applicationForm: Form<ApplicationForm>) {
    const { selectedContentVersion } = this.props;
    
    const initResourceMap = new Map<string, string>();
    const initIconsMap = new Map<string, string>();
    const props = selectedContentVersion.properties;

    const iconKeys = Object.values(IconKeys);
    iconKeys.forEach(iconKey => !initIconsMap.has(iconKey) && initIconsMap.set(iconKey, getDefaultIconURL(iconKey)));

    if (props) {
      props.forEach(({ key, value }) =>
        key.startsWith("icon_") || initIconsMap.has(key) ?
          initIconsMap.set(key, value) :
          initResourceMap.set(key, value)
      );
    }

    this.setState({
      applicationForm: applicationForm,
      resourceMap: initResourceMap,
      iconsMap: initIconsMap
    });
  }

  /**
   * Toggle dialog
   */
  private toggleDialog = () => {
    this.setState({ iconDialogOpen: !this.state.iconDialogOpen });
  }

  /**
   * Handles update application
   */
  private onUpdateApplication = () => {
    const { onUpdateApplication } = this.props;
    const { name } = this.state.applicationForm.values;

    if (!name) {
      return;
    }

    const application = {
      ...this.props.application,
      name: name
    };

    this.onUpdateResource();
    onUpdateApplication(application);
  };

  /**
   * Handle resource update
   */
  private onUpdateResource = () => {
    const { onUpdateContentVersionResource } = this.props;
    const { resourceMap, iconsMap } = this.state;

    const properties = ResourceUtils.getPropertiesToUpdate(resourceMap, iconsMap);

    const resource = {
      ...this.props.selectedContentVersion,
      properties: properties.filter(p => !!p.value)
    } as Resource;

    onUpdateContentVersionResource(resource);

    this.setState({ dataChanged: false });
  };

  /**
   * Handles text fields change events
   *
   * @param key key
   * @param event event
   */
  private onHandleChange = (key: keyof ApplicationForm) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const values = {
      ...this.state.applicationForm.values,
      [key]: event.target.value
    };

    const applicationForm = validateForm(
      { ...this.state.applicationForm, values },
      { usePreprocessor: false }
    );

    this.setState({
      applicationForm,
      dataChanged: true,
    });

    this.props.confirmationRequired(true);
  };

  /**
   * Handles text fields change events
   *
   * @param key key
   * @param event React change event
   */
  private onHandleResourceChange = (key: keyof ResourceSettingsForm) => (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      resourceMap: new Map(this.state.resourceMap).set(key, event.target.value),
      dataChanged: true
    }, () => this.props.confirmationRequired(true));
  };

  /**
   * Handles fields blur event
   *
   * @param key
   */
  private onHandleBlur = (key: keyof ApplicationForm) => () => {
    let applicationForm = { ...this.state.applicationForm };
    const filled = {
      ...applicationForm.filled,
      [key]: true
    };

    applicationForm = validateForm({
      ...this.state.applicationForm,
      filled
    });

    this.setState({
      applicationForm,
      dataChanged: true
    });

    this.props.confirmationRequired(true);
  };

  /**
   * Handles image change
   *
   * @param newUri new URI
   * @param key key
   */
  private onPropertyFileOrUrlChange = (newUri: string, key: string) => {
    this.setState({
      resourceMap: new Map(this.state.resourceMap).set(key, newUri),
      dataChanged: true
    }, () => this.onUpdateResource());
  };

  /**
   * Handles icon change
   *
   * @param newUri new URI
   * @param key key
   */
  private onIconFileChange = (newUri: string, key: string) => {
    this.setState({
      iconsMap: new Map(this.state.iconsMap).set(key, newUri),
      dataChanged: true
    }, () => this.onUpdateResource());
  };

  /**
   * Delete property file with key
   */
  private onPropertyFileDelete = (key: string) => {
    const tempMap = new Map(this.state.resourceMap);

    tempMap.delete(key);
    this.setState({
      resourceMap: tempMap,
      dataChanged: true
    }, () => this.onUpdateResource());
  };

  /**
   * Delete icon file with key
   */
  private onIconFileDelete = (key: string) => {
    const tempMap = new Map(this.state.iconsMap);

    tempMap.delete(key);
    this.setState({
      iconsMap: tempMap,
      dataChanged: true
    }, () => this.onUpdateResource());
  };

}

/**
 * Maps Redux state to props
 *
 * @param state redux state
 */
const mapStateToProps = (state: ReduxState) => ({
  keycloak: state.auth.keycloak,
  application: state.application.application
});

/**
 * Function for declaring dispatch functions
 *
 * @param dispatch Redux dispatch
 */
const mapDispatchToProps = (dispatch: ReduxDispatch) => ({
  addResources: (resources: Resource[]) => dispatch(addResources(resources)),
  addContentVersion: (contentVersion: Resource) => dispatch(addContentVersion(contentVersion)),
  selectContentVersion: (contentVersion: Resource) => dispatch(selectContentVersion(contentVersion))
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type ExternalProps = ConnectedProps<typeof connector> & WithStyles<typeof styles>;

export default connector(withStyles(styles)(AppSettingsView));