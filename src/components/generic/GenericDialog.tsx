import * as React from "react";

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton, Box, Typography, LinearProgress } from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import { CSSProperties } from "@material-ui/styles";
import strings from "localization/strings";

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
  error?: boolean;
  fullScreen?: boolean;
  disableEnforceFocus?: boolean;
  disabled?: boolean;
  ignoreOutsideClicks?: boolean;
  style?: CSSProperties;
  loaderMessage?: string;
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
  disableEnforceFocus,
  disabled,
  ignoreOutsideClicks,
  style,
  children,
  loaderMessage
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
    const loaderText = loaderMessage || strings.loading;

    if (showLoader && loading) {
      return (
        <Box marginBottom={ 2 }>
          <LinearProgress color="secondary" style={{ flex: 1 }}/>
          <Box mt={ 2 } display="flex" flex={ 1 } justifyContent="flex-end">
            <Typography>
              { loaderText }
            </Typography>
          </Box>
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
      fullWidth
      maxWidth="sm"
      disableEnforceFocus={ disableEnforceFocus }
      onClose={ (event, reason) => onCloseClick(reason) }
      PaperProps={{ style: style }}
    >
      <DialogTitle disableTypography>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h4">
            { title }
          </Typography>
          <IconButton
            disabled={ showLoader }
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
            disabled={ loading }
          >
            { cancelButtonText }
          </Button>
        }
        { positiveButtonText &&
          <Button
            disabled={ error || disabled || loading }
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