import * as React from "react";
import { withStyles, WithStyles, Button, CircularProgress, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogContentText, TextField, DialogActions, LinearProgress, Typography } from "@material-ui/core";
import styles from "../../styles/dialog";
import { DropzoneArea } from "material-ui-dropzone";
import strings from "../../localization/strings";
import { ChangeEvent } from "react";
import VisibleWithRole from "./VisibleWithRole";
import GenericDialog from "./GenericDialog";

/**
 * Component properties
 */
interface Props extends WithStyles<typeof styles> {
  uploadKey?: string;
  allowedFileTypes: string[];
  allowSetUrl?: boolean;
  uploadButtonText: string;
  onSave: (files: File[], callback: (progress: number) => void, key?: string) => void;
  onSetUrl?: (url: string, key?: string) => void;
}

/**
 * Component states
 */
interface State {
  dialogOpen: boolean;
  uploading: boolean;
  contextMenuOpen: boolean;
  urlDialogOpen: boolean;
  contextMenuX: null | number;
  contextMenuY: null | number;
  resourceUrl?: string;
  progress?: number;
}

/**
 * Generic file uploader UI component
 */
class FileUploader extends React.Component<Props, State> {
  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      dialogOpen: false,
      uploading: false,
      contextMenuOpen: false,
      urlDialogOpen: false,
      contextMenuX: null,
      contextMenuY: null
    };
  }

  /**
   * Component render method
   */
  public render = () => {
    const { classes, uploadButtonText, allowSetUrl } = this.props;

    /**
     * TODO: Add custom icons to resolveLocalizationString
     */
    return (
      <>
        <Button
          onContextMenu={ this.handleContextMenu }
          variant="outlined"
          color="secondary"
          onClick={ this.openDialog }
        >
          { uploadButtonText }
        </Button>
        { this.renderUploadDialog() }
        <VisibleWithRole role="admin">
          { allowSetUrl &&
            <>
              { this.renderContextMenu() }
              { this.renderUrlDialog() }
            </>
          }
        </VisibleWithRole>
      </>
    );
  }

  /**
   * Render upload dialog
   */
  private renderUploadDialog = () => {

    return (
      <GenericDialog
        open={ this.state.dialogOpen }
        error={ false }
        onClose={ this.closeDialog }
        onCancel={ this.closeDialog }
        onConfirm={ this.closeDialog  }
        title={ strings.fileUpload.uploadFile }
        cancelButtonText={ strings.fileUpload.cancel }
        fullWidth={ true }
        ignoreOutsideClicks={ true }
      >
        { this.renderUploader() }
      </GenericDialog>
    );
  }

  private renderUploader = () => {
    const { allowedFileTypes, classes } = this.props;
    const { progress, uploading } = this.state;

    if (uploading && progress === 0) {
      return (
        <div style={{ display: "flex", alignItems: "center", height: 20 }}>
          <LinearProgress color="secondary" style={{ flex: 1 }}/>
        </div>
      );
    }

    return (
      <>
        { (progress && progress > 0) ?
          (
            <div style={{ display: "flex", alignItems: "center", height: 20 }}>
              <LinearProgress variant="determinate" value={ progress } style={{ flex: 1, marginRight: 8 }}/>
              <Typography>{ `${progress}%` }</Typography>
            </div>
          ) :
          <DropzoneArea
            acceptedFiles={ allowedFileTypes }
            clearOnUnmount
            dropzoneText={ strings.fileUpload.uploadFile }
            onDrop={ this.handleSave }
            showPreviewsInDropzone={ false }
            maxFileSize={ (314572800) * 1000000 }
            filesLimit={ 1 }
          />
        }
      </>
    );
  }

  /**
   * Renders context menu
   */
  private renderContextMenu = () => {
    const { uploadButtonText } = this.props;
    const { contextMenuX, contextMenuY, contextMenuOpen } = this.state;

    return (
      <Menu
        keepMounted
        open={ contextMenuOpen }
        onClose={ this.handleContextMenuClose }
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenuY !== null && contextMenuX !== null
            ? { top: contextMenuY, left: contextMenuX }
            : undefined
        }
      >
        <MenuItem onClick={ this.openDialog }>
          { uploadButtonText }
        </MenuItem>
        <MenuItem onClick={ this.openUrlDialog }>
          { strings.inputUrlAddress }
        </MenuItem>
      </Menu>
    );
  }

  /**
   * Renders dialog for directly setting the url
   */
  private renderUrlDialog = () => {
    const { urlDialogOpen, resourceUrl } = this.state;

    return (
      <Dialog
        open={ urlDialogOpen }
        onClose={ this.closeUrlDialog }
      >
        <DialogTitle>
          { strings.urlAddressDialogTitle }
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            { strings.urlAddressDialogContent }
          </DialogContentText>
          <TextField
            autoFocus
            label={ strings.urlAddressDialogLabel }
            type="url"
            onChange={ this.handleResourceUrlChange }
            value={ resourceUrl || "" }
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={ this.closeUrlDialog } color="primary">
            { strings.cancel }
          </Button>
          <Button onClick={ this.handleSetUrl } color="primary">
            { strings.update }
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  /**
   * Handles resource url change
   *
   * @param event React change event
   */
  private handleResourceUrlChange = (event: ChangeEvent<HTMLInputElement>) => {
    this.setState({ resourceUrl: event.target.value });
  }

  /**
   * Opens dialog for setting resource url
   */
  private openUrlDialog = () => {
    this.setState({
      urlDialogOpen: true,
      contextMenuOpen: false
    });
  }

  /**
   * Closes dialog for setting resource url
   */
  private closeUrlDialog = () => {
    this.setState({ urlDialogOpen: false });
  }

  /**
   * Handles closing context menu
   */
  private handleContextMenuClose = () => {
    this.setState({ contextMenuOpen: false });
  }

  /**
   * Handles opening context menu
   *
   * @param event React mouse event
   */
  private handleContextMenu = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    this.setState({
      contextMenuOpen: true,
      contextMenuX: event.clientX - 2,
      contextMenuY: event.clientY - 4
    });
  }

  /**
   * Open upload image dialog
   */
  private openDialog = () => {
    this.setState({
      contextMenuOpen: false,
      dialogOpen: true
    });
  }

  /**
   * Close upload image dialog
   */
  private closeDialog = () => {
    this.setState({
      dialogOpen: false,
      uploading: false
    }, () => {
      setTimeout(() => this.setState({ progress: 0 }), 1000)
    });
  }

  /**
   * Handle direct url setting
   */
  private handleSetUrl = async () => {
    const { onSetUrl, uploadKey } = this.props;
    const { resourceUrl } = this.state;

    if (!resourceUrl) {
      return;
    }

    this.setState({ uploading: true })
    this.closeDialog();
    this.closeUrlDialog();
    this.handleContextMenuClose();
    onSetUrl && onSetUrl(resourceUrl, uploadKey);
    this.setState({ uploading: false });
  }

  /**
   * Callback function that Updates file upload progress
   *
   * @param progress upload progress
   */
  private updateProgress = (progress: number) => {
    this.setState({ progress: Math.floor(progress) });

    if (progress < 100) {
      return;
    }

    this.closeDialog();
  }

  /**
   * Handle save/upload
   *
   * @param files list of files
   */
  private handleSave = async (files: File[]) => {
    const { onSave, uploadKey } = this.props;

    this.setState({ uploading: true, progress: 0 })
    // this.closeUrlDialog();
    // this.handleContextMenuClose();
    onSave(files, this.updateProgress, uploadKey);
  }
}

export default withStyles(styles)(FileUploader);