import * as React from "react";
import { withStyles, WithStyles, TextField, Button, Typography, Grid, Divider } from "@material-ui/core";
import styles from "../../styles/editor-view";
import strings from "../../localization/strings";
import theme from "../../styles/theme";
import SaveIcon from "@material-ui/icons/Save";
import { Application, ApplicationToJSON, ApplicationFromJSON, KeyValueProperty, Resource } from "../../generated/client/src";
import { FormValidationRules, Form, initForm, validateForm, MessageType } from "ts-form-validation";
import FileUploader from "../generic/FileUploader";
import FileUpload from "../../utils/FileUpload";

/**
 * Component Props
 */
interface Props extends WithStyles<typeof styles> {
  application: Application;
  customerId: string;
  rootResource: Resource;
  onUpdateApplication: (application: Application) => void;
  onUpdateRootResource(resource: Resource): void;
}

/**
 * Application applicationForm
 */
interface ApplicationForm extends Partial<Application> {}

interface ResourceSettingsForm extends Partial<Resource> {
  applicationImage?: string;
  applicationIcons?: string[];
  teaserText?: string;
}

/**
 * Form validation rules
 */
const rules: FormValidationRules<ApplicationForm> = {
  fields: {
    name: {
      required: true,
      trim: true,
      requiredText: strings.requiredField
    }
  },
  validateForm: applicationForm => {
    const messages = {};

    return {
      ...applicationForm,
      messages
    };
  }
};

const resourceRules: FormValidationRules<ResourceSettingsForm> = {
  fields: {
    name: {
      required: true,
      trim: true,
      requiredText: strings.requiredField
    },
    order_number: {
      required: true,
      trim: true,
      requiredText: strings.requiredField
    },
    slug: {
      required: true,
      trim: true,
      requiredText: strings.requiredField
    },
    data: {
      required: false,
      trim: true
    }
  },
  validateForm: resourceForm => {
    const messages = {};

    return {
      ...resourceForm,
      messages
    };
  }
};

/**
 * Component state
 */
