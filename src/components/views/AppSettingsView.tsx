import * as React from "react";
import { withStyles, WithStyles, TextField, Button, Divider, Typography, CircularProgress, IconButton, Box, Accordion, AccordionSummary, AccordionDetails } from "@material-ui/core";
import styles from "../../styles/editor-view";
import strings from "../../localization/strings";
import theme from "../../styles/theme";
import { Application, Resource, KeyValueProperty } from "../../generated/client";
import { Form, initForm, validateForm, MessageType } from "ts-form-validation";
import { ApplicationForm, applicationRules, ResourceSettingsForm } from "../../commons/formRules";
import AddIconDialog from "../generic/AddIconDialog";
import ImagePreview from "../generic/ImagePreview";
import { ErrorContextType } from "../../types";
import Api from "../../api";
import { IconKeys, getLocalizedIconTypeString, getDefaultIconURL } from "../../commons/iconTypeHelper";
import VisibleWithRole from "../generic/VisibleWithRole";
import AddIcon from "@material-ui/icons/Add";
import { ErrorContext } from "../containers/ErrorHandler";
import { toast } from "react-toastify";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { KeycloakInstance } from "keycloak-js";
import GenericDialog from "components/generic/GenericDialog";

/**
 * Component Props
 */
interface Props extends WithStyles<typeof styles> {
  application: Application;
  customerId: string;
  deviceId: string;
  rootResource: Resource;
  keycloak?: KeycloakInstance;
  onUpdateApplication: (application: Application) => void;
  onUpdateRootResource: (rootResource: Resource) => void;
  confirmationRequired: (value: boolean) => void;
  onDeleteClick: (application: Application) => void;
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
  importDone: boolean;
  dataChanged: boolean;
  deleteDialogOpen: boolean;
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
      importDone: false,
      dataChanged: false,
      deleteDialogOpen: false
    };
  }

  /**
   * Component did mount life cycle handler
   */
  public componentDidMount = () => {
    const { application, rootResource } = this.props;

    let applicationForm = initForm<ApplicationForm>(
      {
        name: application.name
      },
      applicationRules
    );

    applicationForm = validateForm(applicationForm);
    this.updateMaps(rootResource, applicationForm);
  }

  /**
   * Component did update life cycle handler
   *
   * @param prevProps previous props
   */
  public componentDidUpdate = (prevProps: Props) => {
    const { rootResource } = this.props;
    const { applicationForm } = this.state;

    if (prevProps.rootResource !== this.props.rootResource) {
      this.updateMaps(rootResource, validateForm(applicationForm));
    }
  }

  /**
   * Component render method
   */
  public render = () => {
    const { classes, keycloak } = this.props;
    const { importDone, importingContent, dataChanged, applicationForm } = this.state;

    if (importDone || importingContent) {
      return (
        <Box>
          <Typography>
            { importDone ?
              strings.importDone :
              strings.importInProgress
            }
          </Typography>
          { importingContent &&
            <Box mt={ 2 }>
              <CircularProgress/>
            </Box>
          }
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
        <Typography style={{ marginBottom: theme.spacing(3) }} variant="h3">
          { strings.applicationBasicInformation }
        </Typography>
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
          resource={ this.props.rootResource }
          onSave={ this.onIconFileChange }
          onToggle={ this.toggleDialog }
          open={ this.state.iconDialogOpen }
        />
        { this.renderAdvancedSettings() }
      </>
    );
  }

  /**
   * Renders advanced settings
   */
  private renderAdvancedSettings = () => {
    const { classes } = this.props;

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
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Box display="flex">
                <Typography variant="h5">
                  { strings.applicationId }
                </Typography>
                <Box ml={ 1 }>
                  <Typography variant="body1">
                    { this.props.application.id }
                  </Typography>
                </Box>
              </Box>
              <Button
                disableElevation
                className={ classes.deleteButton }
                color="primary"
                variant="contained"
                onClick={ this.toggleDeleteDialog }
              >
                { strings.applicationEditor.deleteApplication }
              </Button>
            </Box>
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
              <Box mb={ 3 } mt={ 3 }>
                <Typography variant="h5">
                  { strings.importLabel }
                </Typography>
                <input onChange={ e => this.handleWallJsonImport(e.target.files)} type="file"/>
              </Box>
            </VisibleWithRole>
          </AccordionDetails>
        </Accordion>
        { this.renderDeleteDialog() }
      </>
    );
  }

  /**
   * Render delete application confirmation dialog
   */
  private renderDeleteDialog = () => {
    const { onDeleteClick, application  } = this.props;
    const { deleteDialogOpen } = this.state;

    return (
      <GenericDialog
        title="Delete application"
        onCancel={ this.toggleDeleteDialog }
        onClose={ this.toggleDeleteDialog }
        onConfirm={ () => onDeleteClick(application) }
        open={ deleteDialogOpen }
        cancelButtonText={ strings.cancel }
        positiveButtonText={ strings.delete }
        error={ false }
      >
        <Typography>Do you want to delete application and all it's versions?</Typography>
        <Typography>This action cannot be reverted.</Typography>
      </GenericDialog>
    );
  }

  /**
   * Toggle delete dialog
   */
    private toggleDeleteDialog = () => {
      this.setState({ deleteDialogOpen: !this.state.deleteDialogOpen });
    }

  /**
   * Handles importing data from wall json file
   *
   * @param files list of files or null
   */
  private handleWallJsonImport = async (files: FileList | null) => {
    if (!files) {
      return;
    }

    const file = files.item(0);
    if (!file) {
      return;
    }

    const { rootResource } = this.props;
    const reader = new FileReader();

    reader.onload = async e => {
      if (!e.target) {
        return;
      }

      const data = JSON.parse(e.target.result as string)
      const topLevel = data.root.children;

      this.setState({ importingContent: true });

      const imported = await this.importWallJsonItems(rootResource.id!, topLevel);
      if (imported) {
        await this.importRootProperties(data);
      }

      this.setState({ importDone: imported });

      toast.success(strings.importDone);

      setTimeout(() => window.location.reload(), 3000);
    }

    reader.readAsText(file);
  }

  /**
   * Imports wall json items
   *
   * @param parentId parent ID
   * @param items list of items
   * @returns boolean promise
   */
  private importWallJsonItems = async (parentId: string, items: any[]): Promise<boolean> => {
    const { keycloak, application, customerId, deviceId } = this.props;

    if (!keycloak?.token) {
      return false;
    }

    const resourcesApi = Api.getResourcesApi(keycloak.token);

    try {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const createdResource = await resourcesApi.createResource({
          applicationId: application.id!,
          customerId: customerId,
          deviceId: deviceId,
          resource: this.translateWallItemToResource(parentId, i, item)
        });

        if (item.children.length > 0) {
          await this.importWallJsonItems(createdResource.id!, item.children);
        }
      }
    } catch (error) {
      this.context.setError(strings.errorManagement.resource.create, error);
      return false;
    }

    return true;
  }

  /**
   * Imports root properties from the wall JSON data
   *
   * @param data wall JSON data
   */
  private importRootProperties = async (data: any) => {
    const { keycloak, application, customerId, deviceId, rootResource } = this.props;

    if (!keycloak?.token) {
      return false;
    }

    const importProperties: { [ key: string ]: string } = data.root.properties || {};
    const importPropertyKeys = Object.keys(importProperties);

    const rootProperties = (rootResource.properties || [])
      .filter(rootProperty => !importPropertyKeys.includes(rootProperty.key));

    importPropertyKeys.forEach(importPropertyKey => {
      const importPropertyValue = importProperties[importPropertyKey];
      importPropertyValue && rootProperties.push({
        key: importPropertyKey,
        value: importPropertyValue
      });
    });

    try {
      await Api.getResourcesApi(keycloak.token).updateResource({
        resource: { ...rootResource, properties: rootProperties },
        applicationId: application.id!,
        customerId: customerId,
        deviceId: deviceId,
        resourceId: rootResource.id!
      });
    } catch (error) {
      this.context.setError(strings.errorManagement.resource.update, error);
    }
  }

  /**
   * Translates wall json item to resource
   *
   * @param parentId parent id
   * @param index index
   * @param item item
   * @returns translated resource
   */
  private translateWallItemToResource = (parentId: string, index: number, item: any): Resource => {
    return {
      name: item.name,
      slug: item.slug,
      type: item.type,
      data: item.data,
      orderNumber: index,
      parentId: parentId,
      properties: this.translateWallItemProperties(item),
      styles: this.translateWallItemStyles(item)
    };
  }

  /**
   * Translates wall json item properties to resource properties
   *
   * @param item item
   * @returns list of key value properties
   */
  private translateWallItemProperties = (item: any): KeyValueProperty[] => {
    return Object.keys(item.properties).map(key => ({
      key: key,
      value: item.properties[key]
    }));
  }

  /**
   * Translates wall json item styles to resource styles
   */
  private translateWallItemStyles = (item: any): KeyValueProperty[] => {
    return Object.keys(item.styles).map(key => ({
      key: key,
      value: item.styles[key]
    }));
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

    const previewItem = this.state.resourceMap.get(key) || "";
    return (
      <ImagePreview
        uploadDialogTitle={ strings.fileUpload.addImage }
        uploadButtonText={ previewItem ? strings.fileUpload.changeImage : strings.fileUpload.addImage }
        allowSetUrl={ true }
        imagePath={ previewItem }
        onUpload={ this.onPropertyFileOrUrlChange }
        onSetUrl={ this.onPropertyFileOrUrlChange }
        resource={ this.props.rootResource }
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
    const { classes, rootResource } = this.props;

    const icons: JSX.Element[] = [];
    const allKeys = Object.values(IconKeys);
    iconsMap.forEach((value: string, key: string) => {
      const iconTypeKey = allKeys.find(k => key === k.toString());
      const preview = (
        <Box key={ key } className={ classes.gridItem }>
          <Typography variant="h5" color="textSecondary">{ iconTypeKey ? getLocalizedIconTypeString(iconTypeKey) : key }</Typography>
          <ImagePreview
            uploadDialogTitle={ strings.fileUpload.addImage }
            uploadButtonText={ rootResource ? strings.fileUpload.changeImage : strings.fileUpload.addImage }
            key={ key }
            imagePath={ value }
            allowSetUrl={ false }
            onSetUrl={ () => {} }
            onUpload={ this.onIconFileChange }
            resource={ rootResource }
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
   * Update resource and icon map data
   * @param rootResource root resource
   * @param applicationForm application form
   */
  private updateMaps(rootResource: Resource, applicationForm: Form<ApplicationForm>) {
    const initResourceMap = new Map<string, string>();
    const initIconsMap = new Map<string, string>();
    const props = rootResource.properties;

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

    const application = {
      ...this.state.applicationForm.values
    } as Application;
    this.onUpdateResource();
    onUpdateApplication(application);
  };

  /**
   * Handle resource update
   */
  private onUpdateResource = () => {
    const { onUpdateRootResource } = this.props;
    const properties: KeyValueProperty[] = [];
    this.getPropertiesToUpdate(properties);

    const resource = {
      ...this.props.rootResource,
      properties: properties.filter(p => !!p.value)
    } as Resource;
    onUpdateRootResource(resource);

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
      {
        ...this.state.applicationForm,
        values
      },
      {
        usePreprocessor: false
      }
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
    const copy = this.state.resourceMap;
    copy.set(key, event.target.value);

    this.setState({
      resourceMap: copy,
      dataChanged: true
    });

    this.props.confirmationRequired(true);
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
    const tempMap = this.state.resourceMap;
    tempMap.set(key, newUri);

    this.setState({
      resourceMap: tempMap,
      dataChanged: true
    });

    this.onUpdateResource();
  };

  /**
   * Handles icon change
   *
   * @param newUri new URI
   * @param key key
   */
  private onIconFileChange = (newUri: string, key: string) => {
    const tempMap = this.state.iconsMap;
    tempMap.set(key, newUri);

    this.setState({
      iconsMap: tempMap,
      dataChanged: true
    });

    this.onUpdateResource();
  };

  /**
   * Delete property file with key
   */
  private onPropertyFileDelete = (key: string) => {
    const tempMap = this.state.resourceMap;

    tempMap.delete(key);
    this.setState({
      resourceMap: tempMap,
      dataChanged: true
    });

    this.onUpdateResource();
  };

  /**
   * Delete icon file with key
   */
  private onIconFileDelete = (key: string) => {
    const tempMap = this.state.iconsMap;

    tempMap.delete(key);
    this.setState({
      iconsMap: tempMap,
      dataChanged: true
    });

    this.onUpdateResource();
  };

  /**
   * Push all property key value pairs from state maps to properties array
   * @param properties
   */
  private getPropertiesToUpdate(properties: KeyValueProperty[]) {
    const { resourceMap, iconsMap } = this.state;

    resourceMap.forEach((value: string, key: string) => {
      const index = properties.findIndex((p: KeyValueProperty) => p.key === key);
      if (index > -1) {
        properties[index] = { key: key, value: value || "" };
      } else {
        properties.push({ key: key, value: value || "" });
      }
    });

    iconsMap.forEach((value: string, key: string) => {
      const index = properties.findIndex((p: KeyValueProperty) => p.key === key);
      if (index > -1) {
        properties[index] = { key: key, value: value || "" };
      } else {
        properties.push({ key: key, value: value || "" });
      }
    });
  }
}

export default withStyles(styles)(AppSettingsView);