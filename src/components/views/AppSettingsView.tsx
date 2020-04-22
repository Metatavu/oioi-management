import * as React from "react";
import { withStyles, WithStyles, TextField, Button, Divider, Typography, CircularProgress } from "@material-ui/core";
import styles from "../../styles/editor-view";
import strings from "../../localization/strings";
import theme from "../../styles/theme";
import { Application, Resource, KeyValueProperty } from "../../generated/client/src";
import { Form, initForm, validateForm, MessageType } from "ts-form-validation";
import { ApplicationForm, applicationRules, ResourceSettingsForm } from "../../commons/formRules";

import FileUpload from "../../utils/FileUpload";
import logo from "../../resources/svg/oioi-logo.svg";
import AddIconDialog from "../generic/AddIconDialog";
import ImagePreview from "../generic/ImagePreview";
import { AuthState } from "../../types";
import ApiUtils from "../../utils/ApiUtils";

/**
 * Component Props
 */
interface Props extends WithStyles<typeof styles> {
  application: Application;
  customerId: string;
  deviceId: string;
  rootResource: Resource;
  auth: AuthState;
  onUpdateApplication: (application: Application) => void;
  onUpdateRootResource: (rootResource: Resource) => void;
  confirmationRequired: (value: boolean) => void;
}

/**
 * Component state
 */
interface State {
  applicationForm: Form<ApplicationForm>;
  resourceMap: Map<string, string>;
  iconDialogOpen: boolean;
  importingContent: boolean;
  importDone: boolean;
  dataChanged: boolean;
}
/**
 * Creates Application setting view component
 */
