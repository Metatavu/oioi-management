import * as React from "react";
import { withStyles, WithStyles, Button, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogContentText, TextField, DialogActions, LinearProgress, Typography, Box } from "@material-ui/core";
import styles from "styles/dialog";
import { DropzoneArea } from "material-ui-dropzone";
import strings from "localization/strings";
import { ChangeEvent } from "react";
import VisibleWithRole from "../containers/VisibleWithRole";
import GenericDialog from "./GenericDialog";
import FileUpload from "utils/file-upload";
import { ReduxState } from "app/store";
import { connect, ConnectedProps } from "react-redux";
import { UploadData } from "types";

/**
 * Component properties
 */
interface Props extends ExternalProps {
  uploadKey?: string;
  allowedFileTypes: string[];
  allowSetUrl?: boolean;
  uploadButtonText: string;
  onUpload: (uri: string, key: string, type: string) => void;
  onSetUrl?: (url: string, key?: string) => void;
  title?: string;
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
  uploadData?: UploadData;
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
    const { uploadButtonText, allowSetUrl } = this.props;

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
    const { title } = this.props;

    return (
      <GenericDialog
        open={ this.state.dialogOpen }
        error={ false }
        onClose={ this.closeDialog }
        onCancel={ this.onAbortUpload }
        onConfirm={ this.closeDialog  }
        title={ title || strings.fileUpload.uploadFile }
        cancelButtonText={ strings.fileUpload.cancel }
        fullWidth
        ignoreOutsideClicks
      >
        { this.renderUploader() }
      </GenericDialog>
    );
  }

  /**
   * Renders uploader or progress bar is upload is ongoing
   */
  private renderUploader = () => {
    const { allowedFileTypes, classes } = this.props;
    const { progress, uploading } = this.state;

    if (uploading && progress === 0) {
      return (
        <Box>
          <LinearProgress key="indeterminate" color="secondary" style={{ flex: 1 }}/>
        </Box>
      );
    }

    if ( progress === 100) {
      return (
        <Box>
          <LinearProgress key="finalizing" color="secondary" style={{ flex: 1 }}/>
          <Box mt={ 2 } display="flex" flex={ 1 } justifyContent="flex-end">
            <Typography>
              { strings.fileUpload.finalizing }
            </Typography>
          </Box>
        </Box>
      );
    }

    if (progress) {
      return (
        <Box>
          <LinearProgress
            key="determinate"
            variant="determinate"
            value={ progress }
            className={ classes.linearProgress }
          />
          <Box mt={ 2 } display="flex" flex={ 1 } justifyContent="flex-end">
            <Typography>
              { `${progress}%` }
            </Typography>
          </Box>
        </Box>
      );
    }

    return (
      <DropzoneArea
        acceptedFiles={ allowedFileTypes }
        clearOnUnmount
        dropzoneText={ strings.fileUpload.uploadFile }
        onDrop={ this.onFileUpload }
        showPreviewsInDropzone={ false }
        maxFileSize={ 4 * 1024 * 1024 * 1024 }
        filesLimit={ 1 }
      />
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
   * Aborts file upload
   */
  private onAbortUpload = () => {
    const { uploadData } = this.state;
    uploadData && uploadData.xhrRequest.abort();

    this.closeDialog();
  }

  /**
   * Close upload image dialog
   */
  private closeDialog = () => {
    this.setState({
      dialogOpen: false,
      uploading: false,
      uploadData: undefined
    }, () => setTimeout(() => this.setState({ progress: 0 }), 1000));
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
    const { onUpload, uploadKey } = this.props;
    const { uploadData } = this.state;

    this.setState({ progress: Math.floor(progress) });

    if (!uploadData || progress < 100) {
      return;
    }

    setTimeout(() => {
      onUpload(`${uploadData.cdnBasePath}/${uploadData.key}`, uploadKey || "", uploadData.fileType);
      this.closeDialog();
    }, 3000);
  }

  /**
   * Handle save/upload
   *
   * @param files list of files
   * @param event drop event
   */
  private onFileUpload = async (files: File[]) => {
    const { keycloak } = this.props;

    if (!keycloak?.token || !files.length) {
      return;
    }

    this.setState({ uploading: true, progress: 0 });

    try {
      const uploadData = await FileUpload.upload(keycloak.token, files[0], this.updateProgress);
      const { xhrRequest, uploadUrl, formData } = uploadData;
      this.setState({ uploadData: uploadData });
      xhrRequest.open("POST", uploadUrl, true);
      xhrRequest.send(formData);
    } catch (error) {
      console.error(error);
    }
  }
}

/**
 * Maps Redux state to component properties
 *
 * @param state Redux state
 */
const mapStateToProps = (state: ReduxState) => ({
  keycloak: state.auth.keycloak
});

const connector = connect(mapStateToProps);

type ExternalProps = ConnectedProps<typeof connector> & WithStyles<typeof styles>;

export default connector(withStyles(styles)(FileUploader));