import * as React from "react";
import { withStyles, WithStyles, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Divider, Typography, Grid } from "@material-ui/core";
import styles from "../../styles/dialog";
import { DropzoneArea } from "material-ui-dropzone";
import { Customer } from "../../generated/client/src";
import strings from "../../localization/strings";
import FileUpload from "../../utils/FileUpload";
import { DialogType } from "../../types/index";
import { FormValidationRules, validateForm, Form, initForm, MessageType } from "ts-form-validation";

interface Props extends WithStyles<typeof styles> {
  /**
   * Dialog open state
   */
  open: boolean;

  /**
   * Dialog type
   */
  dialogType: DialogType;

  /**
   * Customer
   */
  customer?: Customer;

  /**
   * Save button click
   */
  saveClick(customer: Customer, dialogType: DialogType): void;
  /**
   * Close handler
   */
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

interface State {
  form: Form<CustomerForm>;
}

/**
 * Creates customer dialog component
 */
class CustomerDialog extends React.Component<Props, State> {
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
  }

  /**
   * Component did update
   */
  public componentDidUpdate = (prevProps: Props, prevState: State) => {
    if (prevProps.customer !== this.props.customer) {
      let form = initForm<CustomerForm>(
        {
          name: this.props.customer ? this.props.customer.name : "",
          ...this.props.customer
        },
        rules
      );

      form = validateForm(form);

      this.setState({
        form
      });
    }
  };

  /**
   * Component render method
   */
  public render() {
    const { classes, dialogType } = this.props;
    const { isFormValid } = this.state.form;

    console.log(this.props.customer);
    console.log(this.props.dialogType);

    return (
      <Dialog fullScreen={false} open={this.props.open} onClose={this.props.handleClose} aria-labelledby="dialog-title">
        <DialogTitle id="dialog-title">
          <div>
            <Typography variant="h2">{this.renderDialogTitle(dialogType)}</Typography>
          </div>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item className={classes.fullWidth}>
              {this.renderField("name", strings.name)}
            </Grid>
            <Grid item className={classes.fullWidth}>
              {dialogType !== "show" && (
                <>
                  <Typography variant="subtitle1">{strings.customerLogo}</Typography>
                  <DropzoneArea
                    dropzoneClass={classes.dropzone}
                    dropzoneParagraphClass={classes.dropzoneText}
                    dropzoneText={strings.dropFile}
                    onChange={this.onImageChange}
                  />
                </>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <Divider />
        <DialogActions>
          <Button variant="outlined" onClick={this.onCloseClick} color="primary">
            {strings.cancel}
          </Button>
          {dialogType !== "show" && (
            <Button variant="contained" onClick={this.onSave} color="primary" autoFocus disabled={!isFormValid}>
              {dialogType === "edit" ? strings.update : strings.save}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    );
  }

  /**
   * Renders textfield
   */
  private renderField = (key: keyof CustomerForm, label: string) => {
    const { dialogType } = this.props;
    const {
      values,
      messages: { [key]: message }
    } = this.state.form;
    return (
      <TextField
        multiline
        fullWidth
        error={message && message.type === MessageType.ERROR}
        helperText={message && message.message}
        value={values[key]}
        onChange={this.onHandleChange(key)}
        onBlur={this.onHandleBlur(key)}
        name={key}
        variant="outlined"
        label={label}
        disabled={dialogType === "show"}
      />
    );
  };

  /**
   * Renders dialog title by type
   * @param dialogType
   */
  private renderDialogTitle = (dialogType: DialogType) => {
    switch (dialogType) {
      case "edit":
        return strings.editCustomer;
      case "show":
        return strings.customerInformation;

      case "new":
        return strings.addNewCustomer;

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

    this.props.handleClose();
  };

  /**
   * Handles textfields change events
   * @param key
   * @param event
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

    this.setState({
      form
    });
  };

  /**
   * Handles image changes
   * @param files
   */
  private onImageChange = async (files: File[]) => {
    const file = files[0];
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
  };

  /**
   * Handles close click and resets form values
   */
  private onCloseClick = () => {
    this.setState(
      {
        form: initForm<CustomerForm>(
          {
            name: ""
          },
          rules
        )
      },
      () => this.props.handleClose()
    );
  };
}

export default withStyles(styles)(CustomerDialog);
