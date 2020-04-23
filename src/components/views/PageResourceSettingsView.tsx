/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from "react";
import { withStyles, WithStyles, TextField, Divider, Typography, Grid, Button, IconButton } from "@material-ui/core";
import MaterialTable from "material-table";
import AddIcon from "@material-ui/icons/AddBox";
import AddCircleIcon from '@material-ui/icons/AddCircle';
import DeleteIcon from "@material-ui/icons/Delete";
import CheckIcon from "@material-ui/icons/Check";
import ClearIcon from "@material-ui/icons/Clear";
import EditIcon from "@material-ui/icons/Edit";
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import styles from "../../styles/editor-view";
import strings from "../../localization/strings";
import theme from "../../styles/theme";
import { Resource, ResourceToJSON, ResourceType } from "../../generated/client/src";
import FileUpload from "../../utils/FileUpload";
import { forwardRef } from "react";
import { MessageType, initForm, Form, validateForm } from "ts-form-validation";
import logo from "../../resources/svg/oioi-logo.svg";
import { AuthState } from "../../types";
import ApiUtils from "../../utils/ApiUtils";
import { resourceRules, ResourceSettingsForm } from "../../commons/formRules";
import ImagePreview from "../generic/ImagePreview";

/**
 * Component props
 */
interface Props extends WithStyles<typeof styles> {
  deviceId: string;
  applicationId: string;
  auth: AuthState;
  resource: Resource;
  resourcesUpdated: number;
  customerId: string;

  /**
   * Add child
   */
  onAddChild: (parentId: string) => void;

  /**
   * Save resource to parent
   * @param resource resource to save
   */
  onSave: (resource: Resource) => void;

  /**
   * Save child resource
   * @param childResource child resource to save
   */
  onSaveChildren: (childResources: Resource[]) => void;

  /**
   * Delete resource
   * @param resource resource to delete
   */
  onDelete: (resource: Resource) => void;

  /**
   * Delete child resource
   * @param resource resource to delete
   * @param nextOpenResource
   */
  onDeleteChild: (resource: Resource, nextOpenResource?: Resource) => void;
  confirmationRequired: (value: boolean) => void;
}

/**
 * Component state
 */
interface State {
  form: Form<ResourceSettingsForm>;
  resourceId: string;
  resourceData: any;
  loading: boolean;
  childResources?: Resource[];
  dataChanged: boolean;
}

class PageResourceSettingsView extends React.Component<Props, State> {
  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      form: initForm<ResourceSettingsForm>(
        {
          name: undefined,
          order_number: undefined,
          slug: undefined
        },
        resourceRules
      ),

