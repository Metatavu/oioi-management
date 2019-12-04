import * as React from "react";
import { withStyles, WithStyles, TextField, Button } from "@material-ui/core";
import styles from "../../styles/editor-view";
import strings from "../../localization/strings";
import theme from "../../styles/theme";
import SaveIcon from '@material-ui/icons/Save';
import { Application, ApplicationToJSON, ApplicationFromJSON } from "../../generated/client/src";

interface Props extends WithStyles<typeof styles> {
  application: Application,
  onUpdate: (application: Application) => void
}

interface State {
  applicationData: any
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
      applicationData: {}
    };
  }

  public componentDidMount() {
    const { application } = this.props;
    this.setState({
      applicationData: ApplicationToJSON(application)
    });
  }

  /**
   * Component render method
   */
  public render() {
    return (
      <div>
        <TextField
          style={{ marginBottom: theme.spacing(3) }}
          variant="outlined"
          value={ this.state.applicationData["name"] }
          onChange={ this.onDataChange }
          name="name"
          label={ strings.name }
        />
        <Button
          style={{ marginLeft: theme.spacing(3) }}
          color="primary"
          variant="contained"
          startIcon={ <SaveIcon /> }
          onClick={ this.onUpdateApplication }
        >
          { strings.save }
        </Button>
        {/* <Divider style={{ marginBottom: theme.spacing(3) }} />
        <Typography variant="h3">{ strings.languageVersions }</Typography>
        <div className={ classes.languageInputContainer }>
          <FormControl>
            <InputLabel id="select-label">{ strings.selectLanguage }</InputLabel>
            <Select
              color="primary"
              id="language-select"
              value="fi"
            >
              <MenuItem value={ "fi" }>Suomi</MenuItem>
              <MenuItem value={ "en" }>English</MenuItem>
            </Select>
          </FormControl>
          <Button
            style={{ marginLeft: theme.spacing(3) }}
            color="primary"
            variant="contained"
            startIcon={ <AddIcon /> }
          >
            {
              strings.addLanguage
            }
          </Button>
        </div>
        <Divider style={{ marginBottom: theme.spacing(3) }} />
        <div>
          <Typography variant="h3">{ strings.mainNavigationIcons }</Typography>
          <Grid direction="row" style={{ marginTop: theme.spacing(3)} } container spacing={ 3 }>
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
        </div> */}
      </div>
    );
  }

  /**
   * Handles data change
   */
  private onDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { applicationData } = this.state;
    applicationData[e.target.name] = e.target.value;
    this.setState({
      applicationData: applicationData
    });
  }

  private onUpdateApplication = () => {
    const { onUpdate } = this.props;
    const { applicationData } = this.state;
    const customer = ApplicationFromJSON(applicationData);
    onUpdate(customer);
  }
}

export default withStyles(styles)(AppSettingsView);