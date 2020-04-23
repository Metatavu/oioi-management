import * as React from "react";
import { Dialog, AppBar, Toolbar, IconButton, withStyles, WithStyles, Typography, Grid } from "@material-ui/core";
import styles from "../../styles/editor-view";
import strings from "../../localization/strings";
import theme from "../../styles/theme";
import { Resource, ResourceType } from "../../generated/client/src";

import CloseIcon from '@material-ui/icons/Close';
import ClearIcon from "@material-ui/icons/Clear";
import FileUploader from "../generic/FileUploader";
import { getAllowedFileTypes } from "../../commons/resourceTypeHelper";
import ReactPlayer from 'react-player'

/**
 * Component props
 */
interface Props extends WithStyles<typeof styles> {
  imagePath: string;
  resource: Resource;
  uploadKey: string;

  /**
   * Save given files to parent component with key
   * @param files files to save
   * @param key property key
   */
  onSave(files: File[], key?: string): void;

  /**
   * Delete given property from parent component
   * @param key property to remove
   */
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
  public render() {
    const { imagePath, resource, onSave, uploadKey } = this.props;
    const allowedFileTypes = getAllowedFileTypes(resource.type);
    const displayName = this.trimKeyPrefix(uploadKey);
    const video = resource.type === ResourceType.VIDEO;
    return (
      <>
        <div style={{ marginTop: theme.spacing(2) }}>
          { this.isIcon(uploadKey) && 
            <Typography variant="h5">{ displayName }</Typography>
          }
          <Grid container>
            <Grid item key={ imagePath } onClick={ this.toggleDialog }>
              { video ?
                <ReactPlayer url={ imagePath } controls={ true }/> :
                <img src={ imagePath } alt="File" height="200" style={{ backgroundColor: "rgba(38, 50, 56, 0.1)" }}/>
              }
            </Grid>
            <Grid item>
              <IconButton onClick={ () => this.props.onDelete(uploadKey) }>
                <ClearIcon color="primary"></ClearIcon>
              </IconButton>
            </Grid>
          </Grid>
        </div>
        <FileUploader
          resource={ resource }
          allowedFileTypes={ allowedFileTypes }
          onSave={ onSave }
          uploadKey={ uploadKey }
        />

        { this.state.dialogOpen &&
          this.renderDialog()
        }
      </>
    );
  }

  /**
   * Render preview dialog
   */
  private renderDialog = () => {
    const { imagePath } = this.props;

    return (
      <Dialog fullScreen open={ this.state.dialogOpen } onClose={ this.closeDialog }>
        <AppBar>
          <Toolbar>
            <IconButton edge="end" color="inherit" onClick={ this.closeDialog } aria-label="close">
              <CloseIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        <div style={ { display: "flex", alignItems: "center", justifyContent: "center", height: "100%" } }>
          <img src={ imagePath } alt="File" style={{ maxHeight: "100%", maxWidth: "100%", paddingTop: "5%", paddingBottom: "2%" }} />
        </div>
      </Dialog>
    );
  }

  /**
   * Toggle dialog
   */
  private toggleDialog = () => {
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
   * If preview item is application icon (contains prefix applicationIcon_)
   * split the property name and return the trimmed name
   */
  private trimKeyPrefix = (key: string): string => {
    const splitKey = key.split("_");
    return splitKey[splitKey.length - 1];
  }
}

export default withStyles(styles)(ImagePreview);