      resourceId: "",
      resourceData: {},
      loading: false,
      dataChanged: false
    };
  }

  /**
   * Component did mount
   */
  public componentDidMount = async () => {
    const { auth } = this.props;
    if (!auth || !auth.token) {
      return;
    }

    this.updateComponentData();
  }

  /**
   * Component did update method
   */
  public componentDidUpdate = async (prevProps: Props, prevState: State) => {
    if (prevProps.resource !== this.props.resource || prevProps.resourcesUpdated !== this.props.resourcesUpdated) {
      const { auth } = this.props;
      if (!auth || !auth.token) {
        return;
      }

      this.updateComponentData();
    }
  }

  /**
   * Component render method
   */
  public render() {
    const { loading, dataChanged } = this.state;

    if (loading) {
      return;
    }

    const { isFormValid } = this.state.form;

    return (
      <div>
        <Grid>
          <Button
            style={ { marginLeft: theme.spacing(3), marginTop: theme.spacing(1) } }
            color="primary"
            variant="outlined"
            disabled={ !isFormValid || !dataChanged }
            onClick={ this.onSaveChanges }
          >
            { strings.save }
          </Button>
        </Grid>

        <Divider style={{ marginTop: theme.spacing(3), marginBottom: theme.spacing(3) }} />

        <Typography variant="h4">{ strings.name }</Typography>
        { this.renderField("name", strings.name, "text") }

        <div>
          { this.renderChildResources() }
          <Divider style={{ marginTop: theme.spacing(3), marginBottom: theme.spacing(3) }} />

          { this.renderAddChild() }
          <Divider style={{ marginTop: theme.spacing(3), marginBottom: theme.spacing(3) }} />
        </div>

        <Typography style={{ marginTop: theme.spacing(3), marginBottom: theme.spacing(3) }} variant="h3">{ strings.advanced }</Typography>

        { this.renderResourceFields() }

        <div>
          { this.renderStyleTable() }
          <Divider style={{ marginTop: theme.spacing(3), marginBottom: theme.spacing(3) }} />
        </div>

        <div>
          { this.renderPropertiesTable() }
        </div>
      </div>
    );
  }

  /**
   * Renders resource text fields
   */
  private renderResourceFields = () => {
    return (
      <div style={{ display: "grid", gridAutoFlow: "column", gridGap: theme.spacing(3), marginBottom: theme.spacing(3) }}>
        <div>
          <Typography variant="h4">{ strings.orderNumber }</Typography>
          { this.renderField("order_number", strings.orderNumber, "number") }
        </div>
        <div>
          <Typography variant="h4">{ strings.slug }</Typography>
          { this.renderField("slug", strings.slug, "text") }
        </div>
      </div>
    );
  }

  /**
   * Renders text field
   * @param key to look for
   * @param label label to be shown
   * @param type text field type
   */
  private renderField = (key: keyof ResourceSettingsForm, placeholder: string, type: string) => {
    const {
      values,
      messages: { [key]: message }
    } = this.state.form;
    if (type === "textarea") {
      return ( <TextField
        fullWidth
        multiline
        rows={ 8 }
        type={ type }
        error={ message && message.type === MessageType.ERROR }
        helperText={ message && message.message }
        value={ values[key] || "" }
        onChange={ this.onHandleResourceTextChange(key) }
        onBlur={ this.onHandleBlur(key) }
        name={ key }
        variant="outlined"
        placeholder={ placeholder }
      /> );
    }
    return (
      <TextField
        fullWidth
        type={ type }
        error={ message && message.type === MessageType.ERROR }
        helperText={ message && message.message }
        value={ values[key] || "" }
        onChange={ this.onHandleResourceTextChange(key) }
        onBlur={ this.onHandleBlur(key) }
        name={ key }
        variant="outlined"
        placeholder={ placeholder }
      />
    );
  };

  /**
   * Renders table that contains style data
   */
  private renderStyleTable = () => {
    const { resourceData } = this.state;

    return (
      <MaterialTable
        icons={{
          Add: forwardRef((props, ref) => <AddIcon { ...props } ref={ ref } />),
          Delete: forwardRef((props, ref) => <DeleteIcon { ...props } ref={ ref } />),
          Check: forwardRef((props, ref) => <CheckIcon { ...props } ref={ ref } />),
          Clear: forwardRef((props, ref) => <ClearIcon { ...props } ref={ ref } />),
          Edit: forwardRef((props, ref) => <EditIcon { ...props } ref={ ref } />)
        }}
        columns={[
          { title: strings.key, field: "key" },
          { title: strings.value, field: "value" }
        ]}
        data={resourceData["styles"]}
        editable={{
          onRowAdd: newData =>
            new Promise((resolve, reject) => {
              {
                const { resourceData } = this.state;
                const styles = resourceData["styles"];
                styles.push(newData);
                resourceData["styles"] = styles;
                this.setState({ resourceData: resourceData }, () => resolve());
              }
              resolve();
            }),
          onRowUpdate: (newData, oldData) =>
            new Promise((resolve, reject) => {
              {
                const { resourceData } = this.state;
                const styles = resourceData["styles"];
                const index = styles.indexOf(oldData);
                styles[index] = newData;
                resourceData["styles"] = styles;
                this.setState({ resourceData: resourceData }, () => resolve());
              }
              resolve();
            }),
          onRowDelete: oldData =>
            new Promise((resolve, reject) => {
              {
                const { resourceData } = this.state;
                const styles = resourceData["styles"];
                const index = styles.indexOf(oldData);
                styles.splice(index, 1);
                resourceData["styles"] = styles;
                this.setState({ resourceData: resourceData }, () => resolve());
              }
              resolve();
            })
        }}
        title={ strings.styles }
        options={{
          grouping: false,
          search: false,
          selection: false,
          sorting: false,
          draggable: false,
          exportButton: false,
          filtering: false,
          paging: false,
          showTextRowsSelected: false,
          showFirstLastPageButtons: false,
          showSelectAllCheckbox: false
        }}
      />
    );
  };

  /**
   * Renders table that contains properties data
   */
  private renderPropertiesTable = () => {
    const { resourceData } = this.state;

    return (
      <MaterialTable
        icons={{
          Add: forwardRef((props, ref) => <AddIcon { ...props } ref={ ref } />),
          Delete: forwardRef((props, ref) => <DeleteIcon { ...props } ref={ ref } />),
          Check: forwardRef((props, ref) => <CheckIcon { ...props } ref={ ref } />),
          Clear: forwardRef((props, ref) => <ClearIcon { ...props } ref={ ref } />),
          Edit: forwardRef((props, ref) => <EditIcon { ...props } ref={ ref } />)
        }}
        columns={[
          { title: strings.key, field: "key" },
          { title: strings.value, field: "value" }
        ]}
        data={resourceData["properties"]}
        editable={{
          onRowAdd: newData =>
            new Promise((resolve, reject) => {
              {
                const { resourceData } = this.state;
                const properties = resourceData["properties"];
                properties.push(newData);
                resourceData["properties"] = properties;
                this.setState({ resourceData: resourceData }, () => resolve());
              }
              resolve();
            }),
          onRowUpdate: (newData, oldData) =>
            new Promise((resolve, reject) => {
              {
                const { resourceData } = this.state;
                const properties = resourceData["properties"];
                const index = properties.indexOf(oldData);
                properties[index] = newData;
                resourceData["properties"] = properties;
                this.setState({ resourceData: resourceData }, () => resolve());
              }
              resolve();
            }),
          onRowDelete: oldData =>
            new Promise((resolve, reject) => {
              {
                const { resourceData } = this.state;
                const properties = resourceData["properties"];
                const index = properties.indexOf(oldData);
                properties.splice(index, 1);
                resourceData["properties"] = properties;
                this.setState({ resourceData: resourceData }, () => resolve());
              }
              resolve();
            })
        }}
        title={ strings.properties }
        options={{
          grouping: false,
          search: false,
          selection: false,
          sorting: false,
          draggable: false,
          exportButton: false,
          filtering: false,
          paging: false,
          showTextRowsSelected: false,
          showFirstLastPageButtons: false,
          showSelectAllCheckbox: false
        }}
      />
    )
  };

  /**
   * Renders child resources
   */
  private renderChildResources = () => {
    const { childResources } = this.state;

    if (!childResources) {
      return;
    }

    const listItems = childResources.map(child =>
      <>
        <Divider style={{ marginTop: theme.spacing(3), marginBottom: theme.spacing(3) }} />
        <Grid
          xs={ 12 }
          container
          direction="row"
          style={{ paddingLeft: theme.spacing(3), paddingRight: theme.spacing(3) }}
        >
          <Grid
            xs={ 12 }
            item
            container
            justify="space-between"
            alignItems="center"
          >
            <Typography variant="h3" style={{ textTransform: "capitalize" }}>{ child.name }</Typography>
            { this.renderDeleteChild(child) }
          </Grid>
          { this.renderChildResourceContentField(child) }
        </Grid>
      </>
    );

    return(
      <div>
        { listItems }
      </div>
    );
  };

  /**
   * Renders add child resource button
   */
  private renderAddChild = () => {
    const resourceId = this.props.resource.id;
    if (!resourceId) {
      return;
    }

    return (
      <Button
        style={{ marginLeft: theme.spacing(3), marginTop: theme.spacing(1) }}
        color="primary"
        startIcon={ <AddCircleIcon /> }
        onClick={ () => this.props.onAddChild(resourceId) }
      >
        { strings.addNewResource }
      </Button>
    );
  }

  /**
   * Renders delete child resource button
   */
  private renderDeleteChild = (resource: Resource) => {
    return (
      <IconButton
        key={ `delete.${resource.id}` }
        name={ resource.id }
        color="primary"
        onClick={ () => this.props.onDeleteChild(resource, this.props.resource) }
      >
        <DeleteForeverIcon />
      </IconButton>
    );
  }

  /**
   * Renders child resource content field
   */
  private renderChildResourceContentField = (resource: Resource) => {
    switch (resource.type) {
      case ResourceType.TEXT:
        return <>
          <TextField
            fullWidth
            value={ resource.data || "" }
            onChange={ this.onHandleChildResourceTextChange(resource) }
            name={ resource.id }
            variant="outlined"
            placeholder={ strings.resourceTypes.text }
          />
        </>;
      case ResourceType.PDF:
      case ResourceType.IMAGE:
      case ResourceType.VIDEO:
        return this.renderUploaderAndPreview(resource);
      default:
      return null;
    }
  }

  /**
   * Renders file uploaders for background image and custom icons
   */
  private renderUploaderAndPreview = (resource: Resource) => {

    if (!resource.id) {
      return;
    }

    const previewItem = resource.data || logo;
    return (
      <ImagePreview
        imagePath={ previewItem }
        resource={ resource }
        onDelete={ this.onChildResourceFileDelete }
        onSave={ this.onChildResourceFileChange }
        uploadKey={ resource.id }
      />
    );
  }

  /**
   * Updates component data
   */
  private updateComponentData = async () => {
    const { resource } = this.props;
    const resourceId = resource.id;
    if (!resourceId) {
      return;
    }

    const childResources = await this.getChildResources();
    const resourceData = ResourceToJSON(resource);
    const form = validateForm(
      initForm<ResourceSettingsForm>(resource, resourceRules)
    );

    this.setState({
      form,
      resourceId,
      resourceData,
      childResources
    });
  }

  /**
   * Gets child resourcess
   */
  private getChildResources = async () => {
    const { auth, customerId, deviceId, applicationId, resource } = this.props;
    const resourceId = resource.id;

    if (!auth || !auth.token || !resourceId) {
      return;
    }

    const resourcesApi = ApiUtils.getResourcesApi(auth.token);
    const childResources = await resourcesApi.listResources({
      customer_id: customerId,
      device_id: deviceId,
      application_id: applicationId,
      parent_id: resourceId
    });

    return childResources;
  }

  /**
   * Handles save changes to resource and child resources
   */
  private onSaveChanges = () => {
    const { onSave, onSaveChildren } = this.props;
    const { resourceData, childResources, form } = this.state;
    const properties = resourceData.properties ? [...resourceData.properties] : [];

    const resource = {
      name: form.values.name,
      order_number: form.values.order_number,
      slug: form.values.slug,
      parent_id: form.values.parent_id,
      type: form.values.type,
      id: form.values.id,
      data: resourceData["data"],
      styles: resourceData["styles"],
      properties: properties.filter(p => !!p.value)
    } as Resource;

    onSave(resource);
    childResources && onSaveChildren(childResources);

    this.setState({
      resourceData
    });
  };

  /**
   * Updates child resource
   * 
   * @param childResource child resource
   */
  private updateChildResource = (childResource: Resource) => {
    const { childResources } = this.state;
    if (!childResources) {
      return;
    }

    const resourceIndex = childResources.findIndex(resource => resource.id === childResource.id);
    childResources.splice(resourceIndex, 1, childResource);
    this.setState({
      childResources,
      dataChanged: true
    });

    this.props.confirmationRequired(true);
  }

  /**
   * Handles resource text fields change events
   * @param key
   * @param event
   */
  private onHandleResourceTextChange = (key: keyof ResourceSettingsForm) => (event: React.ChangeEvent<HTMLInputElement>) => {
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
      form,
      dataChanged: true
    });

    this.props.confirmationRequired(true);
  };

  /**
   * Handles child resource text change
   */
  private onHandleChildResourceTextChange = (childResource: Resource) => (event: React.ChangeEvent<HTMLInputElement>) => {
    childResource.data = event.target.value;
    this.updateChildResource(childResource);
  }

  /**
   * Handles child resource file change
   * 
   * @param files files
   * @param key resource id
   */
  private onChildResourceFileChange = async (files: File[], resourceId: string) => {
    const { customerId } = this.props;
    const { childResources } = this.state;
    const file = files[0];
    if (!file || !childResources) {
      return 500;
    }

    const resourceIndex: number = childResources.findIndex(resource => resource.id === resourceId);
    if (resourceIndex === -1) {
      return 500;
    }

    const response = await FileUpload.uploadFile(file, customerId);
    const updatedChildResource: Resource = { ...childResources[resourceIndex], data: response.uri };
    this.updateChildResource(updatedChildResource);

    return 200;
  };

  /**
   * Handles child resource file delete
   */
  private onChildResourceFileDelete = (resourceId: string) => {
    const { childResources } = this.state;
    if (!childResources) {
      return;
    }

    const resourceIndex: number = childResources.findIndex(resource => resource.id === resourceId);
    if (resourceIndex === -1) {
      return;
    }

    const updatedChildResource: Resource = { ...childResources[resourceIndex], data: undefined };
    this.updateChildResource(updatedChildResource);
  }

  /**
   * Handles fields blur event
   * @param key
   */
  private onHandleBlur = (key: keyof ResourceSettingsForm) => () => {
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
      form,
      dataChanged: true
    });

    this.props.confirmationRequired(true);
  };
}

export default withStyles(styles)(PageResourceSettingsView);