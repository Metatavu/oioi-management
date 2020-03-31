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
import { DropzoneArea } from "material-ui-dropzone";
import strings from "../../localization/strings";
import theme from "../../styles/theme";
import { Resource, ResourceToJSON, ResourceFromJSON, ResourceType, KeyValuePropertyFromJSON, KeyValueProperty } from "../../generated/client/src";
import FileUpload from "../../utils/FileUpload";
import { forwardRef } from "react";
import { FormValidationRules, MessageType, initForm, Form, validateForm } from "ts-form-validation";

interface Props extends WithStyles<typeof styles> {
  resource: Resource;
  customerId: string;
  onUpdate(resource: Resource): void;
  onDelete(resource: Resource): void;
}

interface ResourceSettingsForm extends Partial<Resource> {
  nameText?: string,
  title?: string,
  content?: string
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

interface State {
  form: Form<ResourceSettingsForm>;
  resourceId: string;
  resourceData: any;
  updated: boolean;
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
  public componentDidMount() {
    const resourceId = this.props.resource.id;
    if (!resourceId) {
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
        resourceData: ResourceToJSON(this.props.resource)
      });
    }
  }

  /**
   * Component render method
   */
  public render() {
    const { resourceData, updated } = this.state;
    const { isFormValid } = this.state.form;

    if (updated) {
      this.setState({
        updated: false
      });
      return <div></div>;
    }

    const backgroundField = this.renderPropertyFileField("background");
    const menuImgField = this.renderPropertyFileField("menuImg");

    return (
      <div>
        {this.renderField("name", strings.name, "text")}
        {this.renderField("nameText", "nameText", "textarea")}
        {this.renderField("title", "title", "text")}
        {this.renderField("content", "content", "textarea")}
        {this.renderField("order_number", strings.orderNumber, "number")}
        {this.renderField("slug", strings.slug, "text")}
        
        <Button
          style={{ marginLeft: theme.spacing(3), marginTop: theme.spacing(1) }}
          color="primary"
          variant="contained"
          startIcon={<SaveIcon />}
          disabled={!isFormValid}
          onClick={this.onUpdateResource}
        >
          {strings.save}
        </Button>
        <Divider style={{ marginBottom: theme.spacing(3) }} />
        <div>
          <Typography variant="h3">Taustakuva</Typography>
          {backgroundField}
        </div>
        <Divider style={{ marginTop: theme.spacing(3), marginBottom: theme.spacing(3) }} />
        <Divider style={{ marginBottom: theme.spacing(3) }} />
        <div>
          <Typography variant="h3">Valikkokuva</Typography>
          {menuImgField}
        </div>
        <Divider style={{ marginTop: theme.spacing(3), marginBottom: theme.spacing(3) }} />
        <div>
          <MaterialTable
            icons={{
              Add: forwardRef((props, ref) => <AddIcon {...props} ref={ref} />),
              Delete: forwardRef((props, ref) => <DeleteIcon {...props} ref={ref} />),
              Check: forwardRef((props, ref) => <CheckIcon {...props} ref={ref} />),
              Clear: forwardRef((props, ref) => <ClearIcon {...props} ref={ref} />),
              Edit: forwardRef((props, ref) => <EditIcon {...props} ref={ref} />)
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
            title={strings.styles}
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
        </div>
        <Divider style={{ marginTop: theme.spacing(3), marginBottom: theme.spacing(3) }} />
        <div>
          <MaterialTable
            icons={{
              Add: forwardRef((props, ref) => <AddIcon {...props} ref={ref} />),
              Delete: forwardRef((props, ref) => <DeleteIcon {...props} ref={ref} />),
              Check: forwardRef((props, ref) => <CheckIcon {...props} ref={ref} />),
              Clear: forwardRef((props, ref) => <ClearIcon {...props} ref={ref} />),
              Edit: forwardRef((props, ref) => <EditIcon {...props} ref={ref} />)
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
            title={strings.properties}
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
        </div>
      </div>
    );
  }

  /**
   * Renders textfield
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
   * Render file drop zone method
   */
  private renderPropertyFileField = (key: string) => {
    const { classes, resource } = this.props;
    const { resourceData } = this.state;
    const allowedFileTypes = ["image/*", "video/*"];
    const property = (resourceData.properties || []).find((p: KeyValueProperty) => p.key === key);

    const fileData = property ? property.value : undefined;

    if (fileData) {
      return (
        <DropzoneArea
          key={resource.id}
          acceptedFiles={allowedFileTypes}
          filesLimit={1}
          maxFileSize={30000000}
          dropzoneClass={classes.dropzone}
          dropzoneParagraphClass={classes.dropzoneText}
          dropzoneText={strings.dropFile}
          onChange={(files) => this.onPropertyFileChange(files, key)}
          showPreviews={true}
          showPreviewsInDropzone={false}
          showFileNamesInPreview={true}
          initialFiles={[fileData]}
        />
      );
    } else {
      return (
        <Grid item className={classes.fullWidth}>
          <DropzoneArea
            key={resource.id}
            acceptedFiles={allowedFileTypes}
            filesLimit={1}
            maxFileSize={30000000}
            dropzoneClass={classes.dropzone}
            dropzoneParagraphClass={classes.dropzoneText}
            dropzoneText={strings.dropFile}
            showFileNamesInPreview={true}
            onChange={(files) => this.onPropertyFileChange(files, key)}
          />
        </Grid>
      );
    }
  };

  /**
   * Handles image change
   */
  private onPropertyFileChange = async (files: File[], key: string) => {
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
      properties: properties
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
