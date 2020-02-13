import * as React from "react";
import { DialogTitle, Typography, Dialog, Divider, DialogContent, Button, WithStyles, Grid, withStyles } from "@material-ui/core";
import { Application } from "../../generated/client/src/models/Application";
import { Customer } from "../../generated/client/src/models/Customer";
import { Device } from "../../generated/client/src/models/Device";
import strings from "../../localization/strings";
import styles from "../../styles/dialog";

type DeleteItem = Device | Application | Customer | undefined;

interface Props extends WithStyles<typeof styles> {
  open: boolean;
  title: string;
  itemToDelete: DeleteItem;
  deleteClick(item: DeleteItem): void;
  handleClose(): void;
}

interface State {}

class DeleteDialog extends React.Component<Props, State> {
  /**
   * Constructor
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
  }

  /**
   * Component render method
   */
  public render() {
    return (
      <Dialog fullScreen={false} open={this.props.open} onClose={this.props.handleClose} aria-labelledby="dialog-title">
        <DialogTitle>
          <div>
            <Typography variant="h2">{this.props.title}</Typography>
          </div>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Grid container spacing={2} justify="center">
            <Grid item>
              <Button variant="outlined" onClick={this.props.handleClose} color="primary">
                {strings.cancel}
              </Button>
            </Grid>
            <Grid item>
              <Button variant="contained" onClick={this.onDelete} color="primary" autoFocus>
                {strings.confirm}
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
    );
  }

  /**
   * Handles delete button click
   */
  private onDelete = () => {
    const { deleteClick, itemToDelete } = this.props;
    deleteClick(itemToDelete);
  };
}

export default withStyles(styles)(DeleteDialog);
