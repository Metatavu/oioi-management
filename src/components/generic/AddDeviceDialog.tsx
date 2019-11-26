import * as React from "react";
import { withStyles, WithStyles, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Divider, Grid, Typography } from "@material-ui/core";
import styles from "../../styles/dialog";
import { DropzoneArea } from "material-ui-dropzone";
import strings from "../../localization/strings";
import { Device, DeviceFromJSON } from "../../generated/client/src";

interface Props extends WithStyles<typeof styles> {
  /**
   * Dialog open state
   */
  open: boolean
  /**
   * Save button click
   */
  saveClick(device: Device): void
  /**
   * Close handler
   */
  handleClose(): void
}

interface State {
  deviceData: any
  deviceMeta: any
}

class AddDeviceDialog extends React.Component<Props, State> {

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
   * Component render method
   */
  public render() {
    const { classes } = this.props;
    return (
      <Dialog
        fullScreen={ false }
        open={ this.props.open }
        onClose={ this.props.handleClose }
        aria-labelledby="dialog-title"
      >
        <DialogTitle id="dialog-title">
          <Typography variant="h2">{ strings.addNewDevice }</Typography>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Grid container spacing={ 2 }>
            <Grid item className={ classes.fullWidth }>
              <TextField
                fullWidth
                variant="outlined"
                value={this.state.deviceData["name"]}
                onChange={this.onDataChange}
                name="name"
                label={ strings.name }
              />
            </Grid>
            <Grid item className={ classes.fullWidth }>
              <TextField
                fullWidth
                variant="outlined"
                value={this.state.deviceData["apiKey"]}
                onChange={this.onDataChange}
                name="apiKey"
                label={ strings.apikey }
              />
            </Grid>
            <Grid item className={ classes.fullWidth }>
              <TextField
                fullWidth
                variant="outlined"
                value={this.state.deviceMeta["address"]}
                onChange={this.onMetaChange}
                name="address"
                label={ strings.address }
              />
            </Grid>
            <Grid item className={ classes.fullWidth }>
              <TextField
                fullWidth
                variant="outlined"
                value={this.state.deviceMeta["serialnumber"]}
                onChange={this.onMetaChange}
                name="serialnumber"
                label={ strings.serialNumberOptional }
              />
            </Grid>
            <Grid item className={ classes.fullWidth }>
              <TextField
                multiline
                fullWidth
                value={this.state.deviceMeta["additionalinformation"]}
                onChange={this.onMetaChange}
                name="additionalinformation"
                variant="outlined"
                label={ strings.informationOptional }
              />
            </Grid>
            <Grid item className={ classes.fullWidth}>
              <Typography variant="subtitle1">{ strings.image }</Typography>
              <DropzoneArea
                dropzoneClass={ classes.dropzone }
                dropzoneParagraphClass={ classes.dropzoneText }
                dropzoneText={ strings.dropFile }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <Divider />
        <DialogActions>
          <Button variant="outlined" onClick={ this.props.handleClose } color="primary">
            { strings.cancel }
          </Button>
          <Button variant="contained" onClick={ this.onSave } color="primary" autoFocus>
            { strings.save }
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  /**
   * Handles save button click
   */
  private onSave = () => {
    const { saveClick } = this.props;
    const { deviceData, deviceMeta } = this.state;
    const metas = Object.keys(deviceMeta).map((key: string) => {
      return {
        key: key,
        value: deviceMeta[key]
      }
    });
    deviceData.metas = metas;
    const device = DeviceFromJSON(deviceData);
    saveClick(device);
  }

  /**
   * Handles meta change
   */
  private onMetaChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { deviceMeta } = this.state;
    deviceMeta[e.target.name] = e.target.value;
    this.setState({
      deviceMeta: deviceMeta
    });
  }

  /**
   * Handles data change
   */
  private onDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { deviceData } = this.state;
    deviceData[e.target.name] = e.target.value;
    this.setState({
      deviceData: deviceData
    });
  }
}

export default withStyles(styles)(AddDeviceDialog);