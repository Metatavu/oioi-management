import * as React from "react";
import { DialogTitle, Typography, Dialog, Divider, DialogContent, Button, WithStyles, Grid, withStyles } from "@material-ui/core";
import { Application } from "../../generated/client/src/models/Application";
import { Customer } from "../../generated/client/src/models/Customer";
import { Device } from "../../generated/client/src/models/Device";
import strings from "../../localization/strings";
import styles from "../../styles/dialog";

/**
 * Union type for all items that can be deleted
 */
type DeleteItem = Device | Application | Customer | undefined;

/**
 * Component properties
 */
interface Props extends WithStyles<typeof styles> {
  open: boolean;
  title: string;
  itemToDelete: DeleteItem;
  deleteClick(item: DeleteItem): void;
  handleClose(): void;
}

/**
 * Delete dialog component
 *
 * @param props component properties
 */
const DeleteDialog: React.FC<Props> = ({
  deleteClick,
  handleClose,
  itemToDelete,
  open,
  title
}) => {

  /**
   * Component render
   */
  return (
    <Dialog
      fullScreen={ false }
      open={ open }
      onClose={ handleClose }
    >
      <DialogTitle>
        <div>
          <Typography variant="h2">
            { title }
          </Typography>
        </div>
      </DialogTitle>
      <Divider />
      <DialogContent>
        <Grid
          container
          spacing={ 2 }
          justify="center"
        >
          <Grid item>
            <Button
              variant="outlined"
              onClick={ handleClose }
              color="primary"
            >
              { strings.cancel }
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              autoFocus
              onClick={ () => deleteClick(itemToDelete) }
            >
              { strings.confirm }
            </Button>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
}

export default withStyles(styles)(DeleteDialog);
