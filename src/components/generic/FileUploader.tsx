import * as React from "react";
import { withStyles, WithStyles, Button, CircularProgress } from "@material-ui/core";
import styles from "../../styles/dialog";
import { DropzoneDialog } from 'material-ui-dropzone';
import { Resource } from "../../generated/client/src";
import strings from "../../localization/strings";
import AddIcon from '@material-ui/icons/AddOutlined';
import { resolveUploadLocalizationString } from "../../commons/resourceTypeHelper";

interface Props extends WithStyles<typeof styles> {
  uploadKey?: string;
  resource: Resource;
  allowedFileTypes: string[];
  onSave(files: File[], key?: string): Promise<number>;
}

interface State {
  dialogOpen: boolean;
  uploading: boolean;
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
      uploading: false
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
    const { resource, classes } = this.props;
    let localStrings = resolveUploadLocalizationString(resource.type);
    if (!localStrings.fileUploadLocal) {
      localStrings.fileUploadLocal = [strings.fileUpload.addFile, strings.fileUpload.changeFile];
    }
    if (this.state.uploading) {
      return (
        <div style={{ display: "flex", height: "1vh", justifyContent: "center" }}>
          <CircularProgress color="secondary" style={{ alignSelf: "center" }}></CircularProgress>
        </div>
      )
    }
    /**
     * TODO: Add custom icons to resolveLocalizationString
     */
    return<>
      <Button startIcon={ <AddIcon /> } variant="outlined" color="secondary" onClick={() => this.openDialog() }>
        { !resource.data ? localStrings.fileUploadLocal[0] : localStrings.fileUploadLocal[1]}
      </Button>

      { this.renderUploadDialog() }
    </>
  }

  /**
   * Render upload dialog
   */
  private renderUploadDialog = () => {
    const { allowedFileTypes, resource } = this.props;

    return (
      <DropzoneDialog
        key={ resource.id }
        acceptedFiles={ allowedFileTypes }
        open={ this.state.dialogOpen }
        onClose={ this.closeDialog }
        onSave={ this.handleSave }
        cancelButtonText={ strings.fileUpload.cancel }
        submitButtonText={ strings.fileUpload.upload }
        filesLimit={ 1 }
        maxFileSize={ 20000000 }
        showPreviewsInDropzone={ false }
      />
    )
  }

  /**
   * Open upload image dialog
   */
  private openDialog = () => {
    this.setState({
      dialogOpen: true
    })
  }

    /**
   * Close upload image dialog
   */
  private closeDialog = () => {
    this.setState({
      dialogOpen: false
    })
  }

  /**
   * Handle save/upload
   * TODO: Add some kind of progress indicator
   */
  private handleSave = async (files: File[]) => {
    this.setState({ uploading: true })
    this.closeDialog()
    await this.props.onSave(files, this.props.uploadKey)
    this.setState({ uploading: false })
  }
}

export default withStyles(styles)(FileUploader);
