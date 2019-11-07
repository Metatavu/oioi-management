import * as React from "react";
import { withStyles, WithStyles, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Divider, Grid, Typography } from "@material-ui/core";
import styles from "../../styles/dialog";
import { DropzoneArea } from "material-ui-dropzone";

interface Props extends WithStyles<typeof styles> {
  /**
   * Dialog open state
   */
  open: boolean
  /**
   * Save button click
   */
  saveClick(): void
  /**
   * Close handler
   */
  handleClose(): void
}

interface State {

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
      open: true
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
        <DialogTitle id="dialog-title"><Typography variant="h2">Add new device</Typography></DialogTitle>
        <Divider />
        <DialogContent>
          <Grid container spacing={ 2 }>
            <Grid item className={ classes.fullWidth }>
              <TextField
                fullWidth
                variant="outlined"
                label="Name"
              />
            </Grid>
            <Grid item className={ classes.fullWidth }>
              <TextField
                fullWidth
                variant="outlined"
                label="Address"
              />
            </Grid>
            <Grid item className={ classes.fullWidth }>
              <TextField
                multiline
                fullWidth
                variant="outlined"
                label="Information (optional)"
              />
            </Grid>
            <Grid item className={ classes.fullWidth}>
              <Typography variant="subtitle1">Device img</Typography>
              <DropzoneArea dropzoneClass={ classes.dropzone }></DropzoneArea>
            </Grid>
          </Grid>
        </DialogContent>
        <Divider />
        <DialogActions>
          <Button variant="outlined" onClick={ this.props.handleClose } color="primary">
            Cancel
          </Button>
          <Button variant="contained" onClick={ this.props.saveClick } color="primary" autoFocus>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default withStyles(styles)(AddDeviceDialog);