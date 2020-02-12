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
import { Resource, ResourceToJSON, ResourceFromJSON, ResourceType } from "../../generated/client/src";
import FileUpload from "../../utils/FileUpload";
import { forwardRef } from "react";
import { FormValidationRules, MessageType, initForm, Form, validateForm } from "ts-form-validation";

interface Props extends WithStyles<typeof styles> {
  resource: Resource;
  customerId: string;
  onUpdate(resource: Resource): void;
  onDelete(resource: Resource): void;
}

interface ResourceSettingsForm extends Partial<Resource> {}

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
        rules
      ),

      resourceId: "",
      resourceData: {}
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
      let form = initForm<ResourceSettingsForm>(
        {
          ...resource
        },
        rules
      );

      form = validateForm(form);

      this.setState({
        form,
        resourceData: ResourceToJSON(this.props.resource)
      });
    }
  }

  /**
   * Component render method
   */
  public render() {
    const { resourceData } = this.state;
    const { isFormValid } = this.state.form;

    const localizedDataString = this.getLocalizedDataString();
    const dataField = this.renderDataField();

    return (
      <div>
        {this.renderField("name", strings.name, "text")}
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
          <Typography variant="h3">{localizedDataString}</Typography>
          {dataField}
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
    return (
      <TextField
        style={{ marginLeft: theme.spacing(3) }}
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
  private renderDataField = () => {
    const { classes, resource } = this.props;
    const resourceType = resource.type;

    if (resourceType === ResourceType.TEXT) {
      return (
        <TextField
          fullWidth
          name="data"
          value={this.state.form.values.data}
          onChange={this.onDataChange}
          label={strings.text}
          multiline
          rows="8"
          margin="normal"
          variant="outlined"
        />
      );
    } else {
      const allowedFileTypes = this.getAllowedFileTypes();
      const fileData = this.state.form.values.data;

      if (fileData) {
        return (
          <DropzoneArea
            acceptedFiles={allowedFileTypes}
            filesLimit={1}
            dropzoneClass={classes.dropzone}
            dropzoneParagraphClass={classes.dropzoneText}
            dropzoneText={strings.dropFile}
            onChange={this.onImageChange}
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
              acceptedFiles={allowedFileTypes}
              filesLimit={1}
              dropzoneClass={classes.dropzone}
              dropzoneParagraphClass={classes.dropzoneText}
              dropzoneText={strings.dropFile}
              showFileNamesInPreview={true}
              onChange={this.onImageChange}
            />
          </Grid>
        );
      }
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
        return strings.image;
      }
      case ResourceType.PDF: {
        return strings.pdf;
      }
      case ResourceType.TEXT: {
        return strings.text;
      }
      case ResourceType.VIDEO: {
        return strings.video;
      }
      default: {
        return strings.file;
      }
    }
  };

  /**
   * Get file types for resource type method
   */
  private getAllowedFileTypes = (): string[] => {
    const { resource } = this.props;
    const resourceType = resource.type;
    switch (resourceType) {
      case ResourceType.IMAGE: {
        return ["image/*"];
      }
      case ResourceType.PDF: {
        return ["application/pdf"];
      }
      case ResourceType.VIDEO: {
        return ["video/*"];
      }
      default: {
        return [];
      }
    }
  };

  /**
   * Handles image change
   */
  private onImageChange = async (files: File[]) => {
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
  };

  /**
   * Handles data change
   */
  private onDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { resourceData } = this.state;
    resourceData[e.target.name] = e.target.value;

    this.setState({
      resourceData: resourceData
    });
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

export default withStyles(styles)(ResourceSettingsView);
