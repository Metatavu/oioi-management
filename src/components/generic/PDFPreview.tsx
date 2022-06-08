import * as React from "react";
import { withStyles, WithStyles, Box, Button, Link } from "@material-ui/core";
import styles from "../../styles/generic/pdf-preview";
import FileUploader from "./FileUploader";
import strings from "../../localization/strings";
import PDFIcon from "@material-ui/icons/PictureAsPdfRounded";

/**
 * Component props
 */
interface Props extends WithStyles<typeof styles> {
  path: string;
  uploadKey: string;
  uploadButtonText: string;
  allowSetUrl: boolean;
  onUpload(newUri: string, key?: string): void;
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
      allowSetUrl,
      uploadButtonText,
      uploadDialogTitle
    } = this.props;

    const filename = path.split("/").pop();

    return (
      <Box className={ classes.previewElement }>
        <Box className={ classes.fileContainer }>
          { path &&
            <>
              <Box mr={ 1 }>
                <PDFIcon/>
              </Box>
              <Link
                variant="h4"
                href={ path }
                target="_blank"
              >
                { filename }
              </Link>
            </>
          }
          <Box ml={ 2 } mr={ 2 }>
            <FileUploader
              title={ uploadDialogTitle }
              uploadButtonText={ uploadButtonText }
              allowSetUrl={ allowSetUrl }
              allowedFileTypes={ ["application/pdf"] }
              onUpload={ onUpload }
              uploadKey={ uploadKey }
            />
          </Box>
        </Box>
        { path && 
          <Button
            variant="contained"
            color="secondary"
            onClick={ () => this.props.onDelete(uploadKey) }>
            { strings.delete }
          </Button>
        }
      </Box>
    );
  }
}

export default withStyles(styles)(PDFPreview);