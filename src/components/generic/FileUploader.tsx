import * as React from "react";
import { withStyles, WithStyles, Button, CircularProgress, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogContentText, TextField, DialogActions } from "@material-ui/core";
import styles from "../../styles/dialog";
import { DropzoneDialog } from "material-ui-dropzone";
import strings from "../../localization/strings";
import { ChangeEvent } from "react";
import VisibleWithRole from "./VisibleWithRole";

/**
 * Component props
 */
interface Props extends WithStyles<typeof styles> {
  uploadKey?: string;
  allowedFileTypes: string[];
  allowSetUrl: boolean,
  uploadButtonText: string;
  /**
   * Save files to resource
   * @param files files
   * @param key  upload key
   */
  onSave(files: File[], key?: string): void;

  /**
   * Directly sets resource url
   * @param url url to set
   * @param key key
   */
  onSetUrl(url: string, key?: string): void;
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
      contextMenuY: null,
    };
  }

  /**
   * Component did update
   */
  public componentDidUpdate = (prevProps: Props, prevState: State) => {

  };

  /**
   * Component render method
   */
  public render() {
    const { classes, uploadButtonText } = this.props;

    if (this.state.uploading) {
      return (
        <div className={ classes.imageUploadLoaderContainer }>
          <CircularProgress color="secondary" style={{ alignSelf: "center" }}></CircularProgress>
        </div>
      );
    }

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
          { this.props.allowSetUrl &&
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
    const { allowedFileTypes } = this.props;

    return (
      <DropzoneDialog
        acceptedFiles={ allowedFileTypes }
        open={ this.state.dialogOpen }
        onClose={ this.closeDialog }
        onSave={ this.handleSave }
        dialogTitle={ strings.fileUpload.uploadFile }
        dropzoneText={ strings.fileUpload.dropFileHere }
        cancelButtonText={ strings.fileUpload.cancel }
        submitButtonText={ strings.fileUpload.upload }
        filesLimit={ 1 }
        maxFileSize={ 314572800 }
        showPreviewsInDropzone={ false }
      />
    );
  }

  /**
   * Renders context menu
   */
  private renderContextMenu = () => {
    const { uploadButtonText } = this.props;

    return (
      <Menu
        keepMounted
        open={ this.state.contextMenuOpen }
        onClose={ this.handleContextMenuClose }
        anchorReference="anchorPosition"
        anchorPosition={
          this.state.contextMenuY !== null && this.state.contextMenuX !== null
            ? { top: this.state.contextMenuY, left: this.state.contextMenuX }
            : undefined
        }
      >
        <MenuItem onClick={() => this.openDialog() }>{ uploadButtonText }</MenuItem>
        <MenuItem onClick={() => this.openUrlDialog() }> { strings.inputUrlAddress } </MenuItem>
      </Menu>
    );
  }

  /**
   * Renders dialog for directly setting the url
   */
  private renderUrlDialog = () => {
    return (
      <Dialog
        open={ this.state.urlDialogOpen }
        onClose={ this.closeUrlDialog }
        aria-labelledby="url-dialog-title"
      >
        <DialogTitle id="url-dialog-title">
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
            value={ this.state.resourceUrl || "" }
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={ () => this.closeUrlDialog() } color="primary">
            { strings.cancel }
          </Button>
          <Button onClick={ () => this.handleSetUrl() } color="primary">
            { strings.update }
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  /**
   * Handles resource url change
   */
  private handleResourceUrlChange = (event: ChangeEvent<HTMLInputElement>) => {
    this.setState({
      resourceUrl: event.target.value
    });
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
    this.setState({
      urlDialogOpen: false
    });
  }

  /**
   * Handles closing context menu
   */
  private handleContextMenuClose = () => {
    this.setState({contextMenuOpen: false});
  }

  /**
   * Handles opening context menu
   */
  private handleContextMenu = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    this.setState({
      contextMenuOpen: true,
      contextMenuX: event.clientX - 2,
      contextMenuY: event.clientY - 4,
    })
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
      dialogOpen: false
    });
  }

  /**
   * Handle direct url setting
   */
  private handleSetUrl = async () => {
    const { resourceUrl } = this.state;
    if (!resourceUrl) {
      return;
    }

    this.setState({ uploading: true })
    this.closeDialog();
    this.closeUrlDialog();
    this.handleContextMenuClose();
    await this.props.onSetUrl(resourceUrl, this.props.uploadKey);
    this.setState({ uploading: false });
  }

  /**
   * Handle save/upload
   * TODO: Add some kind of progress indicator
   */
  private handleSave = async (files: File[]) => {
    this.setState({ uploading: true })
    this.closeDialog();
    this.closeUrlDialog();
    this.handleContextMenuClose();
    await this.props.onSave(files, this.props.uploadKey);
    this.setState({ uploading: false });
  }
}

export default withStyles(styles)(FileUploader);
