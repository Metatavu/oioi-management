import * as React from "react";
import { withStyles, WithStyles, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Divider, Grid, Typography } from "@material-ui/core";
import styles from "../../styles/dialog";
import { DropzoneArea } from "material-ui-dropzone";
import strings from "../../localization/strings";
import { Device } from "../../generated/client/src";
import { DialogType } from "../../types";
import { KeyValueProperty } from "../../generated/client/src/models/KeyValueProperty";

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

interface State {
  deviceData: Partial<Device>;
  deviceMeta: any;
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
    this.state = {
      deviceData: {},
      deviceMeta: {}
    };
  }

  /**
   * Component did mount
   */
  public componentDidMount = () => {
    const deviceMeta = this.convertArrayToObject((this.props.device && this.props.device.metas) || []);

    this.setState({
      deviceData: {
        ...this.props.device
      },
      deviceMeta: deviceMeta
    });
  };

  /**
   * Component did update
   */
  public componentDidUpdate = (prevProps: Props, prevState: State) => {
    if (prevProps.device !== this.props.device) {
      const deviceMeta = this.convertArrayToObject((this.props.device && this.props.device.metas) || []);

      this.setState({
        deviceData: {
          ...this.props.device
        },
        deviceMeta: deviceMeta
      });
    }
  };

  /**
   * Component render method
   */
  public render() {
    const { classes, dialogType } = this.props;

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
              <TextField
                fullWidth
                variant="outlined"
                value={this.state.deviceData.name || ""}
                onChange={this.onDataChange}
                name="name"
                label={strings.name}
                disabled={dialogType === "show"}
              />
            </Grid>
            <Grid item className={classes.fullWidth}>
              <TextField
                fullWidth
                variant="outlined"
                value={this.state.deviceData.api_key || ""}
                onChange={this.onDataChange}
                name="api_key"
                label={strings.apikey}
                disabled={dialogType === "show"}
              />
            </Grid>
            <Grid item className={classes.fullWidth}>
              <TextField
                fullWidth
                variant="outlined"
                value={this.state.deviceMeta["address"]}
                onChange={this.onMetaChange}
                name="address"
                label={strings.address}
                disabled={dialogType === "show"}
              />
            </Grid>
            <Grid item className={classes.fullWidth}>
              <TextField
                fullWidth
                variant="outlined"
                value={this.state.deviceMeta["serialnumber"]}
                onChange={this.onMetaChange}
                name="serialnumber"
                label={strings.serialNumberOptional}
                disabled={dialogType === "show"}
              />
            </Grid>
            <Grid item className={classes.fullWidth}>
              <TextField
                multiline
                fullWidth
                value={this.state.deviceMeta["additionalinformation"]}
                onChange={this.onMetaChange}
                name="additionalinformation"
                variant="outlined"
                label={strings.informationOptional}
                disabled={dialogType === "show"}
              />
            </Grid>
            <Grid item className={classes.fullWidth}>
              {dialogType !== "show" && (
                <>
                  <Typography variant="subtitle1">{strings.image}</Typography>
                  <DropzoneArea
                    dropzoneClass={classes.dropzone}
                    dropzoneParagraphClass={classes.dropzoneText}
                    dropzoneText={strings.dropFile}
                    /* onChange={this.onImageChange} */
                  />
                </>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <Divider />
        <DialogActions>
          <Button variant="outlined" onClick={this.props.handleClose} color="primary">
            {strings.cancel}
          </Button>
          {dialogType !== "show" && (
            <Button variant="contained" onClick={this.onSave} color="primary" autoFocus>
              {strings.save}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    );
  }

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
    const { deviceData, deviceMeta } = this.state;

    const metas = Object.keys(deviceMeta).map((key: string) => {
      return {
        key: key,
        value: deviceMeta[key]
      };
    });

    deviceData.metas = metas;
    const device = { ...deviceData } as Device;
    saveClick(device, dialogType);
  };

  /**
   * Handles meta change
   */
  private onMetaChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { deviceMeta } = this.state;
    this.setState({
      deviceMeta: { ...deviceMeta, [e.target.name]: e.target.value }
    });
  };

  /**
   * Handles data change
   */
  private onDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { deviceData } = this.state;
    this.setState({
      deviceData: { ...deviceData, [e.target.name]: e.target.value }
    });
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
  /* private onImageChange = async (files: File[]) => {
    const file = files[0];
    const response = await FileUpload.uploadFile(file, "customerImages");
    const { deviceData } = this.state;
    deviceData["imageUrl"] = response.uri;

    this.setState({
      deviceData: deviceData
    });
  }; */
}

export default withStyles(styles)(DeviceDialog);
