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

import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';

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

interface ResourceSettingsForm extends Partial<Application>, Partial<Resource> {
  applicationImage?: string;
  applicationIcon?: string;
  applicationIcons?: string[];
  teaserText?: string;
  returnDelay?: string;
}

const rules: FormValidationRules<ResourceSettingsForm> = {
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
  validateForm: form => {
    const messages = {};

    return {
      ...form,
      messages
    };
  }
};

/**
 * Component state
 */
interface State {
  form: Form<ResourceSettingsForm>;
}

/**
 * Creates Application setting view component
 */
class AppSettingsViewV2 extends React.Component<Props, State> {
  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      form: initForm<ResourceSettingsForm>(
        {
          name: "",
        },
        rules,
      ),
    };
  }

  /**
   * Component did mount
   */
  public componentDidMount() {
    const { rootResource } = this.props;

    const properties = rootResource.properties || [];
    const teaserTextProperty = properties.find(p => p.key === "teaserText");
    const applicationImageProperty = properties.find(p => p.key === "applicationImage");
    const applicationIconProperty = properties.find(p => p.key === "applicationIcon");

    let form = initForm<ResourceSettingsForm>(
      {
        ...rootResource,
        teaserText: teaserTextProperty ? teaserTextProperty.value : undefined,
        applicationImage: applicationImageProperty ? applicationImageProperty.value : undefined,
        applicationIcon: applicationIconProperty ? applicationIconProperty.value : undefined
      },
      rules
    );

    form = validateForm(form);

    this.setState({
      form
    });
  }

  /**
   * Component render method
   */
  public render() {
    const { isFormValid } = this.state.form;
    const { rootResource } = this.props;

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
          resource={ rootResource }
          uploadKey="applicationImage"
        />
        { this.renderPreview() }
      </div>
    );
  }

  /**
   * Render all fields
   */
  private renderFields = () => {

    return<>
    <Grid container spacing={ 3 } direction="row">
      <Typography variant="h3">{ strings.applicationSettings.settings }</Typography>
      { this.renderField("name", strings.applicationName, "text") }
      { this.renderField("teaserText", strings.applicationSettings.teaserText, "textarea") }

      { this.renderField("returnDelay", strings.applicationSettings.returnDelay, "text") }
      { this.renderField("slug", strings.applicationSettings.id, "text") }
    </Grid>
  </>;
  };

  /**
   * Renders application field
   */
  private renderField = (applicationKey: keyof ResourceSettingsForm, label: string, type: string) => {
    if (type === "textarea") {
      return (this.renderTextArea(applicationKey, label, type));
    }
    return (this.renderTextField(applicationKey, label, type));
  };

  private renderTextArea = (key: keyof ResourceSettingsForm, label: string, type: string) => {
    const {
      values,
      messages: { [key]: message }
    } = this.state.form;
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

  private renderTextField = (key: keyof ResourceSettingsForm, label: string, type: string) => {
    const {
      values,
      messages: { [key]: message }
    } = this.state.form;
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
   * Render preview view
   * TODO: Render preview should be own generic component that would show some stock image
   * when data contains something else then image/video 
   */
  private renderPreview = () => {
    const { rootResource } = this.props;
    if (!rootResource.properties) {
      return;
    }

    const image = rootResource.properties.find(p => p.key === "applicationImage");
    if (!image) {
      return;
    }
    return <>
      <div style={{ marginTop: theme.spacing(2) }}>
        <GridList cellHeight={ 400 } cols={ 5 }>
          <GridListTile key={ image.value }>
            <img src={ image.value } alt="File"/>
          </GridListTile>
        </GridList>
      </div>
    </>;
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

    this.onUpdateResource();
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
      ...this.state.form.values
    } as Application;

    this.onUpdateResource();
    onUpdateApplication(application);
  };

    /**
   * On update resource method
   */
  private onUpdateResource = () => {
    const { onUpdateRootResource } = this.props;
    const { form } = this.state;
    const properties = form.values.properties ? [...form.values.properties] : [];
    const teaserIndex = properties.findIndex((p: KeyValueProperty) => p.key === "teaserText");
    const applicationImageIndex = properties.findIndex((p: KeyValueProperty) => p.key === "applicationImage");
    const applicationIconIndex = properties.findIndex((p: KeyValueProperty) => p.key === "applicationIcon");

    if (teaserIndex > -1) {
      properties[teaserIndex] = { key: "teaserText", value: form.values.teaserText || "" };
    } else {
      properties.push({ key: "teaserText", value: form.values.teaserText || ""});
    }

    if (applicationImageIndex > -1) {
      properties[applicationImageIndex] = { key: "applicationImage", value: form.values.applicationImage || "" };
    } else {
      properties.push({ key: "applicationImage", value: form.values.applicationImage || "" });
    }

    if (applicationIconIndex > -1) {
      properties[applicationIconIndex] = { key: "applicationIcon", value: form.values.applicationIcon || "" };
    } else {
      properties.push({ key: "applicationIcon", value: form.values.applicationIcon || "" });
    }

    const resource = {
      ...this.props.rootResource,
      parent_id: this.props.rootResource.id,
      properties: properties.filter(p => !!p.value)
    } as Resource;
    console.log(resource);
    onUpdateRootResource(resource);
    

  };

  /**
   * Handles textfields change events
   * @param key
   * @param event
   */
  private onHandleChange = (key: keyof ResourceSettingsForm) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const values = {
      ...this.state.form.values,
      [key]: event.target.value
    };

    const form = validateForm(
      {
        ...this.state.form,
        values
      },
      {
        usePreprocessor: false
      }
    );

    this.setState({
      form
    });
  };

  /**
   * Handles textfields change events
   * @param key
   * @param event
   */
  private onHandleResourceChange = (key: keyof ResourceSettingsForm) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const values = {
      ...this.state.form.values,
      [key]: event.target.value
    };

    const form = validateForm(
      {
        ...this.state.form,
        values
      },
      {
        usePreprocessor: false
      }
    );

    this.setState({
      form
    });
  };

  /**
   * Handles fields blur event
   * @param key
   */
  private onHandleBlur = (key: keyof ResourceSettingsForm) => () => {
    let form = { ...this.state.form };
    const filled = {
      ...form.filled,
      [key]: true
    };

    form = validateForm({
      ...this.state.form,
      filled
    });

    this.setState({
      form
    });
  };

    /**
   * Handles fields blur event
   * @param key
   */
  private onHandleResourceBlur = (key: keyof ResourceSettingsForm) => () => {
    let form = { ...this.state.form };
    const filled = {
      ...form.filled,
      [key]: true
    };

    form = validateForm({
      ...this.state.form,
      filled
    });

    this.setState({
      form
    });
  };
}

export default withStyles(styles)(AppSettingsViewV2);
