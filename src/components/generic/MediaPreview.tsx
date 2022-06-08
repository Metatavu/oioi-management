import * as React from "react";
import { Dialog, AppBar, Toolbar, IconButton, withStyles, WithStyles, Box, Typography } from "@material-ui/core";
import styles from "../../styles/editor-view";
import { Resource, ResourceType } from "../../generated/client";
import CloseIcon from "@material-ui/icons/Close";
import FileUploader from "./FileUploader";
import { getAllowedFileTypes } from "../../commons/resourceTypeHelper";
import ReactPlayer from "react-player";
import theme from "../../styles/theme";
import strings from "../../localization/strings";
import AudioPlayer from "material-ui-audio-player";

/**
 * Component properties
 */
interface Props extends WithStyles<typeof styles> {
  resourcePath: string;
  resource: Resource;
  uploadKey: string;
  uploadButtonText: string;
  allowSetUrl: boolean;
  onUpload(newUri: string, key: string, type: string): void;
  onSetUrl(url: string, key?: string): void;
  onDelete(key?: string): void;
  uploadDialogTitle?: string;
  imgHeight?: string;
}

/**
 * Component state
 */
interface State {
  open: boolean;
}

/**
 * Media preview
 */
class MediaPreview extends React.Component<Props, State> {

  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      open: false
    };
  }

  /**
   * Component render method
   */
  public render = () => {
    const { resourcePath, resource, classes } = this.props;

    if (resource.type === ResourceType.VIDEO) {
      return (
        <div className={ classes.videoPreviewElement }>
          <div style={{ marginBottom: theme.spacing(1) }}>
            <div key={ resourcePath }>
              { this.renderPreviewContent() }
            </div>
          </div>
          { this.renderFileUploader() }
        </div>
      );
    }

    if (resource.type === ResourceType.AUDIO) {
      return (
        <div key={ resourcePath } className={ classes.audioPreviewElement }>
          { this.renderPreviewContent() }
          <Box style={{ marginLeft: theme.spacing(2) }}>
            { this.renderFileUploader() }
          </Box>
        </div>
      );
    }

    return (
      <div className={ classes.imagePreviewElement }> 
        <div style={{ marginBottom: theme.spacing(1) }}>
          <div key={ resourcePath } onClick={ this.toggleDialog }>
            { this.renderPreviewContent() }
          </div>
        </div>
        { this.renderFileUploader() }
        { this.renderDialog() }
      </div>
    );
  }

  /**
   * Renders preview content
   */
  private renderPreviewContent = () => {
    const { classes, resource, resourcePath, imgHeight } = this.props;

    if (!resourcePath) {
      return (
        <Box className={ classes.noMediaContainer }>
          <Typography
            variant="h5"
            color="primary"
          >
            { strings.noMediaPlaceholder }
          </Typography>
        </Box>
      );
    }

    if (resource.type === ResourceType.VIDEO) {
      return (
        <ReactPlayer
          controls
          url={ resourcePath }
          style={{
            backgroundColor: "#000",
            padding: theme.spacing(2)
          }}
        />
      );
    }

    if (resource.type === ResourceType.AUDIO) {
      return (
        <AudioPlayer
          elevation={ 1 }
          width="100%"
          variation="primary"
          download={ false }
          loop={ false }
          spacing={ 1 }
          debug={ false }
          src={ [ resourcePath ] }
        />
      );
    }

    return (
      <img
        src={ resourcePath }
        alt="File"
        height={ imgHeight }
        className={ classes.imagePreview }
      />
    );
  }

  /**
   * Render preview dialog
   */
  private renderDialog = () => {
    const { resourcePath, classes } = this.props;
    const { open } = this.state;

    return (
      <Dialog
        fullScreen
        open={ open }
        onClose={ this.toggleDialog }
      >
        <AppBar elevation={ 0 }>
          <Box
            display="flex"
            flexDirection="row"
            justifyContent="space-between"
          >
          <Toolbar>
            <Typography variant="h4">
              { strings.fileUpload.preview }
            </Typography>
          </Toolbar>
          <Box display="flex" alignItems="center">
            <IconButton
              color="inherit"
              onClick={ this.toggleDialog }
              aria-label="close"
            >
              <CloseIcon/>
            </IconButton>
          </Box>
          </Box>
        </AppBar>
        <Box className={ classes.imagePreviewFullscreenContainer }>
          <img src={ resourcePath } alt="File"/>
        </Box>
      </Dialog>
    );
  }

  /**
   * Renders file uploader
   */
  private renderFileUploader = () => {
    const {
      resource,
      onUpload,
      onSetUrl,
      allowSetUrl,
      uploadButtonText,
      uploadDialogTitle,
      uploadKey
    } = this.props;

    return (
      <FileUploader
        title={ uploadDialogTitle }
        uploadButtonText={ uploadButtonText }
        allowSetUrl={ allowSetUrl }
        allowedFileTypes={ getAllowedFileTypes(resource.type) }
        onUpload={ onUpload }
        onSetUrl={ onSetUrl }
        uploadKey={ uploadKey }
      />
    );
  }

  /**
   * Toggle dialog
   */
  private toggleDialog = () => {
    const { resourcePath } = this.props;
    const { open } = this.state;

    resourcePath && this.setState({ open: !open });
  }

}

export default withStyles(styles)(MediaPreview);