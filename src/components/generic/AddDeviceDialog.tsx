import * as React from "react";
import { withStyles, WithStyles, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Divider, Grid, Typography } from "@material-ui/core";
import styles from "../../styles/dialog";
import { DropzoneArea } from "material-ui-dropzone";
import strings from "../../localization/strings";

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
                label={ strings.name }
              />
            </Grid>
            <Grid item className={ classes.fullWidth }>
              <TextField
                fullWidth
                variant="outlined"
                label={ strings.address }
              />
            </Grid>
            <Grid item className={ classes.fullWidth }>
              <TextField
                fullWidth
                variant="outlined"
                label={ strings.serialNumberOptional }
              />
            </Grid>
            <Grid item className={ classes.fullWidth }>
              <TextField
                multiline
                fullWidth
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
          <Button variant="contained" onClick={ this.props.saveClick } color="primary" autoFocus>
            { strings.save }
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default withStyles(styles)(AddDeviceDialog);