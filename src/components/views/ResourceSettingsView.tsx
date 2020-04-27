/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from "react";
import { withStyles, WithStyles, TextField, Divider, Typography, Button, Grid } from "@material-ui/core";
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
import { Resource, ResourceToJSON, ResourceType, KeyValueProperty } from "../../generated/client/src";
import FileUpload from "../../utils/FileUpload";
import { forwardRef } from "react";
import { MessageType, initForm, Form, validateForm } from "ts-form-validation";
import logo from "../../resources/svg/oioi-logo.svg";

import { ResourceSettingsForm, resourceRules } from "../../commons/formRules";
import ImagePreview from "../generic/ImagePreview";
import VisibleWithRole from "../generic/VisibleWithRole";

/**
 * Component props
 */
interface Props extends WithStyles<typeof styles> {
  resource: Resource;
  customerId: string;

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
  confirmationRequired: (value: boolean) => void;
}

/**
 * Component state
 */
interface State {
  form: Form<ResourceSettingsForm>;
  resourceId: string;
  resourceData: any;
  updated: boolean;
  dataChanged: boolean;
}

class ResourceSettingsView extends React.Component<Props, State> {
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
          data: undefined
        },
        resourceRules
      ),

      resourceId: "",
      resourceData: {},
      updated: false,
      dataChanged: false
    };
  }

  /**
   * Component did mount
   */
  public componentDidMount() {
    const resourceId = this.props.resource.id;
    if (!resourceId) {
      return;
    }

    let form = initForm<ResourceSettingsForm>(
      {
        ...this.props.resource
      },
      resourceRules
    );

    form = validateForm(form);
    this.setState({
      form,
      resourceId: resourceId,
      resourceData: ResourceToJSON(this.props.resource)
    });
  }

  /**
   * Component did update method
   */
  public componentDidUpdate(prevProps: Props, prevState: State) {
    if (prevProps.resource !== this.props.resource) {
      const { resource } = this.props;
      let form = initForm<ResourceSettingsForm>(
        {
          ...resource
        },
        resourceRules
      );

      form = validateForm(form);
      this.setState({
        updated: true,
        form,
        resourceData: ResourceToJSON(this.props.resource)
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
      return <div></div>;
    }

    const localizedDataString = this.getLocalizedDataString();
    const dataField = this.renderDataField();

    const { isFormValid } = this.state.form;

    return (
      <div>
        <Grid>
          <Button
            style={ { marginLeft: theme.spacing(3), marginTop: theme.spacing(1) } }
            color="primary"
            variant="outlined"
            disabled={ !isFormValid || !dataChanged }
            onClick={ this.onUpdateResource }
          >
            { strings.save }
          </Button>
        </Grid>
        <Divider style={ { marginTop: theme.spacing(3), marginBottom: theme.spacing(3) } } />
        { this.renderFields() }
        <Divider style={ { marginBottom: theme.spacing(3) }} />
        <div>
          <Typography variant="h3">{ localizedDataString }</Typography>
          { dataField }
        </div>
        <Divider style={{ marginBottom: theme.spacing(3), marginTop: theme.spacing(3) }} />
        <VisibleWithRole role="admin">
          <Typography style={{ marginBottom: theme.spacing(3), marginTop: theme.spacing(3) }} variant="h3">{ strings.advanced }</Typography>
          <div style={{ display: "grid", gridAutoFlow: "column", gridGap: theme.spacing(3), marginBottom: theme.spacing(3) }}>
            <div>
              <Typography variant="h4">{ strings.orderNumber }</Typography>
              { this.renderField("order_number", strings.orderNumber, "number") }
            </div>
            <div>
              <Typography variant="h4">{ strings.orderNumber }</Typography>
              { this.renderField("slug", strings.slug, "text") }
            </div>
          </div>
          <Divider style={{ marginTop: theme.spacing(3), marginBottom: theme.spacing(3) }} />
          <div>
            { this.renderStyleTable() }
          </div>
          <Divider style={{ marginTop: theme.spacing(3), marginBottom: theme.spacing(3) }} />

          <div>
            { this.renderPropertiesTable() }
          </div>
        </VisibleWithRole>
      </div>
    );
  }

  /**
   * Render text fields
   */
  private renderFields = () => {
    return (
      <div>
        <Typography variant="h4">{ strings.name }</Typography>
        { this.renderField("name", strings.name, "text") }
      </div>
    );
  }

  /**
   * Renders textfield
   * @param key to look for
   * @param placeholder placeholder text to be shown
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
        error={ message && message.type === MessageType.ERROR}
        helperText={ message && message.message}
        value={ values[key] || "" }
        onChange={ this.onHandleChange(key) }
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
        onChange={ this.onHandleChange(key) }
        onBlur={ this.onHandleBlur(key) }
        name={ key }
        variant="outlined"
        placeholder={ placeholder }
      />
    );
  };

  /**
   * Render table that contains style data
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
        data={ resourceData["styles"] }
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
   * Render table that constain properties data
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
   * Render file drop zone method
   */
  private renderDataField = () => {
    const { resource } = this.props;
    const resourceType = resource.type;
    if (resourceType === ResourceType.TEXT) {
      return (
        <TextField
          fullWidth
          name="data"
          value={ this.state.form.values.data }
          onChange={ this.onDataChange }
          label={ strings.resourceTypes.text }
          multiline
          rows="8"
          margin="normal"
          variant="outlined"
        />
      );
    } else {
      const fileData = this.state.form.values.data || logo;

      return <>
        <ImagePreview
          imagePath={ fileData }
          onSave={ this.onFileChange }
          resource={ resource }
          uploadKey={ "data" }
          onDelete={ this.onPropertyFileDelete }
        />
      </>;
    }
  };

  /**
   * Get localized string for data type method
   */
  private getLocalizedDataString = (): string => {
    const { resource } = this.props;
    const resourceType = resource.type;
    switch (resourceType) {
      case ResourceType.IMAGE: {
        return strings.resourceTypes.image;
      }
      case ResourceType.PDF: {
        return strings.resourceTypes.pdf;
      }
      case ResourceType.TEXT: {
        return strings.resourceTypes.text;
      }
      case ResourceType.VIDEO: {
        return strings.resourceTypes.video;
      }
      default: {
        return strings.file;
      }
    }
  };

  /**
   * Handles file change
   * @param files files to change
   */
  private onFileChange = async (files: File[]) => {
    const { customerId } = this.props;
    const { resourceData } = this.state;

    const file = files[0];
    if (file) {
      const response = await FileUpload.uploadFile(file, customerId);
      resourceData["data"] = response.uri;
    } else {
      resourceData["data"] = undefined;
    }
    this.setState({
      resourceData: resourceData
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
   * Handles data change
   */
  private onDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { resourceData } = this.state;
    resourceData[e.target.name] = e.target.value;

    this.setState({
      resourceData: resourceData,
      dataChanged: true
    });
    this.props.confirmationRequired(true);
  };

  /**
   * On update resource method
   */
  private onUpdateResource = () => {
    const { onUpdate } = this.props;
    const { resourceData } = this.state;

    const resource = {
      ...this.state.form.values,
      data: this.state.resourceData["data"],
      styles: this.state.resourceData["styles"],
      properties: this.state.resourceData["properties"]
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
      form:form,
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
      form: form,
      dataChanged: true
    });

    this.props.confirmationRequired(true);
  };
}

export default withStyles(styles)(ResourceSettingsView);
