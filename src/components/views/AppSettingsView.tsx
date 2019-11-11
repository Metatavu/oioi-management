import * as React from "react";
import { withStyles, WithStyles, TextField, Divider, Typography, Grid, FormControl, InputLabel, Select, MenuItem, Button } from "@material-ui/core";
import styles from "../../styles/editor-view";
import { DropzoneArea } from "material-ui-dropzone";
import strings from "../../localization/strings";
import theme from "../../styles/theme";
import AddIcon from "@material-ui/icons/AddCircle";

interface Props extends WithStyles<typeof styles> {

}

interface State {
  customerData: any
}

class AppSettingsView extends React.Component<Props, State> {

  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      customerData: {}
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
          value={this.state.customerData["name"]}
          onChange={this.onDataChange}
          name="name"
          label={ strings.name }
          />
          <Divider style={{ marginBottom: theme.spacing(3) }} />
          <Typography variant="h3">{ strings.languageVersions }</Typography>
          <div className={ classes.languageInputContainer }>
            <FormControl>
              <InputLabel id="select-label">{ strings.selectLanguage }</InputLabel>
              <Select
                color="primary"
                id="language-select"
                value="fi"
                >
                <MenuItem value={"fi"}>Suomi</MenuItem>
                <MenuItem value={"en"}>English</MenuItem>
              </Select>
            </FormControl>
            <Button
              style={{ marginLeft: theme.spacing(3)}}
              color="primary"
              variant="contained"
              startIcon={<AddIcon />}
            >
              {
                strings.addLanguage
              }
            </Button>
          </div>
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
    const { customerData } = this.state;
    customerData[e.target.name] = e.target.value;
    this.setState({
      customerData: customerData
    });
  }
}

export default withStyles(styles)(AppSettingsView);