interface State {
  applicationForm: Form<ApplicationForm>;
  resourceForm: Form<ResourceSettingsForm>;
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
          name: "",
        },
        rules,
      ),
      resourceForm: initForm<ResourceSettingsForm>(
        {
          name: undefined,
          order_number: undefined,
          slug: undefined,
          data: undefined,
          teaserText: undefined
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
    console.log(rootResource)

    let applicationForm = initForm<ApplicationForm>(
      {
        name: application.name
      },
      rules
    );

    const properties = rootResource.properties || [];
    const teaserTextProperty = properties.find(p => p.key === "teaserText");

    let resourceForm = initForm<ResourceSettingsForm>(
      {
        ...rootResource,
        teaserText: teaserTextProperty ? teaserTextProperty.value : undefined
      },
      resourceRules
    );

    applicationForm = validateForm(applicationForm);
    resourceForm = validateForm(resourceForm);

    this.setState({
      applicationForm: applicationForm,
      resourceForm: resourceForm
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
        <Typography variant="h3">{ strings.applicationSettings.background }</Typography>
        <FileUploader
          allowedFileTypes={ [] }
          onSave={ this.onApplicationFileChange }
          resource={ this.props.rootResource }
          uploadKey="applicationBackground"
        />
      </div>
    );
  }

  /**
   * Render all fields
   */
  private renderFields = () => {

    return<>
    <Grid container spacing={ 3 } direction="row">
      <Typography variant="h3">{ strings.title }</Typography>
      { this.renderApplicationField(strings.applicationName, "text", "name") }
      { this.renderTest("teaserText", strings.applicationSettings.teaserText, "textarea") }
    </Grid>
  </>;
  };

  /**
   * Renders textfield
   */
  private renderApplicationField = (label: string, type: string, applicationKey: keyof ApplicationForm) => {
    if (type === "textarea") {
      return (this.renderTextArea(applicationKey, label, type));
    }
    return (this.renderTextField(applicationKey, label, type));
  };

  private renderTest = (key: keyof ResourceSettingsForm, label: string, type: string) => {
    const {
      values,
      messages: { [key]: message }
    } = this.state.resourceForm;
    console.log(values);
    return <TextField
      fullWidth
      multiline
      rows={ 8 }
      style={{ margin: theme.spacing(3) }}
      type={ type }
      error={ message && message.type === MessageType.ERROR }
      helperText={ message && message.message }
      value={ values[key] || "" }
      onChange={ this.onHandleResourceChange(key) }
      onBlur={ this.onHandleResourceBlur(key) }
      name={ key }
      variant="outlined"
      label={ label }
    />;
  }

  private renderTextArea = (key: keyof ApplicationForm, label: string, type: string) => {
    const {
      values,
      messages: { [key]: message }
    } = this.state.applicationForm;
    return <TextField
      fullWidth
      multiline
      rows={ 8 }
      style={{ margin: theme.spacing(3) }}
      type={ type }
      error={ message && message.type === MessageType.ERROR }
      helperText={ message && message.message }
      value={ values[key] || "" }
      onChange={ this.onHandleChange(key) }
      onBlur={ this.onHandleBlur(key) }
      name={ key }
      variant="outlined"
      label={ label }
    />;
  }

  private renderTextField = (key: keyof ApplicationForm, label: string, type: string) => {
    const {
      values,
      messages: { [key]: message }
    } = this.state.applicationForm;
    return <TextField
      fullWidth
      multiline
      rows={ 8 }
      style={{ margin: theme.spacing(3) }}
      type={ type }
      error={ message && message.type === MessageType.ERROR }
      helperText={ message && message.message }
      value={ values[key] || "" }
      onChange={ this.onHandleChange(key) }
      onBlur={ this.onHandleBlur(key) }
      name={ key }
      variant="outlined"
      label={ label }
    />;
  }

  /**
   * Handles image change
   */
  private onApplicationFileChange = async (files: File[], key?: string) => {
    const { rootResource, customerId } = this.props;

    if (!key) {
      return 400;
    }

    const properties = rootResource.properties ? [...rootResource.properties] : [];
    const property = { key: key, value: "" };
    const file = files[0];

    if (file) {
      const response = await FileUpload.uploadFile(file, customerId);
      property.value = response.uri;
    }

    const propertyIndex = properties.findIndex((p: KeyValueProperty) => p.key === key);
    if (propertyIndex > -1) {
      properties[propertyIndex] = property;
    } else {
      properties.push(property);
    }
    console.log(properties);

    // this.onUpdateResource();
    // TODO: Handle error cases
    return 200;
  };

  /**
   * Handles update application
   */
  private onUpdateApplication = () => {
    const { onUpdateApplication } = this.props;

    // TODO: Add teaser text to update
    const application = {
      ...this.state.applicationForm.values
    } as Application;

    this.onUpdateResource();
    onUpdateApplication(application);
  };

    /**
   * On update resource method
   */
  private onUpdateResource = () => {
    const { onUpdateRootResource } = this.props;
    const { resourceForm } = this.state;
    const properties = resourceForm.values.properties ? [...resourceForm.values.properties] : [];
    const teaserIndex = properties.findIndex((p: KeyValueProperty) => p.key === "teaserText");
    const applicationImageIndex = properties.findIndex((p: KeyValueProperty) => p.key === "applicationImage");
    const applicationIconIndex = properties.findIndex((p: KeyValueProperty) => p.key === "applicationIcon");

    if (teaserIndex > -1) {
      properties[teaserIndex] = { key: "teaserText", value: resourceForm.values.teaserText! }
    } else {
      properties.push({ key: "teaserText", value: resourceForm.values.teaserText! });
    }

    // if (applicationImageIndex > -1) {
    //   properties[applicationImageIndex] = { key: "applicationImage", value: resourceForm.values.applicationImage }
    // } else {
    //   properties.push({ key: "applicationImage", value: resourceForm.values.applicationImage });
    // }

    // if (applicationIconIndex > -1) {
    //   properties[applicationIconIndex] = { key: "applicationIcon", value: resourceForm.values.applicationIcon }
    // } else {
    //   properties.push({ key: "applicationIcon", value: resourceForm.values.applicationIcon });
    // }

    const resource = {
      ...this.props.rootResource,
      parent_id: this.props.rootResource.id,
      properties: properties.filter(p => !!p.value)
    } as Resource;

    onUpdateRootResource(resource);
    console.log(resource);

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
      ...this.state.resourceForm.values,
      [key]: event.target.value
    };

    const resourceForm = validateForm(
      {
        ...this.state.resourceForm,
        values
      },
      {
        usePreprocessor: false
      }
    );

    this.setState({
      resourceForm
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
    let resourceForm = { ...this.state.resourceForm };
    const filled = {
      ...resourceForm.filled,
      [key]: true
    };

    resourceForm = validateForm({
      ...this.state.resourceForm,
      filled
    });

    this.setState({
      resourceForm
    });
  };
}

export default withStyles(styles)(AppSettingsView);
