import * as React from "react";
import { withStyles, WithStyles, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Divider } from "@material-ui/core";
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

class AddCustomerDialog extends React.Component<Props, State> {

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
        <DialogTitle id="dialog-title">Add new customer</DialogTitle>
        <Divider />
        <DialogContent>
          <TextField variant="outlined" label="Name"></TextField>
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

export default withStyles(styles)(AddCustomerDialog);