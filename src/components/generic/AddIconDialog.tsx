import * as React from "react";
import { withStyles, WithStyles, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Divider, Grid, Typography, Select, MenuItem, Box, IconButton, LinearProgress } from "@material-ui/core";
import styles from "../../styles/dialog";
import strings from "../../localization/strings";
import { Resource } from "../../generated/client/src";
import FileUploader from "./FileUploader";
import theme from "../../styles/theme";
import slugify from "slugify";
import { getLocalizedIconTypeString, IconKeys } from "../../commons/iconTypeHelper";
import { ChangeEvent } from "react";
import { Alert } from "@material-ui/lab";
import CloseIcon from "@material-ui/icons/Close";
import { DropzoneArea } from "material-ui-dropzone";
import FileUpload from "../../utils/file-upload";
import { AuthState, UploadData } from "../../types";
/**
 * Component props
 */
interface Props extends WithStyles<typeof styles> {
  auth: AuthState;
  open: boolean;
  resource: Resource;
  onSave: (newUri: string, key: string) => void;
  onToggle(): void;
}

/**
 * Component state
 */
interface State {
  iconName: string;
  propertyName?: string;
  customInput: boolean;
  imageUri?: string;
  progress?: number;
  uploadData?: UploadData;
}

/**
 * Creates Add resource dialog
 * @author Jari Nykänen
 */
class AddIconDialog extends React.Component<Props, State> {
  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);

    this.state = {
      iconName: "",
      customInput: false
    };
  }

  /**
   * Component did update life cycle handler
   *
   * @param prevProps previous props
   */
  public componentDidUpdate = (prevProps: Props) => {
    if (!prevProps.open && this.props.open) {
      this.setState({ iconName: "" });
    }
  }

  /**
   * Component render method
   */
  public render = () => {
    const { classes, open, onToggle } = this.props;
    const { iconName, imageUri } = this.state;

    return (
      <Dialog
        maxWidth="sm"
        open={ open }
        onClose={ onToggle }
        fullWidth
      >
        <DialogTitle disableTypography>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h4">
              { strings.applicationSettings.addIcon }
            </Typography>
            <IconButton
              size="small"
              onClick={ onToggle }
            >
              <CloseIcon color="primary" />
            </IconButton>
          </Box>
        </DialogTitle>
        <Box mb={ 3 }>
          <Divider />
        </Box>
        <DialogContent>
          <TextField
            fullWidth
            select
            variant="outlined"
            onChange={ this.handleNameChange }
            value={ this.getSelectValue() }
            label={ strings.applicationSettings.addIconSelect }
          >
            { this.getSelectItems() }
          </TextField>
          <Box mb={ 3 } mt={ 2 }>
            <Divider />
          </Box>
          <Typography variant="h5">
            { strings.applicationSettings.addIconTextField }
          </Typography>
          <TextField
            multiline
            fullWidth
            type="text"
            value={ iconName }
            onChange={ this.handleNameChange }
            variant="outlined"
          />
          <Box mt={ 1 } mb={ 3 }>
            <Alert severity="warning">
              { strings.iconNamePrefixNotice }
            </Alert>
          </Box>
          <Box display="flex" pt={ 2 }>
            <Box flex={ 1 }>
              <DropzoneArea
                clearOnUnmount
                dropzoneClass={ classes.dropzone }
                dropzoneParagraphClass={ classes.dropzoneText }
                dropzoneText={ strings.dropFile }
                showPreviews={ false }
                maxFileSize={ 314572800 }
                onDrop={ this.onImageChange }
                filesLimit={ 1 }
                showPreviewsInDropzone={ false }
              />
            </Box>
            <Box className={ classes.imagePreview }>
              { this.renderImagePreview() }
            </Box>
          </Box>
        </DialogContent>
        <Box mt={ 3 }>
          <Divider />
        </Box>
        <DialogActions>
          <Button
            variant="text"
            onClick={ this.clearAndClose }
            color="primary"
          >
            { strings.cancel }
          </Button>
          <Button
            variant="text"
            color="primary"
            autoFocus
            onClick={ this.handleSave }
            disabled={ !imageUri || !iconName }
          >
            { strings.save }
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  /**
   * Renders image preview
   */
  private renderImagePreview = () => {
    const { imageUri, progress } = this.state;

    if (progress) {
      return (
        <Box width="50%">
          <LinearProgress
            color="primary"
            variant="determinate"
            value={ progress }
          />
          <Box mt={ 1 } textAlign="center">
            <Typography>{ `${progress}%` }</Typography>
          </Box>
        </Box>
      );
    }

    if (!imageUri) {
      return (
        <Box
          height="100%"
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <Typography variant="h4">
            { strings.noMediaPlaceholder }
          </Typography>
        </Box>
      );
    }

    return (
      <img
        src={ imageUri }
        alt="previewImage"
        style={{ width: "100%" }}
      />
    );
  }

  /**
   * Handles image changes
   *
   * @param files list of files
   * @param callback file upload progress callback function
   */
  private onImageChange = async (files: File[]) => {
    const { auth } = this.props;

    if (!auth || !auth.token) {
      return;
    }

    const file = files[0];

    if (!file) {
      return;
    }

    try {
      const uploadData = await FileUpload.upload(auth.token, file, this.updateProgress);
      const { xhrRequest, uploadUrl, formData } = uploadData;
      this.setState({ uploadData: uploadData });
      xhrRequest.open("POST", uploadUrl, true);
      xhrRequest.send(formData);
    } catch (error) {
      this.context.setError(
        strings.formatString(strings.errorManagement.file.upload, file.name),
        error
      );
    }
  };

  /**
   * Callback function that Updates file upload progress
   *
   * @param progress upload progress
   */
  private updateProgress = (progress: number) => {
    const { uploadData } = this.state;
    this.setState({ progress: Math.floor(progress) });

    if (!uploadData || progress < 100) {
      return;
    }

    setTimeout(() => {
      this.setState({
        imageUri: `${uploadData.cdnBasePath}/${uploadData.key}`,
        progress: undefined
      });
    }, 3000);
  }

  /**
   * Generate select items
   */
  private getSelectItems = () => {
    return Object.values(IconKeys)
      .map(key => ({
        key: key.replace("icon_", ""),
        title: getLocalizedIconTypeString(key)
      }))
      .map(({ key, title }) => 
        <MenuItem key={ key } value={ key }>
          { title }
        </MenuItem>
      );
  }

  /**
   * Returns select value
   */
  private getSelectValue = () => {
    return Object.values(IconKeys)
      .map(key => key.replace("icon_", ""))
      .find(key => key === this.state.iconName) || "";
  }

  /**
   * Handle cancel click
   */
  private clearAndClose = () => {
    this.setState({
      iconName: "",
      imageUri: undefined,
      propertyName: ""
    });

    this.props.onToggle();
  }

  /**
   * Handle save click
   */
  private handleSave = () => {
    const { iconName, imageUri } = this.state;

    if (!imageUri) {
      return;
    }

    const propertyName = slugify(`icon_${iconName}`, {
      replacement: "",
      remove: /[^A-Za-z0-9_]+/g,
    });

    this.props.onSave(imageUri, propertyName);
    this.clearAndClose();
  }

  /**
   * Handle name change
   * @param event change event
   */
  private handleNameChange = (event: ChangeEvent<{ name?: string | undefined; value: unknown; }>) => {
    this.setState({ iconName: event.target.value as string });
  }
}

export default withStyles(styles)(AddIconDialog);
