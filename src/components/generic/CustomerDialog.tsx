import * as React from "react";
import { withStyles, WithStyles, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Divider, Typography, Grid, LinearProgress } from "@material-ui/core";
import styles from "../../styles/dialog";
import { DropzoneArea } from "material-ui-dropzone";
import { Customer } from "../../generated/client/src";
import strings from "../../localization/strings";
import FileUpload from "../../utils/file-upload";
import { AuthState, DialogType, ErrorContextType } from "../../types/index";
import { FormValidationRules, validateForm, Form, initForm, MessageType } from "ts-form-validation";
import { ErrorContext } from "../containers/ErrorHandler";
import { connect } from "react-redux";
import { ReduxState } from "../../store";

/**
 * Component properties
 */
interface Props extends WithStyles<typeof styles> {
  auth: AuthState;
  open: boolean;
  dialogType: DialogType;
  customer?: Customer;
  saveClick(customer: Customer, dialogType: DialogType): void;
  handleClose(): void;
}

interface CustomerForm extends Partial<Customer> {}

const rules: FormValidationRules<CustomerForm> = {
  fields: {
    name: {
      required: true,
      trim: true,
      requiredText: strings.requiredField
    }
  },
  validateForm: form => {
    const messages = {};
    return { ...form, messages };
  }
};

/**
 * Component state
 */
interface State {
  form: Form<CustomerForm>;
  progress?: number;
}

/**
 * Creates customer dialog component
 */
class CustomerDialog extends React.Component<Props, State> {

