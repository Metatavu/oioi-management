import * as React from "react";
import { Dialog, AppBar, Toolbar, IconButton, withStyles, WithStyles, Box, Typography } from "@material-ui/core";
import styles from "../../styles/editor-view";
import { ResourceType } from "../../generated/client";
import CloseIcon from "@material-ui/icons/Close";
import DeleteIcon from "@material-ui/icons/DeleteForever";
import FileUploader from "../generic/FileUploader";
import { getAllowedFileTypes } from "../../commons/resourceTypeHelper";
import theme from "../../styles/theme";
import strings from "../../localization/strings";

/**
 * Component properties
 */
interface Props extends WithStyles<typeof styles> {
  imagePath: string;
  uploadKey: string;
  uploadButtonText: string;
  allowSetUrl: boolean;
  onUpload(newUri: string, key: string, type: string): void;
  onSetUrl(url: string, key?: string): void;
  onDelete(key?: string): void;
  uploadDialogTitle?: string;
}

/**
 * Component state
 */
interface State {
  open: boolean;
}

/**
 * Application Icon preview
 */
class IconPreview extends React.Component<Props, State> {

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
    const { imagePath, classes } = this.props;

    return (
      <div className={ classes.iconPreviewElement }>
        <div style={{ marginBottom: theme.spacing(1) }}>
          <div
            key={ imagePath }
            onClick={ this.toggleDialog }
          >
            { this.renderPreviewContent() }
          </div>
          { imagePath && this.renderDeleteImage() }
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
    const { classes, imagePath } = this.props;

    if (!imagePath) {
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

    return (
      <Box className={ classes.iconWrapper }>
        <img
          src={ imagePath }
          alt="File"
          height="104"
          className={ classes.iconPreview }
        />
      </Box>
    );
  }

  /**
   * Render preview dialog
   */
  private renderDialog = () => {
    const { imagePath, classes } = this.props;
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
          <img src={ imagePath } alt="File"/>
        </Box>
      </Dialog>
    );
  }

  /**
   * Renders delete image
   */
  private renderDeleteImage = () => {
    const { classes, onDelete, uploadKey } = this.props;

    return (
      <div className={ classes.deleteImage }>
        <IconButton
          size="small"
          color="secondary"
          className={ classes.iconButton }
          title={ strings.applicationEditor.removeCustomIcon }
          onClick={ () => onDelete(uploadKey) }
        >
          <DeleteIcon />
        </IconButton>
      </div>
    );
  }

  /**
   * Renders file uploader
   */
  private renderFileUploader = () => {
    const {
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
        allowedFileTypes={ getAllowedFileTypes(ResourceType.CONTENTVERSION) }
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
    const { imagePath } = this.props;
    const { open } = this.state;

    imagePath && this.setState({ open: !open });
  }

}

export default withStyles(styles)(IconPreview);