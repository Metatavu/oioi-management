import * as React from "react";
import { withStyles, WithStyles, TextField, Button } from "@material-ui/core";
import styles from "../../styles/editor-view";
import strings from "../../localization/strings";
import theme from "../../styles/theme";
import SaveIcon from "@material-ui/icons/Save";
import { Application, ApplicationToJSON, ApplicationFromJSON } from "../../generated/client/src";
import { FormValidationRules, Form, initForm, validateForm, MessageType } from "ts-form-validation";

/**
 * Component Props
 */
interface Props extends WithStyles<typeof styles> {
  application: Application;
  onUpdate: (application: Application) => void;
}

/**
 * Application form
 */
interface ApplicationForm extends Partial<Application> {}

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
  form: Form<ApplicationForm>;
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
      form: initForm<ApplicationForm>(
        {
          name: ""
        },
        rules
      )
    };
  }

  /**
   * Component did mount
   */
  public componentDidMount() {
    const { application } = this.props;

    let form = initForm<ApplicationForm>(
      {
        name: application.name
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

    return (
      <div>
        {this.renderField("name", strings.name)}
        <Button
          disabled={!isFormValid}
          style={{ marginLeft: theme.spacing(3) }}
          color="primary"
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={this.onUpdateApplication}
        >
          {strings.save}
        </Button>
      </div>
    );
  }

  /**
   * Renders textfield
   */
  private renderField = (key: keyof ApplicationForm, label: string) => {
    const {
      values,
      messages: { [key]: message }
    } = this.state.form;
    return (
      <TextField
        style={{ marginBottom: theme.spacing(3) }}
        type="text"
        error={message && message.type === MessageType.ERROR}
        helperText={message && message.message}
        value={values[key] || ""}
        onChange={this.onHandleChange(key)}
        onBlur={this.onHandleBlur(key)}
        name={key}
        variant="outlined"
        label={label}
      />
    );
  };

  /**
   * Handles update application
   */
  private onUpdateApplication = () => {
    const { onUpdate } = this.props;

    const application = {
      ...this.state.form.values
    } as Application;

    onUpdate(application);
  };

  /**
   * Handles textfields change events
   * @param key
   * @param event
   */
  private onHandleChange = (key: keyof ApplicationForm) => (event: React.ChangeEvent<HTMLInputElement>) => {
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
  private onHandleBlur = (key: keyof ApplicationForm) => () => {
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

export default withStyles(styles)(AppSettingsView);
