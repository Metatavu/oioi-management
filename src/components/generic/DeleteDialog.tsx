import * as React from "react";
import { DialogTitle, Typography, Dialog, DialogContent, Button, WithStyles, withStyles, Box, DialogActions } from "@material-ui/core";
import { Application } from "../../generated/client/models/Application";
import { Customer } from "../../generated/client/models/Customer";
import { Device } from "../../generated/client/models/Device";
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
  message: string;
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
  title,
  message
}) => {

  /**
   * Component render
   */
  return (
    <Dialog
      fullScreen={ false }
      open={ open }
      onClose={ handleClose }
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle disableTypography>
        <Box>
          <Typography variant="h4">
            { title }
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1">
          { message }
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button
          variant="text"
          onClick={ handleClose }
          color="primary"
        >
          { strings.cancel }
        </Button>

        <Button
          variant="contained"
          color="primary"
          autoFocus
          onClick={ () => deleteClick(itemToDelete) }
        >
          { strings.delete }
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default withStyles(styles)(DeleteDialog);
