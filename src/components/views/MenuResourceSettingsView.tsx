/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from "react";
import { withStyles, WithStyles, TextField, Divider, Typography, Grid, FormControl, InputLabel, Select, MenuItem, Button } from "@material-ui/core";
import MaterialTable from "material-table";
import AddIcon from "@material-ui/icons/AddBox";
import DeleteIcon from "@material-ui/icons/Delete";
import SaveIcon from "@material-ui/icons/Save";
import CheckIcon from "@material-ui/icons/Check";
import ClearIcon from "@material-ui/icons/Clear";
import EditIcon from "@material-ui/icons/Edit";
import styles from "../../styles/editor-view";
import strings from "../../localization/strings";
import theme from "../../styles/theme";
import { Resource, ResourceToJSON, ResourceFromJSON, ResourceType, KeyValuePropertyFromJSON, KeyValueProperty } from "../../generated/client/src";
import FileUpload from "../../utils/FileUpload";
import { forwardRef } from "react";
import { FormValidationRules, MessageType, initForm, Form, validateForm } from "ts-form-validation";
import FileUploader from "../generic/FileUploader";
import { getAllowedFileTypes, resolveChildResourceTypes, getLocalizedTypeString } from "../../commons/resourceTypeHelper";
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import { AuthState } from "../../types";
import ApiUtils from "../../utils/ApiUtils";

import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';

/**
 * Component props
 */
interface Props extends WithStyles<typeof styles> {
  deviceId: string;
  applicationId: string;
  auth: AuthState;
  resource: Resource;
  customerId: string;
  onUpdate(resource: Resource): void;
  onDelete(resource: Resource): void;
}

interface ResourceSettingsForm extends Partial<Resource> {
  nameText?: string;
  title?: string;
  content?: string;
}

const rules: FormValidationRules<ResourceSettingsForm> = {
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
    },
    data: {
      required: false,
      trim: true
    },
    nameText: {
      required: false,
      trim: true
    },
    title: {
      required: false,
      trim: true
    },
    content: {
      required: false,
      trim: true
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
        rules
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
    const titleProperty = properties.find(p => p.key == "title");
    const contentProperty = properties.find(p => p.key == "content");
    const nameTextProperty = properties.find(p => p.key == "nameText");

    let form = initForm<ResourceSettingsForm>(
      {
        ...this.props.resource,
        nameText: nameTextProperty ? nameTextProperty.value : undefined,
        content: contentProperty ? contentProperty.value : undefined,
        title: titleProperty ? titleProperty.value : undefined
      },
      rules
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
    if (prevProps.resource !== this.props.resource) {

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
      const titleProperty = properties.find(p => p.key == "title");
      const contentProperty = properties.find(p => p.key == "content");
      const nameTextProperty = properties.find(p => p.key == "nameText");
      let form = initForm<ResourceSettingsForm>(
        {
          ...resource,
          nameText: nameTextProperty ? nameTextProperty.value : undefined,
          content: contentProperty ? contentProperty.value : undefined,
          title: titleProperty ? titleProperty.value : undefined
        },
        rules
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
        <Grid>
          <Typography variant="h3">{ resourceTypeObject.resourceLocal }</Typography>
          <Button
            style={{ marginLeft: theme.spacing(3), marginTop: theme.spacing(1) }}
            color="primary"
            variant="contained"
            startIcon={ <SaveIcon /> }
            disabled={ !isFormValid }
            onClick={ this.onUpdateResource }
          >
            { strings.save }
          </Button>
        </Grid>
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
    return<>
      <Grid container spacing={ 3 } direction="row">
        <Typography variant="h3">{ strings.title }</Typography>
        { this.renderField("title", strings.title, "text") }

        <Typography variant="h3">{ strings.nameText }</Typography>
        { this.renderField("nameText", strings.nameText, "textarea") }

        <Typography variant="h3">{ strings.content }</Typography>
        { this.renderField("content", strings.content, "textarea") }

        { this.renderField("name", strings.name, "text") }
        { this.renderField("order_number", strings.orderNumber, "number") }
        { this.renderField("slug", strings.slug, "text") }
      </Grid>
    </>;
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
    if (type == "textarea") {
      return ( <TextField
        fullWidth
        multiline
        rows={8}
        style={{ margin: theme.spacing(3) }}
        type={type}
        error={message && message.type === MessageType.ERROR}
        helperText={message && message.message}
        value={values[key] || ""}
        onChange={this.onHandleChange(key)}
        onBlur={this.onHandleBlur(key)}
        name={key}
        variant="outlined"
        label={label}
      /> );
    }
    return (
      <TextField
        fullWidth
        style={{ margin: theme.spacing(3) }}
        type={type}
        error={message && message.type === MessageType.ERROR}
        helperText={message && message.message}
        value={values[key] || ""}
        onChange={this.onHandleChange(key)}
        onBlur={this.onHandleBlur(key)}
        name={key}
        variant="outlined"
        label={label}
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

    if (!childResources) {
      return <div/>
    }

    const listItems = childResources.map(resource =>{
      return(
        <ListItem>
          <ListItemText primary={ resource.name }/>
          <ListItemText primary={ resource.order_number }/>
          <ListItemText primary={ resource.type }/>
          <ListItemSecondaryAction>
            <IconButton edge="end" aria-label="delete">
              <Button onClick={ () => this.props.onDelete(resource) }>
                <DeleteIcon/>
              </Button>
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
      )
    });

    return(
      <div>
        <List component="nav" aria-label="secondary mailbox folders">
          <ListItem>
            <ListItemText primary="Sivu"/>
            <ListItemText primary="Järjestys vasemmalta oikealle"/>
            <ListItemText primary="Tyyppi"/>
          </ListItem>
          { listItems }
        </List>
      </div>
    );
  };

  /**
   * Render file uploaders for background image and custom icons
   * TODO: Icon upload needs support for multiple files. Atm only 1 file is allowed
   */
  private renderUploaderAndPreview = (title: string, uploadKey: string) => {
    const resource = this.props.resource;
    const allowedFileTypes = getAllowedFileTypes(resource.type);

    const properties = this.state.form.values.properties;
    let previewItem;
    if (properties) {
      previewItem = this.findImage(properties, uploadKey);
    }

    return <>
      <Typography variant="h4">{ title }</Typography>
      <FileUploader
        resource={ resource }
        allowedFileTypes={ allowedFileTypes }
        onSave={ this.onPropertyFileChange }
        uploadKey={ uploadKey }
      />
      { previewItem && this.renderPreview(previewItem) }
    </>
  };

  /**
   * Render preview view
   * TODO: Render preview should be own generic component that would show some stock image
   * when data contains something else then image/video 
   * @param image image url
   */
  private renderPreview = (image: string) => {
    console.log(image)
    return (
      <div style={{ marginTop: theme.spacing(2) }}>
        <GridList cellHeight={ 100 } cols={ 10 }>
          <GridListTile key={ image }>
            <img src={ image } alt="File"/>
          </GridListTile>
        </GridList>
      </div>
    )
  };

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
    // TODO: Handle error cases
    return 200;
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
