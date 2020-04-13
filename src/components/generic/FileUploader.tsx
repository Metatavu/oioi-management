import * as React from "react";
import { withStyles, WithStyles, Button } from "@material-ui/core";
import styles from "../../styles/dialog";
import { DropzoneDialog } from 'material-ui-dropzone';
import { Resource } from "../../generated/client/src";
import strings from "../../localization/strings";
import AddIcon from '@material-ui/icons/AddOutlined';
import { resolveUploadLocalizationString } from "../../commons/resourceTypeHelper";

interface Props extends WithStyles<typeof styles> {
  resource: Resource;
  allowedFileTypes: string[];
  onSave(files: File[]): Promise<Number>;
}

interface State {
  dialogOpen: boolean;
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
      dialogOpen: false
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
    const { resource } = this.props;
    let localStrings = resolveUploadLocalizationString(resource.type);
    if (!localStrings.fileUploadLocal) {
      localStrings.fileUploadLocal = [strings.fileUpload.addFile, strings.fileUpload.changeFile];
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
   * Handle save/upload. Await for response from FileUpload.uploadFile before closing dialog
   * TODO: Add some kind of progress indicator
   */
  private handleSave = async (files: File[]) => {
    await this.props.onSave(files)
    this.closeDialog()
  }
}

export default withStyles(styles)(FileUploader);
