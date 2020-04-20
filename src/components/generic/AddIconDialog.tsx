import * as React from "react";
import { withStyles, WithStyles, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Divider, Grid, Typography } from "@material-ui/core";
import styles from "../../styles/dialog";
import strings from "../../localization/strings";
import { Resource } from "../../generated/client/src";
import FileUploader from "./FileUploader";

import slugify from "slugify";
/**
 * Component props
 */
interface Props extends WithStyles<typeof styles> {
  /**
   * Dialog open state
   */

  open: boolean;
  /**
   * Current resources under root resource
   */
  resource: Resource;

  /**
   * Save button click
   */
  onSave(files: File[], key?: string): Promise<number>;

  /**
   * Toggle add icon dialog
   */
  onToggle(): void;
}

/**
 * Component state
 */
interface State {
  iconName?: string;
  newFiles?: File[];
  propertyName?: string;
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
    };
  }

  /**
   * Component render method
   */
  public render() {
    const { classes } = this.props;

    return (
      <Dialog
        fullScreen={ false }
        open={ this.props.open }
        onClose={ this.props.onToggle }
        aria-labelledby="dialog-title"
      >
        <DialogTitle id="dialog-title">
          <div>
            <Typography variant="h2">{ strings.applicationSettings.addIcon }</Typography>
          </div>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Grid container spacing={ 2 }>
            <Grid item className={ classes.fullWidth }>
              <TextField
                multiline
                fullWidth
                type="text"
                value={ this.state.iconName || "" }
                onChange={ this.handleNameChange }
                variant="outlined"
              />
            </Grid>
            <Grid item className={ classes.fullWidth }>
              <FileUploader
                resource={ this.props.resource }
                allowedFileTypes={ [] }
                onSave={ this.onPropertyFileChange }
                uploadKey={ "applicationIcon_" }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <Divider />
        <DialogActions>
          <Button variant="outlined" onClick={ this.handleCancel } color="primary">
            { strings.cancel }
          </Button>
          <Button variant="contained" color="primary" autoFocus onClick={ this.handleSave } disabled={ !this.state.newFiles }>
            { strings.save }
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  /**
   * Handle cancel click
   */
  private handleCancel = () => {
    this.setState({
      iconName: "",
      newFiles: [],
      propertyName: ""
    });
    this.props.onToggle();
  }

  /**
   * Handle save click
   */
  private handleSave = () => {
    const { newFiles, propertyName } = this.state;
    if (!newFiles) {
      return;
    }
    this.props.onSave(newFiles, propertyName);
  }

  /**
   * Handle name change
   * @param event change event
   */
  private handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      iconName : event.target.value
    });
  }

  /**
   * Handle file change
   */
  private onPropertyFileChange = async (files: File[], key: string) => {
    let resourceKey = key.toString();
    resourceKey = resourceKey + this.state.iconName;
    resourceKey = slugify(resourceKey, {
      replacement: "",
      remove: /[^A-Za-z0-9_]+/g,
    });

    this.setState({
      newFiles: files,
      propertyName: resourceKey
    });
    return 200;
  };
}

export default withStyles(styles)(AddIconDialog);
