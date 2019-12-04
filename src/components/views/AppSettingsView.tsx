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