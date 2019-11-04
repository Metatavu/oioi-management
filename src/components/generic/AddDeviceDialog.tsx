import * as React from "react";
import { withStyles, WithStyles, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Divider, Grid } from "@material-ui/core";
import styles from "../../styles/card-styles";

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
    return (
      <Dialog
        fullScreen={ false }
        open={ this.props.open }
        onClose={ this.props.handleClose }
        aria-labelledby="dialog-title"
      >
        <DialogTitle id="dialog-title">Add new device</DialogTitle>
        <Divider />
        <DialogContent>
          <Grid container spacing={ 5 }>
            <Grid item>
              <TextField variant="outlined" label="Name"></TextField>
            </Grid>
            <Grid item>
              <TextField variant="outlined" label="Information (optional)"></TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <Divider />
        <DialogActions>
          <Button onClick={ this.props.handleClose } color="primary">
            Cancel
          </Button>
          <Button onClick={ this.props.saveClick } color="primary" autoFocus>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default withStyles(styles)(AddDeviceDialog);