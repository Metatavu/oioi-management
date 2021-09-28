import * as React from "react";

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton, Box, Typography, CircularProgress } from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";

/**
 * Interface representing component properties
 */
interface Props {
  title: string;
  positiveButtonText?: string;
  cancelButtonText?: string;
  onClose: () => void;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
  showLoader?: boolean;
  open: boolean;
  error: boolean;
  fullScreen?: boolean;
  fullWidth?: boolean;
  disableEnforceFocus?: boolean;
  disabled?: boolean;
  ignoreOutsideClicks?: boolean;
}

/**
 * React component displaying confirm dialogs
 */
const GenericDialog: React.FC<Props> = ({
  open,
  positiveButtonText,
  cancelButtonText,
  onClose,
  onCancel,
  title,
  showLoader,
  onConfirm,
  error,
  fullScreen,
  fullWidth,
  disableEnforceFocus,
  disabled,
  ignoreOutsideClicks,
  children
}) => {
  const [ loading, setLoading ] = React.useState(false);

  /**
   * Event handler for on close click
   *
   * @param reason reason why dialog was closed
   */
  const onCloseClick = (reason: string) => {
    if (ignoreOutsideClicks && (reason === "backdropClick" || reason === "escapeKeyDown")) {
      return;
    }

    onClose();
  }

  /**
   * Event handler for confirm click
   */
  const onConfirmClick = async () => {
    setLoading(true);
    await onConfirm();
    setTimeout(() => setLoading(false), 500);
  }

  /**
   * Renders dialog content
   */
  const renderContent = () => {
    if (showLoader && loading) {
      return (
        <Box
          width={ 400 }
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <CircularProgress/>
        </Box>
      );
    }

    return children;
  }

  /**
   * Component render
   */
  return (
    <Dialog
      open={ open }
      fullScreen={ fullScreen }
      fullWidth={ fullWidth }
      disableEnforceFocus={ disableEnforceFocus }
      onClose={ (event, reason) => onCloseClick(reason) }
    >
      <DialogTitle disableTypography>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h4">
            { title }
          </Typography>
          <IconButton
            size="small"
            onClick={ onCancel }
          >
            <CloseIcon color="primary" />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        { renderContent() }
      </DialogContent>
      <DialogActions>
        { cancelButtonText &&
          <Button
            onClick={ onCancel }
            color="secondary"
          >
            { cancelButtonText }
          </Button>
        }
        { positiveButtonText &&
        <Button
          disabled={ error || disabled }
          onClick={ onConfirmClick }
          color="primary"
          autoFocus
        >
          { positiveButtonText }
        </Button>
        }
      </DialogActions>
    </Dialog>
  );
}

export default GenericDialog;