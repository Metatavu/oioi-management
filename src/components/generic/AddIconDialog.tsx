import * as React from "react";
import { withStyles, WithStyles, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Divider, Grid, Typography, Select, MenuItem } from "@material-ui/core";
import styles from "../../styles/dialog";
import strings from "../../localization/strings";
import { Resource } from "../../generated/client/src";
import FileUploader from "./FileUploader";
import theme from "../../styles/theme";
import slugify from "slugify";
import { IconKeys } from "../../commons/iconTypeHelper";
import { ChangeEvent } from "react";
import { Alert } from "@material-ui/lab";
/**
 * Component props
 */
interface Props extends WithStyles<typeof styles> {
  open: boolean;
  resource: Resource;
  onSave: (files: File[], callback: (progress: number) => void, key: string) => void;
  onToggle(): void;
}

/**
 * Component state
 */
interface State {
  iconName: string;
  newFiles?: File[];
  propertyName?: string;
  customInput: boolean;
  progress?: number;
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
    const { iconName, newFiles } = this.state;

    return (
      <Dialog
        fullScreen={ false }
        open={ open }
        onClose={ onToggle }
      >
        <DialogTitle>
          <div>
            <Typography variant="h4">
              { strings.applicationSettings.addIcon }
            </Typography>
          </div>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Grid container spacing={ 2 }>
            <Grid item className={ classes.fullWidth }>
              <Typography variant="h4">
                { strings.applicationSettings.addIconSelect }
              </Typography>
              <Select
                onChange={ this.handleNameChange }
                value={ this.getSelectValue() }
              >
                { this.getSelectItems() }
              </Select>
              <Divider style={{ margin: `${theme.spacing(3)}px 0` }}/>
              <Typography variant="h4">
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
              <Alert
                severity="warning"
                style={{ marginTop: "10px" }}
              >
                { strings.iconNamePrefixNotice }
              </Alert>
            </Grid>
            <Grid item className={ classes.fullWidth }>
              <FileUploader
                uploadButtonText={ strings.fileUpload.addImage }
                allowedFileTypes={ [] }
                onSave={ newFiles => this.setState({ newFiles }) }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <Divider />
        <DialogActions>
          <Button
            variant="outlined"
            onClick={ this.clearAndClose }
            color="primary"
          >
            { strings.cancel }
          </Button>
          <Button
            variant="contained"
            color="primary"
            autoFocus
            onClick={ this.handleSave }
            disabled={ !newFiles || !iconName }
          >
            { strings.save }
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  /**
   * Generate select items
   */
  private getSelectItems = () => {
    return Object.values(IconKeys)
      .map(key => key.replace("icon_", ""))
      .map(key => <MenuItem key={ key } value={ key }>{ key }</MenuItem>);
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
      newFiles: [],
      propertyName: ""
    });

    this.props.onToggle();
  }

  /**
   * Callback function that Updates file upload progress
   *
   * @param progress upload progress
   */
  private updateProgress = (progress: number) => {
    this.setState({ progress: Math.floor(progress) });

    if (progress < 100) {
      return;
    }

    this.clearAndClose();
  }

  /**
   * Handle save click
   */
  private handleSave = () => {
    const { newFiles, iconName } = this.state;

    if (!newFiles) {
      return;
    }

    const propertyName = slugify(`icon_${iconName}`, {
      replacement: "",
      remove: /[^A-Za-z0-9_]+/g,
    });

    this.props.onSave(newFiles, this.updateProgress, propertyName);
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
