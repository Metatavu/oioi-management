import * as React from "react";
import { withStyles, WithStyles, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Divider, Typography, Grid } from "@material-ui/core";
import styles from "../../styles/dialog";
import { DropzoneArea } from "material-ui-dropzone";
import { Customer } from "../../generated/client/src";
import strings from "../../localization/strings";
import FileUpload from "../../utils/file-upload";
import { DialogType, ErrorContextType } from "../../types/index";
import { FormValidationRules, validateForm, Form, initForm, MessageType } from "ts-form-validation";
import { ErrorContext } from "../containers/ErrorHandler";

/**
 * Component properties
 */
interface Props extends WithStyles<typeof styles> {
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
    const { classes, dialogType, open, handleClose } = this.props;
    const { isFormValid } = this.state.form;

    return (
      <Dialog
        fullScreen={ false }
        open={ open }
        onClose={ handleClose }
        aria-labelledby="dialog-title"
        onBackdropClick={ this.onCustomerDialogBackDropClick }
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
                  <DropzoneArea
                    dropzoneClass={ classes.dropzone }
                    dropzoneParagraphClass={ classes.dropzoneText }
                    dropzoneText={ strings.dropFile }
                    onChange={ this.onImageChange }
                  />
                </>
              }
            </Grid>
          </Grid>
        </DialogContent>
        <Divider />
        <DialogActions>
          <Button
            variant="outlined"
            onClick={ this.onCloseClick }
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
              disabled={ !isFormValid }
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
        error= {message && message.type === MessageType.ERROR }
        helperText={ message && message.message }
        value= {values[key] }
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
            image_url: undefined
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
   */
  private onImageChange = async (files: File[]) => {
    const file = files[0];

    try {
      const response = await FileUpload.uploadFile(file, "customerImages");

      this.setState({
        form: {
          ...this.state.form,
          values: {
            ...this.state.form.values,
            image_url: response.uri
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
   * Handles close click and resets form values
   */
  private onCloseClick = () => {
    this.setState(
      {
        form: initForm<CustomerForm>(
          {
            name: "",
            image_url: undefined
          },
          rules
        )
      },
      () => this.props.handleClose()
    );
  };

  /**
   * Event handler for customer dialog back drop click
   */
  private onCustomerDialogBackDropClick = () => {
    this.setState({
      form: initForm<CustomerForm>(
        {
          name: "",
          image_url: undefined
        },
        rules
      )
    });
  };
}

export default withStyles(styles)(CustomerDialog);