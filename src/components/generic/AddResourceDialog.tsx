import * as React from "react";
import {
  withStyles,
  WithStyles,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Divider,
  Grid,
  Typography,
  Select,
  MenuItem,
  InputLabel
} from "@material-ui/core";
import styles from "../../styles/dialog";
import strings from "../../localization/strings";
import { Resource, ResourceType } from "../../generated/client/src";
import { FormValidationRules, validateForm, Form, initForm, MessageType } from "ts-form-validation";

interface Props extends WithStyles<typeof styles> {
  /**
   * Dialog open state
   */
  open: boolean;
  /**
   * Parent resource id
   */
  parentResourceId: string;
  /**
   * Save button click
   */
  onSave(resource: Resource): void;
  /**
   * Close handler
   */
  handleClose(): void;
}

interface AddResourceForm extends Partial<Resource> {}

const rules: FormValidationRules<AddResourceForm> = {
  fields: {
    name: {
      required: true,
      trim: true,
      requiredText: strings.requiredField
    },
    order_number: {
      required: true,
      trim: true,
      requiredText: strings.requiredField
    },
    slug: {
      required: true,
      trim: true,
      requiredText: strings.requiredField
    }
  },
  validateForm: form => {
    const messages = {};

    return {
      ...form,
      messages
    };
  }
};

interface State {
  form: Form<AddResourceForm>;
  resourceType: ResourceType;
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
      form: initForm<AddResourceForm>(
        {
          name: undefined,
          order_number: undefined,
          slug: undefined
        },
        rules
      ),
      resourceType: ResourceType.INTRO
    };
  }

  /**
   * Component render method
   */
  public render() {
    const { classes } = this.props;
    const { isFormValid } = this.state.form;

    return (
      <Dialog fullScreen={false} open={this.props.open} onClose={this.props.handleClose} aria-labelledby="dialog-title">
        <DialogTitle id="dialog-title">
          <Typography variant="h2">{strings.addNewResource}</Typography>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item className={classes.fullWidth}>
              {this.renderField("name", strings.name)}
            </Grid>
            <Grid item className={classes.fullWidth}>
              <InputLabel htmlFor="resourceType">{strings.resourceType}</InputLabel>
              <Select
                fullWidth
                variant="outlined"
                value={this.state.resourceType}
                inputProps={{
                  id: "resourceType"
                }}
                onChange={this.onSelectChange}
                name="type"
              >
                <MenuItem value={ResourceType.INTRO}>{strings.intro}</MenuItem>
                <MenuItem value={ResourceType.LANGUAGE}>{strings.language}</MenuItem>
                <MenuItem value={ResourceType.MENU}>{strings.menu}</MenuItem>
                <MenuItem value={ResourceType.SLIDESHOW}>{strings.slideshow}</MenuItem>
                <MenuItem value={ResourceType.PAGE}>{strings.page}</MenuItem>
                <MenuItem value={ResourceType.PDF}>{strings.pdf}</MenuItem>
                <MenuItem value={ResourceType.IMAGE}>{strings.image}</MenuItem>
                <MenuItem value={ResourceType.TEXT}>{strings.text}</MenuItem>
                <MenuItem value={ResourceType.VIDEO}>{strings.video}</MenuItem>
              </Select>
            </Grid>
            <Grid item className={classes.fullWidth}>
              {this.renderField("order_number", strings.orderNumber)}
            </Grid>
            <Grid item className={classes.fullWidth}>
              {this.renderField("slug", strings.slug)}
            </Grid>
          </Grid>
        </DialogContent>
        <Divider />
        <DialogActions>
          <Button variant="outlined" onClick={this.onCloseClick} color="primary">
            {strings.cancel}
          </Button>
          <Button variant="contained" onClick={this.onSaveNewResource} color="primary" autoFocus disabled={!isFormValid}>
            {strings.save}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  /**
   * Renders textfield
   */
  private renderField = (key: keyof AddResourceForm, label: string) => {
    const {
      values,
      messages: { [key]: message }
    } = this.state.form;
    return (
      <TextField
        multiline
        fullWidth
        error={message && message.type === MessageType.ERROR}
        helperText={message && message.message}
        value={values[key]}
        onChange={this.onHandleChange(key)}
        onBlur={this.onHandleBlur(key)}
        name={key}
        variant="outlined"
        label={label}
      />
    );
  };

  /**
   * Handles save button click
   */
  private onSaveNewResource = () => {
    const { onSave, parentResourceId } = this.props;
    const { form } = this.state;

    const newResource = {
      ...form.values,
      type: this.state.resourceType || ResourceType.INTRO,
      parent_id: parentResourceId
    } as Resource;

    onSave(newResource);

    this.setState(
      {
        form: initForm<AddResourceForm>(
          {
            name: undefined,
            order_number: undefined,
            slug: undefined
          },
          rules
        ),
        resourceType: ResourceType.INTRO
      },
      () => this.props.handleClose()
    );
  };

  /**
   * Handles close click and resets form values
   */
  private onCloseClick = () => {
    this.setState(
      {
        form: initForm<AddResourceForm>(
          {
            name: undefined,
            order_number: undefined,
            slug: undefined
          },
          rules
        ),
        resourceType: ResourceType.INTRO
      },
      () => this.props.handleClose()
    );
  };

  /**
   * Handles select element data change
   */
  private onSelectChange = (e: React.ChangeEvent<{ name?: string; value: any }>) => {
    if (!e.target.name) {
      return;
    }

    this.setState({
      resourceType: e.target.value
    });
  };

  /**
   * Handles textfields change events
   * @param key
   * @param event
   */
  private onHandleChange = (key: keyof AddResourceForm) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const values = {
      ...this.state.form.values,
      [key]: event.target.value
    };

    const form = validateForm(
      {
        ...this.state.form,
        values
      },
      {
        usePreprocessor: false
      }
    );

    this.setState({
      form
    });
  };

  /**
   * Handles fields blur event
   * @param key
   */
  private onHandleBlur = (key: keyof AddResourceForm) => () => {
    let form = { ...this.state.form };
    const filled = {
      ...form.filled,
      [key]: true
    };

    form = validateForm({
      ...this.state.form,
      filled
    });

    this.setState({
      form
    });
  };
}

export default withStyles(styles)(AddResourceDialog);
