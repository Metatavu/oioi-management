import * as React from "react";
import { withStyles, WithStyles, TextField, Button, Divider, Typography, Grid } from "@material-ui/core";
import styles from "../../styles/editor-view";
import strings from "../../localization/strings";
import theme from "../../styles/theme";
import SaveIcon from "@material-ui/icons/Save";
import { Application, ApplicationToJSON, ApplicationFromJSON, Resource, KeyValueProperty } from "../../generated/client/src";
import { Form, initForm, validateForm, MessageType } from "ts-form-validation";
import { ApplicationForm, applicationRules, ResourceSettingsForm, resourceRules } from "../../commons/formRules";

import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import { AuthState } from "../../types";
import ApiUtils from "../../utils/ApiUtils";

import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import { title } from "process";
import FileUploader from "../generic/FileUploader";
import FileUpload from "../../utils/FileUpload";

/**
 * Component Props
 */
interface Props extends WithStyles<typeof styles> {
  application: Application;
  customerId: string;
  rootResource: Resource;
  onUpdate: (application: Application) => void;
}

/**
 * Component state
 */
interface State {
  applicationForm: Form<ApplicationForm>;
  rootResourceForm: Form<ResourceSettingsForm>;
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
      rootResourceForm: initForm<ResourceSettingsForm>(
        {
          name: "",
        },
        resourceRules
      )
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

    let rootResourceForm = initForm<ResourceSettingsForm>(
      {
        properties: rootResource.properties
      },
      applicationRules
    );

    applicationForm = validateForm(applicationForm);
    rootResourceForm = validateForm(rootResourceForm);

    this.setState({
      applicationForm: applicationForm,
      rootResourceForm: rootResourceForm
    });
  }

  /**
   * Component render method
   */
  public render() {
    const { isFormValid } = this.state.applicationForm;
    console.log(this.props.application);
    console.log(this.props.rootResource);
    console.log(this.state.rootResourceForm)
    return (
      <div>
        <Grid>
          <Typography variant="h3">{ strings.applicationSettings.settings }</Typography>
          <Button
            style={{ marginLeft: theme.spacing(3), marginTop: theme.spacing(1) }}
            color="primary"
            variant="contained"
            startIcon={ <SaveIcon /> }
            disabled={ !isFormValid }
            // onClick={ this.onUpdateResource }
          >
            { strings.save }
          </Button>
        </Grid>
        <Divider style={{ marginTop: theme.spacing(3), marginBottom: theme.spacing(3) }} />
        { this.renderFields() }
        <Divider style={{ marginBottom: theme.spacing(3) }} />
        { this.renderMedia() }
      </div>
    );
  }

  /**
   * Render text fields
   */
  private renderFields = () => {
    return<>
    <Grid container spacing={ 3 } direction="row">
      <Typography variant="h3">{ strings.applicationSettings.settings }</Typography>
      { this.renderField(strings.applicationName, "text", "name") }
      { this.renderField(strings.applicationSettings.teaserText, "textarea", undefined, "teaserText") }

      { this.renderField(strings.applicationSettings.returnDelay, "text", undefined, "returnDelay") }
      { this.renderField(strings.applicationSettings.id, "text", undefined, "slug") }
    </Grid>
    </>;
  }

  /**
   * Renders application field
   */
  private renderField = (label: string, type: string, appKey?: keyof ApplicationForm, resourceKey?: keyof ResourceSettingsForm) => {
    return (this.renderTextField(label, type, appKey, resourceKey));
  };

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
      const values = this.state.rootResourceForm.values;
      const { messages: { [resourceKey]: message } } = this.state.rootResourceForm;

      return <TextField
        fullWidth
        multiline
        rows={ 8 }
        style={{ margin: theme.spacing(3) }}
        type={ type }
        error={ message && message.type === MessageType.ERROR }
        helperText={ message && message.message }
        value={ values[resourceKey] || "" }
        onChange={ this.onHandleResourceChange(resourceKey) }
        onBlur={ this.onHandleResourceBlur(resourceKey) }
        name={ resourceKey }
        variant="outlined"
        label={ label }
      />;
    }
  }

  /**
   * Render media elements
   */
  private renderMedia = () => {
    const { properties } = this.props.rootResource;

    console.log(properties)

    if (!properties) {
      return <div/>;
    }

    const previewItems = properties.map(prop =>{
      let previewItem: string;
      previewItem = this.findImage(prop.key);

      if (!previewItem || !isURL(previewItem)) {
        return;
      }
      return (
        <div style={{ marginTop: theme.spacing(2) }}>
          <GridList cellHeight={ 100 } cols={ 10 }>
            <GridListTile key={ previewItem }>
              <img src={ previewItem } alt="File"/>
            </GridListTile>
          </GridList>
        </div>
      );
    });

    return <>
      <Typography variant="h4">{ strings.applicationSettings.background }</Typography>
      { previewItems }
      <FileUploader
        resource={ this.props.rootResource }
        allowedFileTypes={ [] }
        onSave={ this.onPropertyFileChange }
        uploadKey={ "applicationImage" }
      />
    </>;

  }

  private findImage = (propertyKey: string): string => {
    const { properties } = this.props.rootResource;
    if (!properties) {
      return "";
    }
    const foundItem = properties.find((p: KeyValueProperty) => p.key === propertyKey);

    if (foundItem) {
      return foundItem.value;
    }
    return "";
  }

  /**
   * Handles update application
   */
  private onUpdateApplication = () => {
    const { onUpdate } = this.props;

    const application = {
      ...this.state.applicationForm.values
    } as Application;

    // onUpdate(application);
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
    const values = {
      ...this.state.rootResourceForm.values,
      [key]: event.target.value
    };

    const rootResourceForm = validateForm(
      {
        ...this.state.rootResourceForm,
        values
      },
      {
        usePreprocessor: false
      }
    );

    this.setState({
      rootResourceForm
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
   * Handles fields blur event
   * @param key
   */
  private onHandleResourceBlur = (key: keyof ResourceSettingsForm) => () => {
    let rootResourceForm = { ...this.state.rootResourceForm };
    const filled = {
      ...rootResourceForm.filled,
      [key]: true
    };

    rootResourceForm = validateForm({
      ...this.state.rootResourceForm,
      filled
    });

    this.setState({
      rootResourceForm
    });
  };

    /**
   * Handles image change
   */
  private onPropertyFileChange = async (files: File[], key: string) => {
    console.log(files)
    console.log(key)
    const { customerId, rootResource } = this.props;

    if (!rootResource) {
      return 400;
    }
    const properties = rootResource.properties ? [...rootResource.properties] : [];
    const property = { key: key, value: "" };
    const file = files[0];

    if (file) {
      const response = await FileUpload.uploadFile(file, customerId);
      property.value = response.uri;
    }

    const propertyIndex = properties.findIndex((p: KeyValueProperty) => p.key === key)
    if (propertyIndex > -1) {
      properties[propertyIndex] = property;
    } else {
      properties.push(property);
    }
    console.log(properties)
    // resourceData.properties = properties;
    // this.setState({
    //   resourceData: { ...resourceData }
    // });

    // this.onUpdateResource();
    // // TODO: Handle error cases
    return 200;
  };
}

function isURL(str: string) {
  const pattern = new RegExp("/(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/"); // fragment locator
  return pattern.test(str);
}

export default withStyles(styles)(AppSettingsView);