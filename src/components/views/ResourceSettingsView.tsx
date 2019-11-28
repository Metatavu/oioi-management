import * as React from "react";
import { withStyles, WithStyles, TextField, Divider, Typography, Grid, FormControl, InputLabel, Select, MenuItem, Button } from "@material-ui/core";
import DeleteIcon from '@material-ui/icons/Delete';
import SaveIcon from '@material-ui/icons/Save';
import styles from "../../styles/editor-view";
import { DropzoneArea } from "material-ui-dropzone";
import strings from "../../localization/strings";
import theme from "../../styles/theme";
import { Resource, ResourceToJSON } from "../../generated/client/src";

interface Props extends WithStyles<typeof styles> {
  resource: Resource
}

interface State {
  resourceData: any
}

class ResourceSettingsView extends React.Component<Props, State> {

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
  }

  static getDerivedStateFromProps(props: Props, state: State) {
    return {
      resourceData: ResourceToJSON(props.resource)
    };
  }

  /**
   * Component render method
   */
  public render() {
    const { classes } = this.props;

    return (
      <div>
        <TextField
          style={{ marginBottom: theme.spacing(3) }}
          variant="outlined"
          value={ this.state.resourceData["name"] }
          onChange={ this.onDataChange }
          name="name"
          label={ strings.name }
        />
        <Button
          style={{ marginLeft: theme.spacing(3) }}
          color="primary"
          variant="contained"
          startIcon={ <SaveIcon /> }
        >
          { strings.saveResource }
        </Button>
        <Button
          style={{ marginLeft: theme.spacing(3) }}
          color="primary"
          variant="contained"
          startIcon={ <DeleteIcon /> }
        >
          { strings.deleteResource }
        </Button>
        <Divider style={{ marginBottom: theme.spacing(3) }} />
        <div>
          <Typography variant="h3">{ strings.mainNavigationIcons }</Typography>
          <Grid direction="row" style={{ marginTop: theme.spacing(3) }} container spacing={ 3 }>
            <Grid item>
              <Grid container>
                <Typography variant="subtitle1">{ strings.home }</Typography>
              </Grid>
              <Grid container spacing={ 3 }>
                <Grid item>
                  <Typography variant="body1">{ strings.normal }</Typography>
                  <DropzoneArea
                    dropzoneClass={ classes.dropzone }
                    dropzoneParagraphClass={ classes.dropzoneText }
                    dropzoneText={ strings.dropFile }
                  />
                </Grid>
                <Grid item>
                  <Typography variant="body1">{ strings.active }</Typography>
                  <DropzoneArea
                    dropzoneClass={ classes.dropzone }
                    dropzoneParagraphClass={ classes.dropzoneText }
                    dropzoneText={ strings.dropFile }
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item>
              <Grid container>
                <Typography variant="subtitle1">{ strings.back }</Typography>
              </Grid>
              <Grid container spacing={ 3 }>
                <Grid item>
                  <Typography variant="body1">{ strings.normal }</Typography>
                  <DropzoneArea
                    dropzoneClass={ classes.dropzone }
                    dropzoneParagraphClass={ classes.dropzoneText }
                    dropzoneText={ strings.dropFile }
                  />
                </Grid>
                <Grid item>
                  <Typography variant="body1">{ strings.active }</Typography>
                  <DropzoneArea
                    dropzoneClass={ classes.dropzone }
                    dropzoneParagraphClass={ classes.dropzoneText }
                    dropzoneText={ strings.dropFile }
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </div>
      </div>
    );
  }

  /**
   * Handles data change
   */
  private onDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { resourceData } = this.state;
    resourceData[e.target.name] = e.target.value;
    this.setState({
      resourceData: resourceData
    });
  }

  private deleteResource = () => {
    
  }
}

export default withStyles(styles)(ResourceSettingsView);