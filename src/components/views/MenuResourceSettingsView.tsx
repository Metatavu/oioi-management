/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from "react";
import { withStyles, WithStyles, TextField, Divider, Typography, Button, TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody } from "@material-ui/core";
import MaterialTable from "material-table";
import AddIcon from "@material-ui/icons/AddBox";
import DeleteIcon from "@material-ui/icons/DeleteForever";
import CheckIcon from "@material-ui/icons/Check";
import ClearIcon from "@material-ui/icons/Clear";
import EditIcon from "@material-ui/icons/Edit";
import styles from "../../styles/editor-view";
import strings from "../../localization/strings";
import theme from "../../styles/theme";
import { Resource, ResourceToJSON, KeyValueProperty } from "../../generated/client/src";
import FileUpload from "../../utils/FileUpload";
import { forwardRef } from "react";
import { MessageType, initForm, Form, validateForm } from "ts-form-validation";

import { getLocalizedTypeString } from "../../commons/resourceTypeHelper";
import { AuthState } from "../../types";
import ApiUtils from "../../utils/ApiUtils";
import logo from "../../resources/svg/oioi-logo.svg";

import IconButton from "@material-ui/core/IconButton";
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
  customerId: string;
  resourcesUpdated: number;

  /**
   * Update resource
   * @param resource resource to update
   */
  onUpdate(resource: Resource): void;

  /**
   * Delete resource
   * @param resource resource to delete
   */
  onDelete(resource: Resource): void;
}

/**
 * Component state
 */
interface State {
  form: Form<ResourceSettingsForm>;
  resourceId: string;
  resourceData: any;
  updated: boolean;
  childResources?: Resource[];
}

