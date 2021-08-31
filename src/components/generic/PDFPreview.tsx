import * as React from "react";
import { withStyles, WithStyles, Box, Button, Link } from "@material-ui/core";
import styles from "../../styles/generic/pdf-preview";
import { Resource } from "../../generated/client/src";
import FileUploader from "./FileUploader";
import strings from "../../localization/strings";
import PDFIcon from "@material-ui/icons/PictureAsPdfRounded";

/**
 * Component props
 */
interface Props extends WithStyles<typeof styles> {
  path: string;
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
}

/**
 * PDF file uploader UI component
 */
class PDFPreview extends React.Component<Props, State> {
  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
    };
  }

  /**
   * Component render method
   */
  public render = () => {
    const {
      path,
      onUpload,
      uploadKey,
      classes,
      onSetUrl,
      allowSetUrl,
      uploadButtonText,
      uploadDialogTitle
    } = this.props;

    let filename = path.split("/").pop();

    return (
      <Box className={ classes.previewElement }>
        { path &&
          <Box className={ classes.fileContainer }>
            <Box mr={ 1 }>
              <PDFIcon />
            </Box>
            <Link
              variant="h4"
              href={ path }
              target="_blank"
            >
              { filename }
            </Link>
            <Box ml={ 2 } mr={ 2 }>
              <Button
                variant="contained"
                color="secondary"
                onClick={ () => this.props.onDelete(uploadKey) }>
                { strings.delete }
              </Button>
            </Box>
          </Box>
        }
        <FileUploader
          title={ uploadDialogTitle }
          uploadButtonText={ uploadButtonText }
          allowSetUrl={ allowSetUrl }
          allowedFileTypes={ ["application/pdf"] }
          onUpload={ onUpload }
          onSetUrl={ onSetUrl }
          uploadKey={ uploadKey }
        />
      </Box>
    );
  }
}

export default withStyles(styles)(PDFPreview);