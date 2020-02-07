import * as React from "react";
import { withStyles, WithStyles, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Divider, Grid, Typography } from "@material-ui/core";
import styles from "../../styles/dialog";
import { DropzoneArea } from "material-ui-dropzone";
import strings from "../../localization/strings";
import { Device } from "../../generated/client/src";
import { DialogType } from "../../types";
import { KeyValueProperty } from "../../generated/client/src/models/KeyValueProperty";
import { FormValidationRules, MessageType, validateForm, initForm, Form } from "ts-form-validation";
import FileUpload from "../../utils/FileUpload";

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
   * Choosed device
   */
  device?: Device;

  /**
   * Save button click
   */
  saveClick(device: Device, dialogType: DialogType): void;
  /**
   * Close handler
   */
  handleClose(): void;
}

interface DeviceForm extends Partial<Device> {
  address: any;
  serialnumber: any;
  additionalinformation: any;
}

const rules: FormValidationRules<DeviceForm> = {
  fields: {
    name: {
      required: true,
      trim: true,
      requiredText: strings.requiredField
    },
    api_key: {
      required: true,
      trim: true,
      requiredText: strings.requiredField
    },
    address: {
      required: true,
      trim: true,
      requiredText: strings.requiredField
    },
    serialnumber: {
      required: false
    },
    additionalinformation: {
      required: false
    }
  },
  validateForm: form => {
    const messages = {};

    return { ...form, messages };
  }
};

interface State {
  form: Form<DeviceForm>;
  image_url?: string;
}

/**
 * Creates Device dialog component
 */
class DeviceDialog extends React.Component<Props, State> {
  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);

    const deviceMeta: any = this.convertArrayToObject((props.device && props.device.metas) || []);

    this.state = {
      form: initForm<DeviceForm>(
        {
          name: props.device ? props.device.name : "",
          api_key: props.device ? props.device.api_key : "",
          address: deviceMeta["address"] || "",
          serialnumber: deviceMeta["serialnumber"] || "",
          additionalinformation: deviceMeta["additionalinformation"] || "",
          ...props.device
        },
        rules
      )
    };
  }

  /**
   * Component did update
   */
  public componentDidUpdate = (prevProps: Props, prevState: State) => {
    if (prevProps.device !== this.props.device) {
      const deviceMeta: any = this.convertArrayToObject((this.props.device && this.props.device.metas) || []);

      let form = initForm<DeviceForm>(
        {
          name: this.props.device ? this.props.device.name : "",
          api_key: this.props.device ? this.props.device.api_key : "",
          address: deviceMeta["address"] || "",
          serialnumber: deviceMeta["serialnumber"] || "",
          additionalinformation: deviceMeta["additionalinformation"] || "",
          ...this.props.device
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
              {this.renderField("api_key", strings.apikey)}
            </Grid>
            <Grid item className={classes.fullWidth}>
              {this.renderField("address", strings.address)}
            </Grid>
            <Grid item className={classes.fullWidth}>
              {this.renderField("serialnumber", strings.serialNumberOptional)}
            </Grid>
            <Grid item className={classes.fullWidth}>
              {this.renderField("additionalinformation", strings.informationOptional)}
            </Grid>
            <Grid item className={classes.fullWidth}>
              {dialogType !== "show" && (
                <>
                  <Typography variant="subtitle1">{strings.image}</Typography>
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
  private renderField = (key: keyof DeviceForm, label: string) => {
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
   */
  private renderDialogTitle = (dialogType: DialogType) => {
    switch (dialogType) {
      case "edit":
        return strings.editDevice;
      case "show":
        return strings.deviceInformation;

      case "new":
        return strings.addNewDevice;

      default:
        return strings.addNewDevice;
    }
  };

  /**
   * Handles save button click
   */
  private onSave = () => {
    const { saveClick, dialogType } = this.props;
    const { image_url } = this.state;
    const { values } = this.state.form;

    const valuesTypeAny: any = { ...values };

    const metaKeys = ["address", "serialnumber", "additionalinformation"];

    const metas = metaKeys
      .map((key: string, index) => {
        return {
          key: key,
          value: valuesTypeAny[key]
        };
      })
      .filter(meta => meta["value"].length !== 0);

    const device = { ...values, metas, image_url } as Device;

    saveClick(device, dialogType);

    this.setState(
      {
        form: initForm<DeviceForm>(
          {
            name: "",
            api_key: "",
            address: "",
            serialnumber: "",
            additionalinformation: ""
          },
          rules
        ),
        image_url: undefined
      },
      () => this.props.handleClose()
    );
  };

  /**
   * Handles textfields change events
   * @param key
   * @param event
   */
  private onHandleChange = (key: keyof DeviceForm) => (event: React.ChangeEvent<HTMLInputElement>) => {
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
  private onHandleBlur = (key: keyof DeviceForm) => () => {
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
   * Handles close click and resets form values
   */
  private onCloseClick = () => {
    this.setState(
      {
        form: initForm<DeviceForm>(
          {
            name: "",
            api_key: "",
            address: "",
            serialnumber: "",
            additionalinformation: ""
          },
          rules
        ),
        image_url: undefined
      },
      () => this.props.handleClose()
    );
  };

  /**
   * Converts array to object
   */
  private convertArrayToObject = (array: KeyValueProperty[]) => {
    const object = array.reduce((obj, item: any) => Object.assign(obj, { [item.key]: item.value }), {});

    return object;
  };

  /**
   * TODO: Handling device form image changes
   *
   */
  private onImageChange = async (files: File[]) => {
    const file = files[0];
    const response = await FileUpload.uploadFile(file, "deviceImages");

    this.setState({
      image_url: response.uri
    });
  };
}

export default withStyles(styles)(DeviceDialog);
