import * as React from "react";
import { Dialog, AppBar, Toolbar, IconButton, withStyles, WithStyles, Box, Typography } from "@material-ui/core";
import styles from "../../styles/editor-view";
import { Resource, ResourceType } from "../../generated/client/src";

import CloseIcon from "@material-ui/icons/Close";
import DeleteIcon from "@material-ui/icons/DeleteForever";
import FileUploader from "../generic/FileUploader";
import { getAllowedFileTypes } from "../../commons/resourceTypeHelper";
import ReactPlayer from "react-player";
import theme from "../../styles/theme";
import strings from "../../localization/strings";
import classNames from "classnames";

/**
 * Component props
 */
interface Props extends WithStyles<typeof styles> {
  imagePath: string;
  resource: Resource;
  uploadKey: string;
  uploadButtonText: string;
  allowSetUrl: boolean;
  onUpload(newUri: string, key?: string): void;
  onSetUrl(url: string, key?: string): void;
  onDelete(key?: string): void;
  uploadDialogTitle?: string;
}

/**
 * Component states
 */
interface State {
  dialogOpen: boolean;
}

/**
 * Generic file uploader UI component
 */
class ImagePreview extends React.Component<Props, State> {
  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      dialogOpen: false,
    };
  }

  /**
   * Component render method
   */
  public render = () => {
    const {
      imagePath,
      resource,
      onUpload,
      uploadKey,
      classes,
      onSetUrl,
      allowSetUrl,
      uploadButtonText,
      uploadDialogTitle
    } = this.props;

    const allowedFileTypes = getAllowedFileTypes(resource.type);
    const video = resource.type === ResourceType.VIDEO;
    let previewContent = (
      <Box className={ classes.noMediaContainer }>
        <Typography variant="h5" color="primary">
          { strings.noMediaPlaceholder }
        </Typography>
      </Box>
    );

    if (imagePath) {
      previewContent = video ?
        <ReactPlayer 
          url={ imagePath }
          controls={ true }
          style={{ backgroundColor: "#000", padding: theme.spacing(2) }}
        /> :
        <img
          src={ imagePath }
          alt="File"
          height="200"
          className={ classes.imagePreview }
        />;
    }

    return (
      <div className={ classNames(classes.imagePreviewElement, video && "video" ) }>
        <div style={{ marginBottom: theme.spacing(1) }}>
          <div key={ imagePath } onClick={ this.toggleDialog }>
            { previewContent }
          </div>
          { imagePath &&
            <div className={ classes.deleteImage }>
              <IconButton
                size="small"
                className={ classes.iconButton }
                title={ strings.delete }
                color="secondary"
                onClick={ () => this.props.onDelete(uploadKey) }>
                <DeleteIcon />
              </IconButton>
            </div>
          }
        </div>
        <FileUploader
          title={ uploadDialogTitle }
          uploadButtonText={ uploadButtonText }
          allowSetUrl={ allowSetUrl }
          allowedFileTypes={ allowedFileTypes }
          onUpload={ onUpload }
          onSetUrl={ onSetUrl }
          uploadKey={ uploadKey }
        />

        { this.state.dialogOpen &&
          this.renderDialog()
        }
      </div>
    );
  }

  /**
   * Render preview dialog
   */
  private renderDialog = () => {
    const { imagePath, classes } = this.props;
    const { dialogOpen } = this.state;

    return (
      <Dialog
        fullScreen
        open={ dialogOpen }
        onClose={ this.closeDialog }
      >
        <AppBar elevation={ 0 }>
          <Box display="flex" flexDirection="row" justifyContent="space-between">
          <Toolbar>
            <Typography variant="h4">
              { strings.fileUpload.preview }
            </Typography>
          </Toolbar>
          <Box display="flex" alignItems="center">
            <IconButton
              color="inherit"
              onClick={ this.closeDialog }
              aria-label="close"
            >
              <CloseIcon/>
            </IconButton>
          </Box>
          </Box>
        </AppBar>
        <Box className={ classes.imagePreviewFullscreenContainer }>
          <img src={ imagePath } alt="File" />
        </Box>
      </Dialog>
    );
  }

  /**
   * Toggle dialog
   */
  private toggleDialog = () => {
    const { imagePath } = this.props;
    if (!imagePath) {
      return;
    }

    const open = !this.state.dialogOpen;
    this.setState({ dialogOpen: open });
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
   * Check if preview item is application icon
   */
  private isIcon = (key: string) => {
    return key.includes("_");
  }

  /**
   * If preview item is application icon (contains prefix icon_)
   * split the property name and return the trimmed name
   */
  private trimKeyPrefix = (key: string): string => {
    const splitKey = key.split("_");
    return splitKey[splitKey.length - 1];
  }
}

export default withStyles(styles)(ImagePreview);