  static contextType: React.Context<ErrorContextType> = ErrorContext;

  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      form: initForm<CustomerForm>(
        {
          name: props.customer ? props.customer.name : "",
          ...props.customer
        },
        rules
      )
    };
  };

  /**
   * Component did update life cycle handler
   *
   * @param prevProps previous props
   * @param prevState previous state
   */
  public componentDidUpdate = (prevProps: Props, prevState: State) => {
    const { customer } = this.props;

    if (prevProps.customer !== customer) {
      let form = initForm<CustomerForm>(
        {
          name: customer ? customer.name : "",
          ...customer
        },
        rules
      );

      form = validateForm(form);

      this.setState({ form: form });
    }
  };

  /**
   * Component render method
   */
  public render = () => {
    const { classes, dialogType, open } = this.props;
    const { progress, form } = this.state;

    return (
      <Dialog
        fullScreen={ false }
        open={ open }
        onClose={ (event, reason) => this.onCloseClick(reason) }
        aria-labelledby="dialog-title"
      >
        <DialogTitle id="dialog-title">
          <div>
            <Typography variant="h2">
              { this.renderDialogTitle(dialogType) }
            </Typography>
          </div>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Grid container spacing={ 2 }>
            <Grid item className={ classes.fullWidth }>
              { this.renderField("name", strings.name) }
            </Grid>
            <Grid item className={ classes.fullWidth }>
              { dialogType !== "show" &&
                <>
                  <Typography variant="subtitle1">{ strings.customerLogo }</Typography>
                  { progress ?
                    (
                      <>
                        <LinearProgress variant="determinate" value={ progress }/>
                        <Typography>{ `${progress}%` }</Typography>
                      </>
                    ) :
                    <DropzoneArea
                      clearOnUnmount
                      dropzoneClass={ classes.dropzone }
                      dropzoneParagraphClass={ classes.dropzoneText }
                      dropzoneText={ strings.dropFile }
                      onDrop={ this.onImageChange }
                    />
                  }
                </>
              }
            </Grid>
          </Grid>
        </DialogContent>
        <Divider />
        <DialogActions>
          <Button
            variant="outlined"
            onClick={ () => this.onCloseClick("") }
            color="primary"
          >
            { strings.cancel }
          </Button>
          { dialogType !== "show" &&
            <Button
              variant="contained"
              onClick={ this.onSave }
              color="primary"
              autoFocus
              disabled={ !form.isFormValid || (progress !== undefined && progress < 100)  }
            >
              { dialogType === "edit" ? strings.update : strings.save }
            </Button>
          }
        </DialogActions>
      </Dialog>
    );
  }

  /**
   * Renders textfield
   */
  private renderField = (key: keyof CustomerForm, label: string) => {
    const { dialogType } = this.props;
    const { values, messages: { [key]: message } } = this.state.form;

    return (
      <TextField
        multiline
        fullWidth
        error={ message && message.type === MessageType.ERROR }
        helperText={ message && message.message }
        value= { values[key] }
        onChange={ this.onHandleChange(key) }
        onBlur={ this.onHandleBlur(key) }
        name={ key }
        variant="outlined"
        label={ label }
        disabled={ dialogType === "show" }
      />
    );
  };

  /**
   * Renders dialog title by type
   *
   * @param dialogType
   */
  private renderDialogTitle = (dialogType: DialogType) => {
    switch (dialogType) {
      case "edit":
        return strings.editCustomer;
      case "show":
        return strings.customerInformation;
      case "new":
      default:
        return strings.addNewCustomer;
    }
  };

  /**
   * Event handler for on close click
   *
   * @param reason reason why dialog was closed
   */
  private onCloseClick = (reason: string) => {
    const { handleClose } = this.props;

    if (reason === "backdropClick" || reason === "escapeKeyDown") {
      return;
    }

    handleClose();
  }

  /**
   * Handles save button click
   */
  private onSave = async () => {
    const { saveClick, dialogType } = this.props;
    const { values } = this.state.form;

    const customer = { ...values } as Customer;

    await saveClick(customer, dialogType);

    this.setState(
      {
        form: initForm<CustomerForm>(
          {
            name: "",
            imageUrl: undefined
          },
          rules
        )
      },
      () => this.props.handleClose()
    );
  };

  /**
   * Handles text fields change events
   *
   * @param key key of CustomerForm
   * @param event React change event
   */
  private onHandleChange = (key: keyof CustomerForm) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const values = {
      ...this.state.form.values,
      [key]: event.target.value
    };

    const form = validateForm(
      {
        ...this.state.form,
        values
      },
      { usePreprocessor: false }
    );

    this.setState({ form: form });
  };

  /**
   * Event handler for text fields blur event
   *
   * @param key key of CustomerForm
   */
  private onHandleBlur = (key: keyof CustomerForm) => () => {
    let form = { ...this.state.form };
    const filled = {
      ...form.filled,
      [key]: true
    };

    form = validateForm({
      ...this.state.form,
      filled
    });

    this.setState({ form: form });
  };

  /**
   * Handles image changes
   *
   * @param files list of files
   * @param callback file upload progress callback function
   */
  private onImageChange = async (files: File[]) => {
    const { auth } = this.props;

    if (!auth || !auth.token) {
      return;
    }

    const file = files[0];

    if (!file) {
      return;
    }

    try {
      const response = await FileUpload.getPresignedPostData(file, auth.token);
      if (response.error) {
        throw new Error(response.message);
      }

      const { data, basePath } = response;
      await FileUpload.uploadFileToS3(data, file, this.updateProgress);

      this.setState({
        form: {
          ...this.state.form,
          values: {
            ...this.state.form.values,
            imageUrl: `${basePath}/${data.fields.key}`
          }
        }
      });
    } catch (error) {
      this.context.setError(
        strings.formatString(strings.errorManagement.file.upload, file.name),
        error
      );
    }
  };

  /**
   * Callback function that Updates file upload progress
   *
   * @param progress upload progress
   */
  private updateProgress = (progress: number) => {
    this.setState({ progress: Math.floor(progress) });

    if (progress < 100) {
      return;
    }

    this.setState({ progress: undefined });
  }

  /**
   * Event handler for clearing dialog values
   */
  private clear = () => {
    this.setState({
      form: initForm<CustomerForm>(
        {
          name: "",
          imageUrl: undefined
        },
        rules
      )
    });
  };
}

/**
 * Maps redux state to props
 *
 * @param state redux state
 */
const mapStateToProps = (state: ReduxState) => ({
  auth: state.auth
});

export default connect(mapStateToProps)(withStyles(styles)(CustomerDialog));