class AppSettingsView extends React.Component<Props, State> {
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
      resourceMap: new Map(),
      iconDialogOpen: false,
      importingContent: false,
      importDone: false,
      dataChanged: false
    };
  }

  /**
   * Component did mount
   */
  public componentDidMount() {
    const { application, rootResource } = this.props;

    let applicationForm = initForm<ApplicationForm>(
      {
        name: application.name
      },
      applicationRules
    );

    applicationForm = validateForm(applicationForm);
    const initMap = new Map<string, string>();
    const props = rootResource.properties;
    if (props) {
      props.map(p => {
        initMap.set(p.key, p.value);
      });
    }

    this.setState({
      applicationForm: applicationForm,
      resourceMap: initMap
    });
  }

  /**
   * Component render method
   */
  public render() {
    const { importDone, importingContent, dataChanged } = this.state;
    if (importDone) {
      return (
        <div><p>{ strings.importDone }</p></div>
      )
    }
    if (importingContent) {
      return (
        <div><p>{ strings.importInProgress }</p><br/><CircularProgress /></div>
      )
    }

    const { isFormValid } = this.state.applicationForm;
    return (
      <div>
        <Button
          style={ { marginLeft: theme.spacing(3), marginTop: theme.spacing(1) } }
          color="primary"
          variant="outlined"
          disabled={ !isFormValid || !dataChanged }
          onClick={ this.onUpdateApplication }
        >
          { strings.save }
        </Button>
        <Divider style={ { marginTop: theme.spacing(3), marginBottom: theme.spacing(3) }} />
        { this.renderFields() }
        <Divider style={ { marginBottom: theme.spacing(3) } } />

        <Typography variant="h4">{ strings.applicationSettings.background }</Typography>
        { this.renderMedia("applicationImage") }
        <Divider style={ { marginBottom: theme.spacing(3) } } />

        <Typography variant="h4">{ strings.applicationSettings.icon }</Typography>
        { this.renderMedia("applicationIcon") }
        <Divider style={ { marginBottom: theme.spacing(3) } } />

        <Typography variant="h4">{ strings.applicationSettings.icons }</Typography>
        { this.renderIconList() }
        <Divider style={ { marginBottom: theme.spacing(3) } } />
        <AddIconDialog
          resource={ this.props.rootResource }
          onSave={ this.onPropertyFileChange }
          onToggle={ this.toggleDialog }
          open={ this.state.iconDialogOpen }
        />
        <Divider style={ { marginBottom: theme.spacing(3) } } />
        <Typography variant="h4">{strings.importLabel}</Typography>
        <input onChange={ e => this.handleWallJsonImport(e.target.files)} type="file"  />
      </div>
    );
  }

  /**
   * Handles importing data from wall json file
   * 
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
      this.setState({importDone: imported});
      setTimeout(() => window.location.reload(), 3000);
    }
    reader.readAsText(file);
  }

  /**
   * Imports wall json items
   */
  private importWallJsonItems = async (parentId: string, items: any[]): Promise<boolean> => {
    const { auth, application, customerId, deviceId } = this.props;
    if (!auth || !auth.token) {
      return false;
    }

    const resourcesApi = ApiUtils.getResourcesApi(auth.token);
    for(let i = 0; i < items.length; i++) {
      let item = items[i];
      let createdResource = await resourcesApi.createResource({
        application_id: application.id!,
        customer_id: customerId,
        device_id: deviceId,
        resource: this.translateWallItemToResource(parentId, i, item) 
      });
      if (item.children.length > 0) {
        await this.importWallJsonItems(createdResource.id!, item.children);
      }
    }

    return true;
  }

  /**
   * Translates wall json item to resource
   */
  private translateWallItemToResource = (parentId: string, index: number, item: any): Resource => {
    return {
      name: item.name,
      slug: item.slug,
      type: item.type,
      data: item.data,
      order_number: index,
      parent_id: parentId,
      properties: this.translateWallItemProperties(item),
      styles: this.translateWallItemStyles(item)
    };
  }

  /**
   * Translates wall json item properties to resource properties
   */
  private translateWallItemProperties = (item: any): KeyValueProperty[] => {
    const properties: KeyValueProperty[] = [];
    const keys = Object.keys(item.properties);
    keys.forEach(key => properties.push({key: key, value: item.properties[key]}));
    return properties;
  }

  /**
   * Translates wall json item styles to resource styles
   */
  private translateWallItemStyles = (item: any): KeyValueProperty[] => {
    const styles: KeyValueProperty[] = [];
    const keys = Object.keys(item.styles);
    keys.forEach(key => styles.push({key: key, value: item.styles[key]}));
    return styles;
  }

  /**
   * Render text fields
   */
  private renderFields = () => {

    return (
      <>
        { this.renderTextField(strings.applicationName, "text", "name") }
        { this.renderTextField(strings.applicationSettings.teaserText, "textarea", undefined, "teaserText") }
        { this.renderTextField(strings.applicationSettings.returnDelay, "text", undefined, "returnDelay") }
        { this.renderTextField(strings.applicationSettings.id, "text", undefined, "applicationId") }
      </>
    );
  }

  /**
   * Render text fields with given form keys
   */
  private renderTextField = (label: string, type: string, appKey?: keyof ApplicationForm, resourceKey?: keyof ResourceSettingsForm) => {
    if (appKey) {
      const values = this.state.applicationForm.values;
      const { messages: { [appKey]: message } } = this.state.applicationForm;

      return(
        <TextField
          fullWidth
          multiline
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
   */
  private renderMedia = (key: string) => {

    let previewItem: string;
    previewItem = this.state.resourceMap.get(key) || logo;
    return (
      <ImagePreview
        imagePath={ previewItem }
        onSave={ this.onPropertyFileChange }
        resource={ this.props.rootResource }
        uploadKey={ key }
        onDelete={ this.onPropertyFileDelete }
      />
    );
  }

  /**
   * Render media elements
   * TODO: Add remove/modify buttons (Tuomas)
   */
  private renderIconList = () => {
    const { resourceMap } = this.state;
    const icons: JSX.Element[] = [];
    resourceMap.forEach((value: string, key: string) => {
      if (key.includes("applicationIcon_")) {
        const preview = (
          <ImagePreview
            key={ key }
            imagePath={ value }
            onSave={ this.onPropertyFileChange }
            resource={ this.props.rootResource }
            uploadKey={ key }
            onDelete={ this.onPropertyFileDelete }
          />
        );
        icons.push(preview);
      }
    });
    return (
      <>
        { icons }
        <Button
          style={ { marginLeft: theme.spacing(3), marginTop: theme.spacing(1) }}
          color="primary"
          variant="contained"
          onClick={ this.toggleDialog }
        >
          { strings.applicationSettings.addIcon }
        </Button>
      </>
    );
  }

  /**
   * Toggle dialog
   */
  private toggleDialog = () => {
    const open = !this.state.iconDialogOpen;
    this.setState({iconDialogOpen: open});
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

  };

  /**
   * Handles textfields change events
   * @param key
   * @param event
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
   * Handles textfields change events
   * @param key
   * @param event
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
   */
  private onPropertyFileChange = async (files: File[], key: string) => {
    const { customerId } = this.props;

    let newUri = "";
    const file = files[0];

    if (file) {
      const response = await FileUpload.uploadFile(file, customerId);
      newUri = response.uri;
    }

    const tempMap = this.state.resourceMap;
    tempMap.set(key, newUri);
    this.setState({
      resourceMap: tempMap,
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
   * Push all property key value pairs from state map to properties array
   * @param properties
   */
  private getPropertiesToUpdate(properties: KeyValueProperty[]) {
    const { resourceMap } = this.state;

    resourceMap.forEach((value: string, key: string) => {
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