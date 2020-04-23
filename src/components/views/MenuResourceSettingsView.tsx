/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from "react";
import { withStyles, WithStyles, FormControlLabel, Checkbox, TextField, Divider, Typography, Button, TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody } from "@material-ui/core";
import MaterialTable from "material-table";
import AddIcon from "@material-ui/icons/AddBox";
import DeleteIcon from "@material-ui/icons/DeleteForever";
import CheckIcon from "@material-ui/icons/Check";
import ClearIcon from "@material-ui/icons/Clear";
import EditIcon from "@material-ui/icons/Edit";
import styles from "../../styles/editor-view";
import strings from "../../localization/strings";
import theme from "../../styles/theme";
import { Resource, ResourceToJSON, KeyValueProperty, ResourceType } from "../../generated/client/src";
import FileUpload from "../../utils/FileUpload";
import { forwardRef } from "react";
import { MessageType, initForm, Form, validateForm } from "ts-form-validation";

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
  confirmationRequired: (value: boolean) => void;
  /**
   * Update resource
   * @param resource resource to update
   */
  onUpdate: (resource: Resource) => void;

  /**
   * Delete resource
   * @param resource resource to delete
   */
  onDelete: (resource: Resource) => void;
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
  dataChanged: boolean;
  resourceMap: Map<string, string>;
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
        },
        resourceRules
      ),
      resourceMap: new Map(),
      resourceId: "",
      resourceData: {},
      updated: false,
      dataChanged: false
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
    let form = initForm<ResourceSettingsForm>(
      {
        ...this.props.resource,
      },
      resourceRules
    );

    form = validateForm(form);

    const initMap = new Map<string, string>();
    const props = resource.properties;
    if (props) {
      props.map(p => {
        initMap.set(p.key, p.value);
      });
    }

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
      childResources: childResources,
      resourceMap: initMap
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

      const initMap = new Map<string, string>();
      const props = resource.properties;
      if (props) {
        props.map(p => {
          initMap.set(p.key, p.value);
        });
      }
      let form = initForm<ResourceSettingsForm>(
        {
          ...resource,
        },
        resourceRules
      );

      form = validateForm(form);
      this.setState({
        updated: true,
        form,
        resourceData: ResourceToJSON(resource),
        childResources: childResources,
        resourceMap: initMap
      });
    }
  }

  /**
   * Component render method
   */
  public render() {
    const { updated, dataChanged } = this.state;
    if (updated) {
      this.setState({
        updated: false
      });
      return <div />;
    }

    const { isFormValid } = this.state.form;

    return (
      <div>
        <Button
          style={{ marginLeft: theme.spacing(3), marginTop: theme.spacing(1) }}
          color="primary"
          variant="outlined"
          disabled={ !isFormValid || !dataChanged }
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
        <Typography variant="h3">{ strings.advanced }</Typography>
        { this.renderFormField("name", strings.name, "text") }
        { this.renderFormField("order_number", strings.orderNumber, "number") }
        { this.renderFormField("slug", strings.slug, "text") }
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
    const { resource } = this.props;
    return (
      <>
        <Typography variant="h3">{ strings.title }</Typography>
        { this.renderPropertiesField("title", strings.title, "text") }

        <Typography variant="h3">{ strings.nameText }</Typography>
        { this.renderPropertiesField("nameText", strings.nameText, "textarea") }

        <Typography variant="h3">{ strings.content }</Typography>
        { this.renderPropertiesField("content", strings.content, "textarea") }
        { resource.type === ResourceType.SLIDESHOW && this.renderSlideShowFields() }
      </>
    );
  }

  /**
   * Renders form text field
   * @param key to look for
   * @param label label to be shown
   * @param type text field type
   */
  private renderFormField = (key: keyof ResourceSettingsForm, label: string, type: string) => {
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
        onChange={ this.onHandleResourceTextChange(key) }
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
        onChange={ this.onHandleResourceTextChange(key) }
        onBlur={ this.onHandleBlur(key) }
        name={ key }
        variant="outlined"
        label={ label }
      />
    );
  };

  /**
   * Renders properties field
   * @param key to look for
   * @param label label to be shown
   * @param type text field type
   */
  private renderPropertiesField = (key: keyof ResourceSettingsForm, label: string, type: string) => {
    const { messages: { [key]: message } } = this.state.form;
    if (type === "textarea") {
      return (
        <TextField
          fullWidth
          multiline
          rows={ 8 }
          style={{ margin: theme.spacing(3) }}
          type={ type }
          error={ message && message.type === MessageType.ERROR }
          helperText={ message && message.message }
          value={ this.state.resourceMap.get(key) || "" }
          onChange={ this.onHandleChange(key) }
          onBlur={ this.onHandleBlur(key) }
          name={ key }
          variant="outlined"
          label={ label }
        />
      );
    }
    return (
      <TextField
        fullWidth
        style={{ margin: theme.spacing(3) }}
        type={ type }
        error={ message && message.type === MessageType.ERROR }
        helperText={ message && message.message }
        value={ this.state.resourceMap.get(key) || "" }
        onChange={ this.onHandleChange(key) }
        onBlur={ this.onHandleBlur(key) }
        name={ key }
        variant="outlined"
        label={ label }
      />
    );
  };

  /**
   * Render slideshow specific fields
   */
  private renderSlideShowFields = () => {
    return <>
      { this.renderCheckbox("autoplay", strings.autoplay) }
      { this.renderCheckbox("loop", strings.loop) }
      { this.renderPropertiesField("slideTimeOnScreen", strings.slideTimeOnScreen, "text") }
    </>;
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
   * Render checkbox
   */
  private renderCheckbox = (key: keyof ResourceSettingsForm, label: string) => {
    const { resourceMap } = this.state;
    const value = (resourceMap.get(key) === "true");
    return (
      <FormControlLabel control={
        <Checkbox
          checked={ value }
          onChange={ e => this.onHandleCheckBoxChange(key, e.target.checked) }
        />} label={ label }
      />
    );
  }

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
  private onPropertyFileChange = async (files: File[], key: string) => {
    const { customerId } = this.props;

    let newUri = "";
    const file = files[0];

    if (file) {
      const response = await FileUpload.uploadFile(file, customerId);
      newUri = response.uri;
    }

    const tempMap = this.state.resourceMap;
    tempMap.set(key, newUri);
    this.setState({
      resourceMap: tempMap,
      dataChanged: true
    });

    this.onUpdateResource();
  };


  /**
   * Delete property file with key
   */
  private onPropertyFileDelete = (key: string) => {
    const tempMap = this.state.resourceMap;

    tempMap.delete(key);
    this.setState({
      resourceMap: tempMap,
      dataChanged: true
    });

    this.onUpdateResource();
  };

  /**
   * Handle resource update
   */
  private onUpdateResource = () => {
    const { onUpdate } = this.props;
    const { form, resourceData } = this.state;
    const properties: KeyValueProperty[] = [];
    this.getPropertiesToUpdate(properties);
    const resource = {
      ...this.props.resource,
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

  };

  /**
   * Handles textfields change events
   * @param key
   * @param event
   */
  private onHandleChange = (key: keyof ResourceSettingsForm) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const copy = this.state.resourceMap;
    copy.set(key, event.target.value);

    this.setState({
      resourceMap: copy,
      dataChanged: true
    });
    this.props.confirmationRequired(true);
  };

  /**
   * Handles textfields change events
   * @param key
   * @param event
   */
  private onHandleCheckBoxChange = (key: keyof ResourceSettingsForm, value: boolean) => {
    const copy = this.state.resourceMap;
    const stringValue = String(value);
    copy.set(key, stringValue);
    this.setState({
      resourceMap: copy,
      dataChanged: true
    });
    this.props.confirmationRequired(true);
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
      form,
      dataChanged: true
    });
    this.props.confirmationRequired(true);
  };

  /**
   * Push all property key value pairs from state map to properties array
   * @param properties
   */
  private getPropertiesToUpdate(properties: KeyValueProperty[]) {
    const { resourceMap } = this.state;

    resourceMap.forEach((value: string, key: string) => {
      const index = properties.findIndex((p: KeyValueProperty) => p.key === key);
      if (index > -1) {
        properties[index] = { key: key, value: value || "" };
      } else {
        properties.push({ key: key, value: value || "" });
      }
    });
  }
}

export default withStyles(styles)(MenuResourceSettingsView);
