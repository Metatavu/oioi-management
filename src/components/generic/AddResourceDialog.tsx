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
import { AuthState, ErrorContextType } from "../../types/index";
import ApiUtils from "../../utils/api";
import { ResourceTypeObject, resolveChildResourceTypes } from "../../commons/resourceTypeHelper";
import slugify from "slugify";
import { ErrorContext } from "../containers/ErrorHandler";

/**
 * Component props
 */
interface Props extends WithStyles<typeof styles> {
  auth: AuthState;
  open: boolean;
  parentResourceId?: string;
  customerId?: string;
  deviceId?: string;
  applicationId?: string;
  rootResourceId?: string;
  onSave(resource: Resource, copyFromId?: string): void;
  handleClose(): void;
}

/**
 * Form validation interface
 */
interface AddResourceForm extends Partial<Resource> {}

/**
 * Specifies each field with validation rules
 */
const rules: FormValidationRules<AddResourceForm> = {
  fields: {
    name: {
      required: true,
      trim: true,
      requiredText: strings.requiredField
    },
    orderNumber: {
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

/**
 * Component state
 */
interface State {
  form: Form<AddResourceForm>;
  resourceType?: ResourceType;
  siblingResources: Resource[];
  parentResourceType?: ResourceType;
  addingLanguage: boolean;
  copyContentFromId?: string;
}

/**
 * Creates Add resource dialog
 */
class AddResourceDialog extends React.Component<Props, State> {

  static contextType: React.Context<ErrorContextType> = ErrorContext;

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
          orderNumber: undefined,
          slug: undefined
        },
        rules
      ),
      resourceType: undefined,
      addingLanguage: false,
      siblingResources: []
    };
  }

  /**
   * Component did update life cycle handler
   *
   * @param prevProps previous properties
   * @param prevState previous state
   */
  public componentDidUpdate = async (prevProps: Props, prevState: State) => {
    if (prevProps !== this.props) {
      await this.updateData();
    }
  };

  /**
   * Component render method
   */
  public render = () => {
    const { classes, open, handleClose } = this.props;
    const { addingLanguage, form } = this.state;
    const { isFormValid } = form;

    return (
      <Dialog
        fullScreen={ false }
        open={ open }
        onClose={ handleClose }
        aria-labelledby="dialog-title"
        onBackdropClick={ this.onAddResourceDialogBackDropClick }
      >
        <DialogTitle id="dialog-title">
          <div>
            <Typography variant="h2">
              { strings.addNewResource }
            </Typography>
          </div>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Grid container spacing={ 2 }>
            <Grid item className={ classes.fullWidth }>
              { this.renderField("name", strings.name, "text") }
            </Grid>
            <Grid item className={ classes.fullWidth }>
              <InputLabel htmlFor="resourceType">
                { strings.resourceType }
              </InputLabel>
              { this.renderSelect() }
            </Grid>
            { addingLanguage && (
              <Grid item className={ classes.fullWidth }>
                <InputLabel htmlFor="copyContentFrom">
                  { strings.copyContentFromLanguageLabel }
                </InputLabel>
                { this.renderLanguageSelect() }
              </Grid>
            ) }
            <Grid item className={ classes.fullWidth }>
              { this.renderField("orderNumber", strings.orderNumber, "number") }
            </Grid>
            <Grid item className={classes.fullWidth}>
              { this.renderField("slug", strings.slug, "text") }
            </Grid>
          </Grid>
        </DialogContent>
        <Divider />
        <DialogActions>
          <Button variant="outlined" onClick={ this.onCloseClick } color="primary">
            { strings.cancel }
          </Button>
          <Button
            variant="contained"
            onClick={ this.onSaveNewResource }
            color="primary"
            autoFocus
            disabled={ !isFormValid }
          >
            { strings.save }
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  /**
   * Renders select
   */
  private renderSelect = () => {
    return (
      <Select
        fullWidth
        variant="outlined"
        value={ this.state.resourceType }
        inputProps={{
          id: "resourceType"
        }}
        onChange={ this.onSelectChange }
        name="type"
      >
        { this.state.parentResourceType && this.renderMenuItems() }
      </Select>
    );
  }

  /**
   * Renders select
   */
  private renderLanguageSelect = () => {
    return (
      <Select
        fullWidth
        displayEmpty
        variant="outlined"
        value={ this.state.copyContentFromId }
        inputProps={{
          id: "copyContentFrom"
        }}
        onChange={ this.onCopyContentFromSelectChange }
        name="copyContentFrom"
      >
        { this.renderLanguageMenuItems() }
      </Select>
    );
  }

    /**
   * Render menu items
   */
  private renderLanguageMenuItems = () => {
    const { siblingResources } = this.state;

    const menuItems: JSX.Element[] = [];
    const languageSiblings = siblingResources.filter(res => res.type === ResourceType.LANGUAGE);
    menuItems.push(
      <MenuItem value={ undefined } key="do-not-copy"> { strings.dontCopy } </MenuItem>
    )
    languageSiblings.forEach(language => {
      menuItems.push(
        <MenuItem value={ language.id } key={ language.id }>{ language.name }</MenuItem>
      );
    });

    return menuItems;
  }

  /**
   * Render menu items
   */
  private renderMenuItems = () => {
    const { parentResourceType, siblingResources } = this.state;
    const menuItems: JSX.Element[] = [];

    if (parentResourceType) {
      let foundTypes: ResourceTypeObject[] = resolveChildResourceTypes(parentResourceType);
      const hasLanguageMenu = siblingResources.find(r => r.type === ResourceType.LANGUAGEMENU);
      const hasIntro = siblingResources.find(r => r.type === ResourceType.INTRO);

      if (hasLanguageMenu) {
        foundTypes = foundTypes.filter(type => type.value !== ResourceType.LANGUAGEMENU);
      }

      if (hasIntro) {
        foundTypes = foundTypes.filter(type => type.value !== ResourceType.INTRO);
      }

      if (foundTypes && foundTypes.length > 0) {
        foundTypes.map(item => {
          const menuItem = <MenuItem value={ item.value } key={ item.value }>{ item.resourceLocal }</MenuItem>;
          return menuItems.push(menuItem);
        });
      }
    }

    return menuItems;
  }

  /**
   * Gets resource type
   */
  private getResourceType = async () => {
    const { auth, customerId, deviceId, applicationId, parentResourceId } = this.props;

    if (!auth || !auth.token || !applicationId || !customerId || !deviceId || !parentResourceId) {
      return;
    }

    try {
      const foundResource = await ApiUtils.getResourcesApi(auth.token).findResource({
        applicationId: applicationId,
        customerId: customerId,
        deviceId: deviceId,
        resourceId: parentResourceId
      });
      this.setState({ parentResourceType : foundResource.type });
    } catch (error) {
      this.context.setError(strings.errorManagement.resource.find, error);
    }
  }

  /**
   * Renders textfield
   *
   * @param key key of AddResourceForm
   * @param label label
   * @param type type
   */
  private renderField = (key: keyof AddResourceForm, label: string, type: string) => {
    const { values, messages: { [key]: message } } = this.state.form;

    return (
      <TextField
        multiline
        fullWidth
        type={ type }
        error={ message && message.type === MessageType.ERROR }
        helperText={ message && message.message }
        value={ values[key] || "" }
        onChange={ this.onHandleChange(key) }
        onBlur={ this.onHandleBlur(key) }
        name={ key }
        variant="outlined"
        label={ label }
      />
    );
  };

  /**
   * Handles save button click
   */
  private onSaveNewResource = () => {
    const { onSave, parentResourceId } = this.props;
    const { copyContentFromId, form } = this.state;

    if (!parentResourceId) {
      return;
    }

    const newResource = {
      ...form.values,
      type: this.state.resourceType,
      parentId: parentResourceId
    } as Resource;

    onSave(newResource, copyContentFromId);

    this.setState(
      {
        form: initForm<AddResourceForm>(
          {
            name: undefined,
            orderNumber: undefined,
            slug: undefined
          },
          rules
        ),
        resourceType: undefined
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
            orderNumber: undefined,
            slug: undefined
          },
          rules
        ),
        resourceType: undefined
      },
      () => this.props.handleClose()
    );
  };

  /**
   * Handles dialog back drop click
   */
  private onAddResourceDialogBackDropClick = () => {
    this.setState({
      form: initForm<AddResourceForm>(
        {
          name: undefined,
          orderNumber: undefined,
          slug: undefined
        },
        rules
      ),
      resourceType: undefined
    });
  };

  /**
   * Handles select element data change
   *
   * @param event React change event
   */
  private onSelectChange = (event: React.ChangeEvent<{ name?: string; value: any }>) => {
    const { name, value } = event.target;

    if (!name) {
      return;
    }

    const resourceType: ResourceType = value as ResourceType;
    this.setState({
      resourceType: resourceType,
      addingLanguage: resourceType === ResourceType.LANGUAGE,
      copyContentFromId: undefined
    });
  };

  /**
   * Event handler for copy content from select change
   *
   * @param event React change event
   */
  private onCopyContentFromSelectChange = (event: React.ChangeEvent<{ name?: string; value: any }>) => {
    this.setState({ copyContentFromId: event.target.value });
  };

  /**
   * Handles text fields change events
   *
   * @param key key of AddResourceForm
   * @param event React change event
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

    this.setState({ form: form });
  };

  /**
   * Handles fields blur event
   *
   * @param key key of AddResourceForm
   */
  private onHandleBlur = (key: keyof AddResourceForm) => () => {
    let form = { ...this.state.form };

    const filled = { ...form.filled, [key]: true };

    /**
     * If name changes slugify the name value and put it to url value
     */
    if (key === "name" && form.values.name) {
      const nameValue = form.values.name;
      form.values.slug = slugify(nameValue, {
        replacement: "",
        remove: /[^A-Za-z0-9]+/g,
        lower: true
      });
    }

    form = validateForm({
      ...this.state.form,
      filled
    });

    this.setState({ form: form });
  };

  /**
   * Updates data
   */
  private updateData = async () => {
    const { customerId, deviceId, applicationId, parentResourceId, auth } = this.props;

    if (!auth || !auth.token || !customerId || !deviceId || !applicationId || !parentResourceId) {
      return;
    }

    let childResources: Resource[] = [];
    try {
      childResources = await ApiUtils.getResourcesApi(auth.token).listResources({
        customerId: customerId,
        deviceId: deviceId,
        applicationId: applicationId,
        parentId: parentResourceId
      });
    } catch (error) {
      this.context.setError(strings.errorManagement.resource.listChild, error);
    }


    let form = initForm<AddResourceForm>(
      {
        name: "",
        orderNumber:
          childResources.length > 0
            ? Math.max.apply(
                Math,
                childResources.map((o: Resource) => {
                  return (o.orderNumber || 0) + 1;
                })
              )
            : 1,
        slug: ""
      },
      rules
    );

    form = validateForm(form);

    this.getResourceType();
    this.setState({
      form,
      resourceType: undefined,
      siblingResources: childResources
    });
  }
}

export default withStyles(styles)(AddResourceDialog);