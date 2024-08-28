import { AppBar, Box, Checkbox, Dialog, FormControlLabel, IconButton, TextField, Toolbar, Typography, withStyles, WithStyles } from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import AudioPlayer from "material-ui-audio-player";
import * as React from "react";
import ReactPlayer from "react-player";
import { getAllowedFileTypes } from "../../commons/resourceTypeHelper";
import { Resource, ResourceType } from "../../generated/client";
import strings from "../../localization/strings";
import styles from "../../styles/editor-view";
import theme from "../../styles/theme";
import FileUploader from "./FileUploader";
import DeleteIcon from "@material-ui/icons/DeleteForever";
import { ResourceSettingsForm } from "commons/formRules";
import { ResourceUtils } from "utils/resource";

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
  showDeleteButton?: boolean;
  handleVideoPropertiesChange?: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onVideoPropertiesChange?: (childResource: Resource) => void;
}

/**
 * Component state
 */
interface State {
  open: boolean;
  resourceData: Resource;
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
      open: false,
      resourceData: props.resource,
    };
  }

  /**
   * Event handler for loop checkbox change
   *
   * @param event change event
   * @param resource resource
   * @param key key
   */
  private onHandleCheckBoxChange = (event: React.ChangeEvent<HTMLInputElement>, resource: Resource, key: keyof ResourceSettingsForm) => {
    const updatedResourceData = ResourceUtils.updatePropertyList(resource, key, String(event.target.checked));
    if(!updatedResourceData) {
      return;
    }

    this.setState({
      resourceData: updatedResourceData,
    });
    // Handles save at the resource screen
    this.props.handleVideoPropertiesChange && this.props.handleVideoPropertiesChange(event);
    // Handles save at the page settings screen
    this.props.onVideoPropertiesChange && this.props.onVideoPropertiesChange(updatedResourceData);
  };

  /**
   * Event handler for volume change
   *
   * @param event change event
   * @param resource resource
   * @param key key
   */
  private onHandleVolumeChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, resource: Resource, key: keyof ResourceSettingsForm) => {
    let value = parseFloat(event.target.value);

    if (value > 2) {
      value = 2;
    }

    const updatedResourceData = ResourceUtils.updatePropertyList(resource, key, String(value || 0));
    if(!updatedResourceData) {
      return;
    }

    this.setState({
      resourceData: updatedResourceData,
    });
    // Handles save at the resource screen
    this.props.handleVideoPropertiesChange && this.props.handleVideoPropertiesChange(event);
    // Handles save at the page settings screen
    this.props.onVideoPropertiesChange && this.props.onVideoPropertiesChange(updatedResourceData);
  };

  /**
   * Renders delete button
   */
  private renderDeleteButton = () => {
    const {
      classes,
      uploadKey,
      onDelete,
      showDeleteButton,
      resourcePath
    } = this.props;

    if (!showDeleteButton || !resourcePath) {
      return null;
    }

    return (
      <div className={ classes.deleteImage }>
        <IconButton
          size="small"
          color="secondary"
          className={ classes.iconButton }
          title={ strings.delete }
          onClick={ () => onDelete(uploadKey) }
        >
          <DeleteIcon />
        </IconButton>
      </div>
    );
  }

  /**
   * Component render method
   */
  public render = () => {
    const { resourcePath, resource, classes } = this.props;
    const { resourceData } = this.state;

    if (resourceData.type === ResourceType.VIDEO) {
      const loopValue = resourceData.properties?.find(prop => prop.key === "loop")?.value === "true" ? true : false;
      // TODO: Currently volume can be set between 0-2 but preview player has max volume at 1 (100%)
      const volumeValue = resourceData.properties?.find(prop => prop.key === "volume")?.value ?? "1";

      return (
        <div className={ classes.videoPreviewElement }>
          <div style={{ marginBottom: theme.spacing(1) }}>
            <div key={ resourcePath } className={ classes.previewContainer }>
              { this.renderPreviewContent(loopValue, volumeValue) }
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            { this.renderVideoSettings(resourceData, loopValue, volumeValue) }
          </div>
          { this.renderFileUploader() }
        </div>
      );
    }

    if (resource.type === ResourceType.AUDIO) {
      return (
        <div key={ resourcePath } className={ classes.audioPreviewElement }>
          <Box>
            { this.renderPreviewContent() }
          </Box>
          <Box style={{ marginTop: theme.spacing(2) }}>
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
        { this.renderDeleteButton() }
        { this.renderFileUploader() }
        { this.renderDialog() }
      </div>
    );
  }

  /**
   * Renders preview content
   */
  private renderPreviewContent = (loop?: boolean, volume?: string) => {
    const { classes, resource, resourcePath, imgHeight } = this.props;

    const parsedVolume = parseFloat(volume || "1");
    const cappedVolume = parsedVolume > 1 ? 1 : parsedVolume;

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
          loop={ loop }
          volume={ cappedVolume }
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
   * Renders video settings- loop and volume controls
   *
   * @param resourceData Resource
   * @param loopValue boolean
   * @param volumeValue string
   */
  private renderVideoSettings = (resourceData: Resource, loopValue?: boolean, volumeValue?: string) => {
    if (!this.props.resourcePath) return null;

    return (
      <>
        <FormControlLabel
          label={strings.videoSettings.loopVideo}
          control={
            <Checkbox
              name="loop"
              checked={ loopValue }
              value={ loopValue }
              onChange={ e => this.onHandleCheckBoxChange(e, resourceData, "loop") }
            />
          }
        />
        <FormControlLabel
          label={strings.videoSettings.videoVolume}
          control={
            <TextField
              name="volume"
              value={ volumeValue }
              type="number"
              onChange={ e => this.onHandleVolumeChange(e, resourceData, "volume") }
              inputProps={{
                min: 0,
                max: 2,
                step: 0.1,
              }}
              style={{ marginLeft: "0.7rem", marginRight: "0.5rem", marginBottom: "1rem" }}
              variant="outlined"
              size="small"
            />
          }
        />
      </>
    )
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