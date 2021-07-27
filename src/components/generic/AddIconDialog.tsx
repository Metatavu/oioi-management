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
  onSave(files: File[], key?: string): void;

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
  customInput: boolean;
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
      customInput: false
    };
  }

  componentDidMount() {
    this.setState({iconName: "icon_"});
  }

  componentDidUpdate = (prevProps: Props) => {
    if (!prevProps.open && this.props.open) {
      this.setState({iconName: "icon_"});
    }
  }

  /**
   * Component render method
   */
  public render() {
    const { classes } = this.props;
    const selectItems = this.getSelectItems();
    return (
      <Dialog
        fullScreen={ false }
        open={ this.props.open }
        onClose={ this.props.onToggle }
        aria-labelledby="dialog-title"
      >
        <DialogTitle id="dialog-title">
          <div>
            <Typography variant="h4">{ strings.applicationSettings.addIcon }</Typography>
          </div>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Grid container spacing={ 2 }>
            <Grid item className={ classes.fullWidth }>
              <Typography variant="h4">{ strings.applicationSettings.addIconSelect }</Typography>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                onChange={ this.handleNameChange }
                name="iconSelect"
              >
                { selectItems }
              </Select>
              <Divider style={ { marginTop: theme.spacing(3), marginBottom: theme.spacing(3) }} />

              <Typography variant="h4">{ strings.applicationSettings.addIconTextField }</Typography>
              <TextField
                multiline
                fullWidth
                type="text"
                value={ this.state.iconName || "" }
                onChange={ this.handleNameChange }
                variant="outlined"
              />
              {(!this.state.iconName || !this.state.iconName.startsWith("icon_")) && (
                <Alert style={{marginTop: "10px"}} severity="warning"> {strings.iconNameIncorrectWarning} </Alert>
              )}
            </Grid>
            <Grid item className={ classes.fullWidth }>
              <FileUploader
                allowSetUrl={false}
                resource={ this.props.resource }
                allowedFileTypes={ [] }
                onSave={ this.onPropertyFileChange }
                onSetUrl={() => {}}
                uploadKey={ this.state.customInput ? "icon_" : ""}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <Divider />
        <DialogActions>
          <Button variant="outlined" onClick={ this.clearAndClose } color="primary">
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
   * Generate select items
   */
  private getSelectItems = () => {
    const keys = Object.values(IconKeys);
    return keys.map(key => {
      return <MenuItem key={ key } value={ key }>{ key }</MenuItem>;
    });
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
   * Handle save click
   */
  private handleSave = () => {
    const { newFiles, propertyName } = this.state;
    if (!newFiles) {
      return;
    }
    this.props.onSave(newFiles, propertyName);
    this.clearAndClose();
  }

  /**
   * Handle name change
   * @param event change event
   */
  private handleNameChange = (event: ChangeEvent<{ name?: string | undefined; value: unknown; }>) => {
    const stringValue = event.target.value as string;
    const isCustomInput = (!event.target.name);
    this.setState({
      customInput: isCustomInput,
      iconName : stringValue
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
  };
}

export default withStyles(styles)(AddIconDialog);
