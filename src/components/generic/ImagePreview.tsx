import * as React from "react";
import { Dialog, AppBar, Toolbar, IconButton, withStyles, WithStyles } from "@material-ui/core";
import styles from "../../styles/editor-view";
import { Resource, ResourceType } from "../../generated/client/src";

import CloseIcon from "@material-ui/icons/Close";
import DeleteIcon from "@material-ui/icons/DeleteForever";
import FileUploader from "../generic/FileUploader";
import { getAllowedFileTypes } from "../../commons/resourceTypeHelper";
import ReactPlayer from "react-player";
import theme from "../../styles/theme";
import strings from "../../localization/strings";

/**
 * Component props
 */
interface Props extends WithStyles<typeof styles> {
  imagePath: string;
  resource: Resource;
  uploadKey: string;
  uploadButtonText: string;
  allowSetUrl: boolean;
  onSave(files: File[], callback: (progress: number) => void, key?: string): void;
  onSetUrl(url: string, key?: string): void;
  onDelete(key?: string): void;
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
      onSave,
      uploadKey,
      classes,
      onSetUrl,
      allowSetUrl,
      uploadButtonText
    } = this.props;
    const allowedFileTypes = getAllowedFileTypes(resource.type);
    const video = resource.type === ResourceType.VIDEO;
    let previewContent = (
      <div className={ classes.noMediaContainer }>
        <h2>{ strings.noMediaPlaceholder }</h2>
      </div>
    );
    if (imagePath) {
      previewContent = video ?
        <ReactPlayer url={ imagePath } controls={ true } style={{ backgroundColor: "#000" }} /> :
        <img src={ imagePath } alt="File" height="200" className={ classes.imagePreview }/>;
    }
    return (
      <div className={ classes.imagePreviewElement }>
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
          uploadButtonText={ uploadButtonText }
          allowSetUrl={ allowSetUrl }
          allowedFileTypes={ allowedFileTypes }
          onSave={ onSave }
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

    return (
      <Dialog fullScreen open={ this.state.dialogOpen } onClose={ this.closeDialog }>
        <AppBar>
          <Toolbar>
            <IconButton edge="end" color="inherit" onClick={ this.closeDialog } aria-label="close">
              <CloseIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        <div className={ classes.imagePreviewFullscreenContainer }>
          <img src={ imagePath } alt="File" />
        </div>
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
