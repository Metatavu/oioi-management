import * as React from "react";
import { withStyles, WithStyles, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Divider, Grid, Typography, Select, MenuItem, InputLabel } from "@material-ui/core";
import styles from "../../styles/dialog";
import strings from "../../localization/strings";
import { Resource, ResourceFromJSON, ResourceType } from "../../generated/client/src";

interface Props extends WithStyles<typeof styles> {
  /**
   * Dialog open state
   */
  open: boolean
  /**
 * Parent resource id
 */
  parentResourceId: string
  /**
   * Save button click
   */
  onSave(resource: Resource): void
  /**
   * Close handler
   */
  handleClose(): void
}

interface State {
  resourceData: any
}

class AddResourceDialog extends React.Component<Props, State> {

  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      resourceData: {}
    };

    this.onSelectChange = this.onSelectChange.bind(this);
    this.onDataChange = this.onDataChange.bind(this);
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
        onClose={ this.props.handleClose }
        aria-labelledby="dialog-title"
      >
        <DialogTitle id="dialog-title">
          <Typography variant="h2">{ strings.addNewResource }</Typography>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Grid container spacing={ 2 }>
            <Grid item className={ classes.fullWidth }>
              <TextField
                fullWidth
                variant="outlined"
                value={ this.state.resourceData["name"] }
                onChange={ this.onDataChange }
                name="name"
                label={ strings.name }
              />
            </Grid>
            <Grid item className={ classes.fullWidth }>
              <InputLabel htmlFor="resourceType">{ strings.resourceType }</InputLabel>
              <Select
                fullWidth
                variant="outlined"
                value={ this.state.resourceData["type"] || "" }
                inputProps={{
                  id: "resourceType"
                }}
                onChange={ this.onSelectChange }
                name="type"
              >
                <MenuItem value={ ResourceType.INTRO }>{ strings.intro }</MenuItem>
                <MenuItem value={ ResourceType.LANGUAGE }>{ strings.language }</MenuItem>
                <MenuItem value={ ResourceType.MENU }>{ strings.menu }</MenuItem>
                <MenuItem value={ ResourceType.SLIDESHOW }>{ strings.slideshow }</MenuItem>
                <MenuItem value={ ResourceType.PAGE }>{ strings.page }</MenuItem>
                <MenuItem value={ ResourceType.PDF }>{ strings.pdf }</MenuItem>
                <MenuItem value={ ResourceType.IMAGE }>{ strings.image }</MenuItem>
                <MenuItem value={ ResourceType.TEXT }>{ strings.text }</MenuItem>
                <MenuItem value={ ResourceType.VIDEO }>{ strings.video }</MenuItem>
              </Select>
            </Grid>
            <Grid item className={ classes.fullWidth }>
              <TextField
                fullWidth
                variant="outlined"
                value={ this.state.resourceData["orderNumber"] }
                onChange={ this.onDataChange }
                name="orderNumber"
                label={ strings.orderNumber }
              />
            </Grid>
            <Grid item className={ classes.fullWidth }>
              <TextField
                fullWidth
                variant="outlined"
                value={ this.state.resourceData["slug"] }
                onChange={ this.onDataChange }
                name="slug"
                label={ strings.slug }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <Divider />
        <DialogActions>
          <Button variant="outlined" onClick={ this.props.handleClose } color="primary">
            { strings.cancel }
          </Button>
          <Button variant="contained" onClick={ this.onSaveNewResource } color="primary" autoFocus>
            { strings.save }
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  /**
   * Handles save button click
   */
  private onSaveNewResource = () => {
    const { onSave } = this.props;
    const { resourceData } = this.state;
    resourceData["parentId"] = this.props.parentResourceId;
    const resource = ResourceFromJSON(resourceData);
    onSave(resource);
  }

  /**
   * Handles select element data change
   */
  private onSelectChange = (e: React.ChangeEvent<{ name?: string, value: unknown }>, child: React.ReactNode) => {
    if (!e.target.name) {
      return;
    }

    const { resourceData } = this.state;
    resourceData[e.target.name] = e.target.value;

    this.setState({
      resourceData: resourceData
    });
  }

  /**
   * Handles input element data change
   */
  private onDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { resourceData } = this.state;
    resourceData[e.target.name] = e.target.value;

    this.setState({
      resourceData: resourceData
    });
  }
}

export default withStyles(styles)(AddResourceDialog);