class MenuResourceSettingsView extends React.Component<Props, State> {
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
          slug: undefined,
          data: undefined,
          nameText: undefined,
          title: undefined,
          content: undefined
        },
        resourceRules
      ),

      resourceId: "",
      resourceData: {},
      updated: false
    };
  }

  /**
   * Component did mount
   */
  public componentDidMount = async () => {

    const { auth, customerId, deviceId, applicationId, resource } = this.props;
    const resourceId = resource.id;

    if (!auth || !auth.token || !resourceId) {
      return;
    }

    const properties = this.props.resource.properties || [];
    const titleProperty = properties.find(p => p.key === "title");
    const contentProperty = properties.find(p => p.key === "content");
    const nameTextProperty = properties.find(p => p.key === "nameText");

    let form = initForm<ResourceSettingsForm>(
      {
        ...this.props.resource,
        nameText: nameTextProperty ? nameTextProperty.value : undefined,
        content: contentProperty ? contentProperty.value : undefined,
        title: titleProperty ? titleProperty.value : undefined
      },
      resourceRules
    );

    form = validateForm(form);

    const resourcesApi = ApiUtils.getResourcesApi(auth.token);
    const childResources = await resourcesApi.listResources({
      customer_id: customerId,
      device_id: deviceId,
      application_id: applicationId,
      parent_id: resourceId
    });

    this.setState({
      form,
      resourceId: resourceId,
      resourceData: ResourceToJSON(this.props.resource),
      childResources: childResources
    });
  }

  /**
   * Component did update method
   */
  public componentDidUpdate = async (prevProps: Props, prevState: State) => {
    if (prevProps.resource !== this.props.resource || prevProps.resourcesUpdated !== this.props.resourcesUpdated) {

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

      const properties = resource.properties || [];
      const titleProperty = properties.find(p => p.key === "title");
      const contentProperty = properties.find(p => p.key === "content");
      const nameTextProperty = properties.find(p => p.key === "nameText");
      let form = initForm<ResourceSettingsForm>(
        {
          ...resource,
          nameText: nameTextProperty ? nameTextProperty.value : undefined,
          content: contentProperty ? contentProperty.value : undefined,
          title: titleProperty ? titleProperty.value : undefined
        },
        resourceRules
      );

      form = validateForm(form);
      this.setState({
        updated: true,
        form,
        resourceData: ResourceToJSON(resource),
        childResources: childResources
      });
    }
  }

  /**
   * Component render method
   */
  public render() {
    const { updated } = this.state;

    if (updated) {
      this.setState({
        updated: false
      });
      return <div></div>;
    }

    const { isFormValid } = this.state.form;
    const resourceTypeObject = getLocalizedTypeString(this.props.resource.type);

    return (
      <div>
        <Typography variant="h3">{ resourceTypeObject.resourceLocal }</Typography>
        <Button
          style={{ marginLeft: theme.spacing(3), marginTop: theme.spacing(1) }}
          color="primary"
          variant="contained"
          disabled={ !isFormValid }
          onClick={ this.onUpdateResource }
        >
          { strings.save }
        </Button>
        <Divider style={{ marginTop: theme.spacing(3), marginBottom: theme.spacing(3) }} />
        { this.renderFields() }
        <Divider style={{ marginBottom: theme.spacing(3) }} />

        <div>
          { this.renderUploaderAndPreview(strings.backgroundMedia, "background") }
          <Divider style={{ marginTop: theme.spacing(3), marginBottom: theme.spacing(3) }} />
          <Typography variant="h4">{ strings.childResources }</Typography>
          { this.renderChildResources() }
          <Divider style={{ marginTop: theme.spacing(3), marginBottom: theme.spacing(3) }} />
          { this.renderUploaderAndPreview(strings.menuImage, "menuImg") }
          <Divider style={{ marginTop: theme.spacing(3), marginBottom: theme.spacing(3) }} />
        </div>

        <div>
          { this.renderStyleTable() }
        </div>
        <Divider style={{ marginTop: theme.spacing(3), marginBottom: theme.spacing(3) }} />

        <div>
          { this.renderPropertiesTable() }
        </div>
      </div>
    );
  }

  /**
   * Render text fields
   */
  private renderFields = () => {
    return (
      <>
        <Typography variant="h3">{ strings.title }</Typography>
        { this.renderField("title", strings.title, "text") }

        <Typography variant="h3">{ strings.nameText }</Typography>
        { this.renderField("nameText", strings.nameText, "textarea") }

        <Typography variant="h3">{ strings.content }</Typography>
        { this.renderField("content", strings.content, "textarea") }

        { this.renderField("name", strings.name, "text") }
        { this.renderField("order_number", strings.orderNumber, "number") }
        { this.renderField("slug", strings.slug, "text") }
      </>
    );
  }

  /**
   * Renders textfield
   * @param key to look for
   * @param label label to be shown
   * @param type text field type
   */
  private renderField = (key: keyof ResourceSettingsForm, label: string, type: string) => {
    const {
      values,
      messages: { [key]: message }
    } = this.state.form;
    if (type === "textarea") {
      return ( <TextField
        fullWidth
        multiline
        rows={ 8 }
        style={{ margin: theme.spacing(3) }}
        type={ type }
        error={ message && message.type === MessageType.ERROR }
        helperText={ message && message.message }
        value={ values[key] || "" }
        onChange={ this.onHandleChange(key) }
        onBlur={ this.onHandleBlur(key) }
        name={ key }
        variant="outlined"
        label={ label }
      /> );
    }
    return (
      <TextField
        fullWidth
        style={{ margin: theme.spacing(3) }}
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
   * Render child resources
   * TODO: Needs styles (Tuomas)
   */
  private renderChildResources = () => {
    const { childResources } = this.state;
    const { classes } = this.props;

    if (!childResources) {
      return <div />;
    }

    const listItems = childResources.map(resource => {
      return (
        <TableRow key={ resource.name }>
          <TableCell component="th" scope="row">{ resource.name }</TableCell>
          <TableCell align="right">{ resource.type }</TableCell>
          <TableCell align="center">{ resource.order_number }</TableCell>
          <TableCell align="right">
            <IconButton color="primary" edge="end" aria-label="delete" onClick={ () => this.props.onDelete(resource) }>
              <DeleteIcon />
            </IconButton>
          </TableCell>
        </TableRow>
      );
    });

    return(
      <TableContainer component={ Paper }>
        <Table size="small" className={ classes.table } aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Sivu</TableCell>
              <TableCell align="right">Tyyppi</TableCell>
              <TableCell align="center">Järjestys vasemmalta oikealle</TableCell>
              <TableCell align="right"></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            { listItems }
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  /**
   * Render file uploaders for background image and custom icons
   */
  private renderUploaderAndPreview = (title: string, uploadKey: string) => {
    const resource = this.props.resource;

    const properties = this.state.form.values.properties;
    if (!properties) {
      return;
    }
    const previewItem = this.findImage(properties, uploadKey) || logo;

    return <>
      <Typography variant="h4">{ title }</Typography>
      <ImagePreview
        imagePath={ previewItem }
        onSave={ this.onPropertyFileChange }
        resource={ resource }
        uploadKey={ uploadKey }
        onDelete={ this.onPropertyFileDelete }
      />
    </>;
  };

  /**
   * Find image from prop
   */
  private findImage = (properties: KeyValueProperty[], propertyKey: string) => {
    const foundItem = properties.find((p: KeyValueProperty) => p.key === propertyKey);
    if (foundItem) {
      return foundItem.value;
    }
    return;
  }

  /**
   * Handles image change
   */
  private onPropertyFileChange = async (files: File[], key?: string) => {
    const { customerId } = this.props;
    const { resourceData } = this.state;

    const properties = resourceData.properties ? [...resourceData.properties] : [];
    const property = { key: key, value: undefined };
    const file = files[0];

    if (file) {
      const response = await FileUpload.uploadFile(file, customerId);
      property.value = response.uri;
    }

    const propertyIndex = properties.findIndex((p: KeyValueProperty) => p.key === key)
    if (propertyIndex > -1) {
      properties[propertyIndex] = property;
    } else {
      properties.push(property);
    }

    resourceData.properties = properties;
    this.setState({
      resourceData: { ...resourceData }
    });

    this.onUpdateResource();
  };

  /**
   * Handles image delete
   */
  private onPropertyFileDelete = (key?: string) => {
    const { resourceData } = this.state;

    const properties = resourceData.properties ? [...resourceData.properties] : [];
    const updatedProperties = properties.filter((property: KeyValueProperty) => property.key !== key);

    resourceData.properties = updatedProperties;
    this.setState({
      resourceData: { ...resourceData }
    });

    this.onUpdateResource();
  };

  /**
   * On update resource method
   */
  private onUpdateResource = () => {
    const { onUpdate } = this.props;
    const { resourceData, form } = this.state;
    const properties = resourceData.properties ? [...resourceData.properties] : [];
    const titleIndex = properties.findIndex((p: KeyValueProperty) => p.key === "title");
    const nameTextIndex = properties.findIndex((p: KeyValueProperty) => p.key === "nameText");
    const contentIndex = properties.findIndex((p: KeyValueProperty) => p.key === "content");

    if (titleIndex > -1) {
      properties[titleIndex] = { key: "title", value: form.values.title }
    } else {
      properties.push({ key: "title", value: form.values.title });
    }

    if (nameTextIndex > -1) {
      properties[nameTextIndex] = { key: "nameText", value: form.values.nameText }
    } else {
      properties.push({ key: "nameText", value: form.values.nameText });
    }

    if (contentIndex > -1) {
      properties[contentIndex] = { key: "content", value: form.values.content }
    } else {
      properties.push({ key: "content", value: form.values.content });
    }

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

    onUpdate(resource);

    this.setState({
      resourceData: resourceData
    });
  };

  /**
   * Handles textfields change events
   * @param key
   * @param event
   */
  private onHandleChange = (key: keyof ResourceSettingsForm) => (event: React.ChangeEvent<HTMLInputElement>) => {
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
      form
    });
  };
}

export default withStyles(styles)(MenuResourceSettingsView);
