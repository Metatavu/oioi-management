import * as React from "react";
import { withStyles, WithStyles, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Divider, Grid, Typography, Select, MenuItem, InputLabel, Box, IconButton } from "@material-ui/core";
import styles from "../../styles/dialog";
import strings from "../../localization/strings";
import { Resource, ResourceType } from "../../generated/client";
import { FormValidationRules, validateForm, Form, initForm, MessageType } from "ts-form-validation";
import { ErrorContextType } from "../../types/index";
import Api from "../../api";
import { ResourceTypeObject, resolveChildResourceTypes } from "../../commons/resourceTypeHelper";
import slugify from "slugify";
import { ErrorContext } from "../containers/ErrorHandler";
import CloseIcon from "@material-ui/icons/Close";
import { connect, ConnectedProps } from "react-redux";
import { ReduxDispatch, ReduxState } from "app/store";
import { addResources } from "features/resource-slice";
import { toast } from "react-toastify";
import { ResourceUtils } from "utils/resource";

/**
 * Component props
 */
interface Props extends ExternalProps {
  open: boolean;
  onClose(): void;
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
    const { classes, open, onClose } = this.props;
    const { addingLanguage, form } = this.state;
    const { isFormValid } = form;

    return (
      <Dialog
        maxWidth="sm"
        fullWidth
        open={ open }
        onClose={ onClose }
        aria-labelledby="dialog-title"
        onBackdropClick={ this.onAddResourceDialogBackDropClick }
      >
        <DialogTitle id="dialog-title" disableTypography>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h4">
              { strings.addNewResource }
            </Typography>
            <IconButton
              size="small"
              onClick={ this.onCloseClick }
            >
              <CloseIcon color="primary" />
            </IconButton>
          </Box>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Box mt={ 2 } mb={ 2 }>
            <Grid container spacing={ 3 }>
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
              <Grid item className={ classes.fullWidth }>
                { this.renderField("slug", strings.slug, "text") }
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <Divider />
        <DialogActions>
          <Button
            variant="text"
            onClick={ this.onCloseClick }
            color="primary">
            { strings.cancel }
          </Button>
          <Button
            variant="text"
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
        // Filter out PDF resource
        foundTypes = foundTypes.filter(type => type.value !== ResourceType.PDF);
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
    const { keycloak, customer, device, application, parentResource } = this.props;

    if (!keycloak?.token || !application?.id || !customer?.id || !device?.id || !parentResource?.id) {
      return;
    }

    try {
      const foundResource = await Api.getResourcesApi(keycloak.token).findResource({
        applicationId: application.id,
        customerId: customer.id,
        deviceId: device.id,
        resourceId: parentResource.id
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
  private onSaveNewResource = async () => {
    const { parentResource, addResources, onClose } = this.props;
    const { copyContentFromId, form, resourceType } = this.state;
    const { name, orderNumber, slug } = form.values;

    if (!parentResource?.id || !resourceType || !name || !orderNumber || !slug) {
      return;
    }

    try {
      const createdResources: Resource[] = [];

      if (copyContentFromId && parentResource?.id) {
        createdResources.push(...await this.copyResource(copyContentFromId, parentResource.id));
      } else {
        const resource = await this.createResource({
          ...form.values,
          name: name,
          orderNumber: orderNumber,
          slug: slug,
          type: resourceType,
          parentId: parentResource.id,
        });

        createdResources.push(resource);

        if (resourceType === ResourceType.PAGE) {
          createdResources.push(...await this.createPagePredefinedResources(resource));
        }
      }

      addResources(createdResources);
      toast.success(strings.createSuccessMessage);
    } catch (error) {
      this.context.setError(strings.errorManagement.resource.create);
    }

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
      () => onClose()
    );
  };

  /**
   * Creates resource
   *
   * @param resource resource
   * @returns Promise of created resource or reject
   */
  private createResource = async (resource: Resource) => {
    const { keycloak, customer, device, application } = this.props;

    if (!keycloak?.token || !customer?.id || !device?.id || !application?.id) {
      return Promise.reject("Token, customer, device or application missing");
    }

    try {
      return await Api.getResourcesApi(keycloak.token).createResource({
        applicationId: application.id,
        customerId: customer.id,
        deviceId: device.id,
        resource: resource
      });
    } catch (error) {
      return Promise.reject(strings.errorManagement.resource.create);
    }
  }

  /**
   * Copies resource with given ID under parent resource with given ID
   *
   * @param copyResourceId copy resource ID
   * @param copyResourceParentId copy resource parent ID
   * @returns all created resources
   */
  private copyResource = async (copyResourceId: string, copyResourceParentId: string): Promise<Resource[]> => {
    const { keycloak, customer, device, application } = this.props;

    if (!keycloak?.token || !customer?.id || !device?.id || !application?.id) {
      return Promise.reject("Token, customer, device or application missing");
    }

    try {
      const baseResource = await Api.getResourcesApi(keycloak.token).createResource({
        applicationId: application.id,
        customerId: customer.id,
        deviceId: device.id,
        copyResourceId: copyResourceId,
        copyResourceParentId: copyResourceParentId
      });

      const branchResources = await this.listBranchResources(baseResource);

      return [ baseResource, ...branchResources ];
    } catch (error) {
      return Promise.reject(strings.errorManagement.resource.create);
    }
  }

  /**
   * Creates pre-defined resources for given page
   *
   * @param page page resource
   */
  private createPagePredefinedResources = async (page: Resource) => {
    try {
      if (!page.id) {
        return Promise.reject("No page ID");
      }

      return await Promise.all(
        ResourceUtils.getPagePredefinedResources(page.id).map(resource => this.createResource(resource))
      );
    } catch (error) {
      return Promise.reject(error);
    }
  }

  /**
   * Lists resources from branch
   *
   * @param resource resource
   */
  private listBranchResources = async (resource: Resource): Promise<Resource[]> => {
    const { keycloak, customer, device, application } = this.props;

    if (!keycloak?.token || !customer?.id || !device?.id || !application?.id) {
      return Promise.reject("Token, customer, device or application missing");
    }

    try {
      const children = await Api.getResourcesApi(keycloak.token).listResources({
        applicationId: application.id,
        customerId: customer.id,
        deviceId: device.id,
        parentId: resource.id
      });

      const childrenOfChildren = await Promise.all(children.map(this.listBranchResources));

      return [ ...children, ...childrenOfChildren.flat() ];
    } catch (error) {
      return Promise.reject(error);
    }
  }

  /**
   * Handles close click and resets form values
   */
  private onCloseClick = () => {
    const { onClose } = this.props;

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
      () => onClose()
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

    if (resourceType === ResourceType.IMAGE) {
      this.setState({
        form: {
          ...this.state.form,
          values: {
            ...this.state.form.values,
            slug: "image"
          }
        }
      });
    }

    if (resourceType === ResourceType.TEXT) {
      this.setState({
        form: {
          ...this.state.form,
          values: {
            ...this.state.form.values,
            slug: "text_content"
          }
        }
      });
    }
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
    if (key === "name" && form.values.name && form.values.type !== ResourceType.IMAGE && form.values.type !== ResourceType.TEXT) {
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
    const { customer, device, application, parentResource, keycloak } = this.props;

    if (!keycloak?.token || !customer?.id || !device?.id || !application?.id || !parentResource?.id) {
      return;
    }

    let childResources: Resource[] = [];
    try {
      childResources = await Api.getResourcesApi(keycloak.token).listResources({
        customerId: customer.id,
        deviceId: device.id,
        applicationId: application.id,
        parentId: parentResource.id
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

/**
 * Map Redux state to props
 *
 * @param state state
 */
const mapStateToProps = (state: ReduxState) => ({
  keycloak: state.auth.keycloak,
  customer: state.customer.customer,
  device: state.device.device,
  application: state.application.application,
  parentResource: state.resource.selectedResource
});

/**
 * Map Redux dispatch to props
 *
 * @param dispatch dispatch
 */
const mapDispatchToProps = (dispatch: ReduxDispatch) => ({
  addResources: (resources: Resource[]) => dispatch(addResources(resources))
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type ExternalProps = ConnectedProps<typeof connector> & WithStyles<typeof styles>;

export default connector(withStyles(styles)(AddResourceDialog));