import * as React from "react";
import { withStyles, WithStyles, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Divider, Grid, Typography, Box, LinearProgress } from "@material-ui/core";
import styles from "../../styles/dialog";
import { DropzoneArea } from "material-ui-dropzone";
import strings from "../../localization/strings";
import { Device } from "../../generated/client/src";
import { AuthState, DialogType, ErrorContextType } from "../../types";
import { KeyValueProperty } from "../../generated/client/src/models/KeyValueProperty";
import { FormValidationRules, MessageType, validateForm, initForm, Form } from "ts-form-validation";
import FileUpload from "../../utils/file-upload";
import { ErrorContext } from "../containers/ErrorHandler";

/**
 * Component properties
 */
interface Props extends WithStyles<typeof styles> {
  auth: AuthState;
  open: boolean;
  dialogType: DialogType;
  device?: Device;
  saveClick(device: Device, dialogType: DialogType): void;
  handleClose(): void;
}

/**
 * Device form interface
 */
interface DeviceForm extends Partial<Device> {
  address: any;
  serialnumber: any;
  additionalinformation: any;
}

/**
 * Specifies each fields validation rules
 */
const rules: FormValidationRules<DeviceForm> = {
  fields: {
    name: {
      required: true,
      trim: true,
      requiredText: strings.requiredField
    },
    apiKey: {
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

/**
 * Component state
 */
interface State {
  form: Form<DeviceForm>;
  imageUrl?: string;
  progress?: number;
}

/**
 * Creates Device dialog component
 */
class DeviceDialog extends React.Component<Props, State> {

  static contextType: React.Context<ErrorContextType> = ErrorContext;

  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    const { device } = props;
    const deviceMeta: any = this.convertArrayToObject((device && device.metas) || []);

    this.state = {
      form: initForm<DeviceForm>(
        {
          name: device ? device.name : "",
          apiKey: device ? device.apiKey : "",
          address: deviceMeta["address"] || "",
          serialnumber: deviceMeta["serialnumber"] || "",
          additionalinformation: deviceMeta["additionalinformation"] || "",
          ...device
        },
        rules
      ),
      imageUrl: device ? device.imageUrl : undefined
    };
  }

  /**
   * Component did update
   *
   * @param prevProps previous properties
   */
  public componentDidUpdate = (prevProps: Props) => {
    const { device } = this.props;

    if (prevProps.device !== device) {
      const deviceMeta: any = this.convertArrayToObject((device && device.metas) || []);

      const form = validateForm(
        initForm<DeviceForm>({
          name: device ? device.name : "",
          apiKey: device ? device.apiKey : "",
          address: deviceMeta["address"] || "",
          serialnumber: deviceMeta["serialnumber"] || "",
          additionalinformation: deviceMeta["additionalinformation"] || "",
          ...device
        }, rules)
      );

      this.setState({
        form,
        imageUrl: device ? device.imageUrl : undefined
      });
    }
  };

  /**
   * Component render method
   */
  public render = () => {
    const { classes, open, dialogType, handleClose } = this.props;
    const { progress, form } = this.state;

    return (
      <Dialog
        open={ open }
        onClose={ handleClose }
        aria-labelledby="dialog-title"
        onBackdropClick={ this.onCloseClick }
      >
        <DialogTitle id="dialog-title">
          <div>
            <Typography variant="h2">
              { this.renderDialogTitle(dialogType) }
            </Typography>
          </div>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={ 2 }>
            <Grid item className={ classes.fullWidth }>
              { this.renderField("name", strings.name) }
            </Grid>
            <Grid item className={ classes.fullWidth }>
              { this.renderField("apiKey", strings.apikey) }
            </Grid>
            <Grid item className={ classes.fullWidth }>
              { this.renderField("address", strings.address) }
            </Grid>
            <Grid item className={ classes.fullWidth }>
              { this.renderField("serialnumber", strings.serialNumberOptional) }
            </Grid>
            <Grid item className={ classes.fullWidth }>
              { this.renderField("additionalinformation", strings.informationOptional) }
            </Grid>
            <Grid item className={ classes.fullWidth }>
              { dialogType !== "show" &&
                <>
                  <Typography variant="subtitle1">
                    { strings.resourceTypes.image }
                  </Typography>
                  <Box display="flex">
                    <Box padding={ 2 } flex={ 1 }>
                      <DropzoneArea
                        dropzoneClass={ classes.dropzone }
                        dropzoneParagraphClass={ classes.dropzoneText }
                        dropzoneText={ strings.dropFile }
                        onChange={ this.onImageChange }
                        clearOnUnmount
                        filesLimit={ 1 }
                        showPreviews={ false }
                        showPreviewsInDropzone={ false }
                        maxFileSize={ 314572800 }
                      />
                    </Box>
                    <Box padding={ 2 } flex={ 1 }>
                      { this.renderDeviceImage() }
                    </Box>
                  </Box>
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
              disabled={ !form.isFormValid || (progress !== undefined && progress < 100) }
            >
              { dialogType === "edit" ? strings.update : strings.save }
            </Button>
          }
        </DialogActions>
      </Dialog>
    );
  }

  /**
   * Renders device image
   */
  private renderDeviceImage = () => {
    const { imageUrl, progress } = this.state;

    if (progress) {
      return (
        <>
          <LinearProgress variant="determinate" value={ progress }/>
          <Typography>{ `${progress}%` }</Typography>
        </>
      );
    }

    if (!imageUrl) {
      return (
        <Box
          height="100%"
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <h2>{ strings.noMediaPlaceholder }</h2>
        </Box>
      );
    }

    return (
      <img
        src={ imageUrl }
        alt={ strings.deviceImage }
        style={{ width: "100%" }}
      />
    );
  }

  /**
   * Renders textfield
   *
   * @param key key
   * @param label label
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
        error={ message && message.type === MessageType.ERROR }
        helperText={ message && message.message }
        value={ values[key] }
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
   * @param dialogType dialog type
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
    const { imageUrl } = this.state;
    const { values } = this.state.form;

    const valuesTypeAny: any = { ...values };

    const metaKeys = [ "address", "serialnumber", "additionalinformation" ];

    const metas = metaKeys
      .map(key => ({ key: key, value: valuesTypeAny[key]}))
      .filter(meta => !!meta["value"].length);

    const device = { ...values, metas, imageUrl } as Device;

    saveClick(device, dialogType);

    this.setState({
      form: initForm<DeviceForm>(
        {
          name: "",
          apiKey: "",
          address: "",
          serialnumber: "",
          additionalinformation: ""
        },
        rules
      ),
      imageUrl: undefined
    }, () => this.props.handleClose());
  };

  /**
   * Handles text field change events
   *
   * @param key key
   */
  private onHandleChange = (key: keyof DeviceForm) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const form = validateForm({
      ...this.state.form,
      values: {
        ...this.state.form.values,
        [key]: event.target.value
      }
    }, {
      usePreprocessor: false
    });

    this.setState({ form });
  };

  /**
   * Handles fields blur event
   *
   * @param key key
   */
  private onHandleBlur = (key: keyof DeviceForm) => () => {
    const form = validateForm({
      ...this.state.form,
      filled: {
        ...this.state.form.filled,
        [key]: true
      }
    });

    this.setState({ form });
  };

  /**
   * Handles close click and resets form values
   */
  private onCloseClick = () => {
    this.setState({
      form: initForm<DeviceForm>(
        {
          name: "",
          apiKey: "",
          address: "",
          serialnumber: "",
          additionalinformation: ""
        },
        rules
      ),
      imageUrl: undefined
    }, () => this.props.handleClose());
  };

  /**
   * Converts array to object
   *
   * @param array array
   */
  private convertArrayToObject = (array: KeyValueProperty[]) => {
    return array.reduce((obj, item: any) => Object.assign(obj, { [item.key]: item.value }), {});
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
   * Event handler for image change
   *
   * @param files files
   * @param callback file upload progress callback function
   */
  private onImageChange = async (files: File[]) => {
    const { auth } = this.props;

    if (!auth || !auth.token) {
      return;
    }
    const file = files[0];

    if (file) {
      try {
        const response = await FileUpload.getPresignedPostData(file, auth.token);
        if (response.error) {
          throw new Error(response.message);
        }
  
        const { data, basePath } = response;
        await FileUpload.uploadFileToS3(data, file, this.updateProgress);
        this.setState({ imageUrl: `${basePath}/${data.fields.key}` });
      } catch (error) {
        this.context.setError(strings.errorManagement.file.upload, error);
      }
    }
  };
}

export default withStyles(styles)(DeviceDialog);