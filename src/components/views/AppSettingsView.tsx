import * as React from "react";
import { withStyles, WithStyles, TextField, Button, Divider, Typography, Grid, Dialog, DialogTitle, DialogContent, DialogActions, } from "@material-ui/core";
import styles from "../../styles/editor-view";
import strings from "../../localization/strings";
import theme from "../../styles/theme";
import SaveIcon from "@material-ui/icons/Save";
import { Application, Resource, KeyValueProperty } from "../../generated/client/src";
import { Form, initForm, validateForm, MessageType } from "ts-form-validation";
import { ApplicationForm, applicationRules, ResourceSettingsForm, resourceRules } from "../../commons/formRules";

import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import FileUploader from "../generic/FileUploader";
import FileUpload from "../../utils/FileUpload";
import logo from "../../resources/svg/oioi-logo.svg";
import AddIconDialog from "../generic/AddIconDialog";


/**
 * Component Props
 */
interface Props extends WithStyles<typeof styles> {
  application: Application;
  customerId: string;
  rootResource: Resource;
  onUpdateApplication: (application: Application) => void;
  onUpdateRootResource: (rootResource: Resource) => void;
}

/**
 * Component state
 */
interface State {
  applicationForm: Form<ApplicationForm>;
  resourceMap: Map<string, string>;
  iconDialogOpen: boolean;
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
      iconDialogOpen: false
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
    const { isFormValid } = this.state.applicationForm;
    return (
      <div>
        <Grid>
          <Button
            style={{ marginLeft: theme.spacing(3), marginTop: theme.spacing(1) }}
            color="primary"
            variant="contained"
            startIcon={ <SaveIcon /> }
            disabled={ !isFormValid }
            onClick={ this.onUpdateApplication }
          >
            { strings.save }
          </Button>
        </Grid>
        <Divider style={{ marginTop: theme.spacing(3), marginBottom: theme.spacing(3) }} />
        { this.renderFields() }
        <Divider style={{ marginBottom: theme.spacing(3) }} />

        <Typography variant="h4">{ strings.applicationSettings.background }</Typography>
        { this.renderMedia("applicationImage") }
        <Divider style={{ marginBottom: theme.spacing(3) }} />

        <Typography variant="h4">{ strings.applicationSettings.icon }</Typography>
        { this.renderMedia("applicationIcon") }
        <Divider style={{ marginBottom: theme.spacing(3) }} />

        <Typography variant="h4">{ strings.applicationSettings.icons }</Typography>
        { this.renderIconList() }
        <Divider style={{ marginBottom: theme.spacing(3) }} />
        <AddIconDialog
          resource={ this.props.rootResource }
          onSave={ this.onPropertyFileChange }
          onToggle={ this.toggleDialog }
          open={ this.state.iconDialogOpen }
        />
      </div>
    );
  }

  /**
   * Render text fields
   */
  private renderFields = () => {

    return<>
    <Grid container spacing={ 3 } direction="row">
      { this.renderTextField(strings.applicationName, "text", "name") }
      { this.renderTextField(strings.applicationSettings.teaserText, "textarea", undefined, "teaserText") }

      { this.renderTextField(strings.applicationSettings.returnDelay, "text", undefined, "returnDelay") }
      { this.renderTextField(strings.applicationSettings.id, "text", undefined, "applicationId") }
    </Grid>
    </>;
  }

  /**
   * Render text fields with given form keys
   */
  private renderTextField = (label: string, type: string, appKey?: keyof ApplicationForm, resourceKey?: keyof ResourceSettingsForm) => {
    if (appKey) {
      const values = this.state.applicationForm.values;
      const { messages: { [appKey]: message } } = this.state.applicationForm;

      return <TextField
        fullWidth
        multiline
        rows={ 8 }
        style={{ margin: theme.spacing(3) }}
        type={ type }
        error={ message && message.type === MessageType.ERROR }
        helperText={ message && message.message }
        value={ values[appKey] || "" }
        onChange={ this.onHandleChange(appKey) }
        onBlur={ this.onHandleBlur(appKey) }
        name={ appKey }
        variant="outlined"
        label={ label }
      />;
    } else if (resourceKey) {
      return <TextField
        fullWidth
        multiline
        rows={ 8 }
        style={{ margin: theme.spacing(3) }}
        type={ type }
        value={ this.state.resourceMap.get(resourceKey) || "" }
        onChange={ this.onHandleResourceChange(resourceKey) }
        name={ resourceKey }
        variant="outlined"
        label={ label }
      />;
    }
  }

  /**
   * Render media elements
   */
  private renderMedia = (key: string) => {

    let previewItem: string;
    previewItem = this.state.resourceMap.get(key) || logo;

    return <>
      <div style={{ marginTop: theme.spacing(2) }}>
        <GridList cellHeight={ 100 } cols={ 10 }>
          <GridListTile key={ previewItem }>
            <img src={ previewItem } alt="File"/>
          </GridListTile>
        </GridList>
      </div>

      <FileUploader
        resource={ this.props.rootResource }
        allowedFileTypes={ [] }
        onSave={ this.onPropertyFileChange }
        uploadKey={ key }
      />
    </>;
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
          <div style={{ marginTop: theme.spacing(2) }}>
            <GridList cellHeight={ 100 } cols={ 10 }>
              <GridListTile key={ value }>
                <img src={ value } alt="File"/>
              </GridListTile>
            </GridList>
          </div>
        );
        icons.push(preview);
      }
    });
    return <>
      { icons }
      <Button
        style={{ marginLeft: theme.spacing(3), marginTop: theme.spacing(1) }}
        color="primary"
        variant="contained"
        onClick={ this.toggleDialog }
      >
        { strings.applicationSettings.addIcon }
      </Button>
    </>;
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
      applicationForm
    });
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
      resourceMap: copy
    });
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
      applicationForm
    });
  };

  /**
   * Handles image change
   */
  private onPropertyFileChange = async (files: File[], key: string) => {
    const { customerId, rootResource } = this.props;

    if (!rootResource) {
      return 400;
    }
    
    let newUri = "";
    const file = files[0];

    if (file) {
      const response = await FileUpload.uploadFile(file, customerId);
      newUri = response.uri;
    }

    const tempMap = this.state.resourceMap;
    tempMap.set(key, newUri);
    this.setState({
      resourceMap: tempMap
    });

    this.onUpdateResource();
    // // TODO: Handle error cases
    return 200;
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