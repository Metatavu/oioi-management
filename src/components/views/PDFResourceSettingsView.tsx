/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from "react";
import { withStyles, WithStyles, TextField, Divider, Typography, Button, Box } from "@material-ui/core";
import MaterialTable from "material-table";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import DeleteIcon from "@material-ui/icons/Delete";
import CheckIcon from "@material-ui/icons/Check";
import ClearIcon from "@material-ui/icons/Clear";
import EditIcon from "@material-ui/icons/Edit";
import styles from "../../styles/editor-view";
import strings from "../../localization/strings";
import { Resource, ResourceToJSON } from "../../generated/client/src";
import { forwardRef } from "react";
import { MessageType, initForm, Form, validateForm } from "ts-form-validation";
import { AuthState, ErrorContextType } from "../../types";
import { resourceRules, ResourceSettingsForm } from "../../commons/formRules";
import VisibleWithRole from "../generic/VisibleWithRole";
import { ErrorContext } from "../containers/ErrorHandler";
import PDFPreview from "../generic/PDFPreview";

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
  onSave: (resource: Resource) => void;
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
  loading: boolean;
  dataChanged: boolean;
}

/**
 * Component for Slideshow PDF resource settings view
 */
class PDFResourceSettingsView extends React.Component<Props, State> {

  static contextType: React.Context<ErrorContextType> = ErrorContext;

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
          orderNumber: undefined,
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
   * Component did mount life cycle handler
   */
  public componentDidMount = async () => {
    const { auth } = this.props;
    if (!auth || !auth.token) {
      return;
    }

    this.updateComponentData();
  }

  /**
   * Component did update  life cycle handler
   *
   * @param prevProps previous props
   * @param prevState previous state
   */
  public componentDidUpdate = async (prevProps: Props, prevState: State) => {
    const { auth, resource, resourcesUpdated } = this.props;
    if (prevProps.resource !== resource || prevProps.resourcesUpdated !== resourcesUpdated) {
      if (!auth || !auth.token) {
        return;
      }

      this.updateComponentData();
    }
  }

  /**
   * Component render method
   */
  public render = () => {
    const { loading, dataChanged } = this.state;
    const { classes, resource } = this.props;

    if (loading) {
      return;
    }

    const { isFormValid } = this.state.form;

    return (
      <Box>
        <Button
          className={ classes.saveButton }
          color="primary"
          variant="outlined"
          disabled={ !isFormValid || !dataChanged }
          onClick={ this.onSaveChanges }
        >
          { strings.save }
        </Button>

        <Box mb={ 1 }>
          <Typography variant="h4">
            { strings.name }
          </Typography>
        </Box>
        { this.renderField("name", strings.name, "text") }
        { this.renderUploaderAndPreview() }
        <Box mt={ 3 } mb={ 3 }>
          <Divider/>
        </Box>
        <VisibleWithRole role="admin">
          <Box mt={ 3 } mb={ 3 }>
            <Typography variant="h3">
              { strings.advanced }
            </Typography>
          </Box>
          { this.renderResourceFields() }

          <Box>
            { this.renderPropertiesTable() }
            <Box mt={ 3 } mb={ 3 }>
              <Divider/>
            </Box>
          </Box>

          <Box>
            { this.renderStyleTable() }
            <Box mt={ 3 } mb={ 3 }>
              <Divider/>
            </Box>
          </Box>
        </VisibleWithRole>
      </Box>
    );
  }

  /**
   * Renders resource text fields
   */
  private renderResourceFields = () => (
    <Box mb={ 3 } display="flex" flexDirection="row">
      <Box mb={ 1 } mr={ 2 }>
        <Typography variant="h4">
          { strings.orderNumber }
        </Typography>
        { this.renderField("orderNumber", strings.orderNumber, "number") }
      </Box>
      <Box mb={ 1 }>
        <Typography variant="h4">
          { strings.slug }
        </Typography>
        { this.renderField("slug", strings.slug, "text") }
      </Box>
    </Box>
  );

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
          Add: forwardRef((props, ref) => <AddCircleIcon color="secondary" { ...props } ref={ ref } />),
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
            new Promise<void>((resolve, reject) => {
              {
                const { resourceData } = this.state;
                const styles = resourceData["styles"];
                styles.push(newData);
                resourceData["styles"] = styles;
                this.props.confirmationRequired(true);
                this.setState({
                  resourceData: resourceData,
                  dataChanged: true
                }, () => resolve());
              }
              resolve();
            }),
          onRowUpdate: (newData, oldData) =>
            new Promise<void>((resolve, reject) => {
              {
                const { resourceData } = this.state;
                const styles = resourceData["styles"];
                const index = styles.indexOf(oldData);
                styles[index] = newData;
                resourceData["styles"] = styles;
                this.props.confirmationRequired(true);
                this.setState({
                  resourceData: resourceData,
                  dataChanged: true
                }, () => resolve());
              }
              resolve();
            }),
          onRowDelete: oldData =>
            new Promise<void>((resolve, reject) => {
              {
                const { resourceData } = this.state;
                const styles = resourceData["styles"];
                const index = styles.indexOf(oldData);
                styles.splice(index, 1);
                resourceData["styles"] = styles;
                this.props.confirmationRequired(true);
                this.setState({
                  resourceData: resourceData,
                  dataChanged: true
                }, () => resolve());
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
          Add: forwardRef((props, ref) => <AddCircleIcon color="secondary" { ...props } ref={ ref } />),
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
            new Promise<void>((resolve, reject) => {
              {
                const { resourceData } = this.state;
                const properties = resourceData["properties"];
                properties.push(newData);
                resourceData["properties"] = properties;
                this.props.confirmationRequired(true);
                this.setState({
                  resourceData: resourceData,
                  dataChanged: true
                }, () => resolve());
              }
              resolve();
            }),
          onRowUpdate: (newData, oldData) =>
            new Promise<void>((resolve, reject) => {
              {
                const { resourceData } = this.state;
                const properties = resourceData["properties"];
                const index = properties.indexOf(oldData);
                properties[index] = newData;
                resourceData["properties"] = properties;
                this.props.confirmationRequired(true);
                this.setState({
                  resourceData: resourceData,
                  dataChanged: true
                }, () => resolve());
              }
              resolve();
            }),
          onRowDelete: oldData =>
            new Promise<void>((resolve, reject) => {
              {
                const { resourceData } = this.state;
                const properties = resourceData["properties"];
                const index = properties.indexOf(oldData);
                properties.splice(index, 1);
                resourceData["properties"] = properties;
                this.props.confirmationRequired(true);
                this.setState({
                  resourceData: resourceData,
                  dataChanged: true
                }, () => resolve());
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
   * Renders file uploaders for background image and custom icons
   */
  private renderUploaderAndPreview = () => {
    const { resourceData } = this.state;
    const { resource } = this.props;

    if (!resource.id) {
      return;
    }

    const previewItem = resourceData.data || "";

    return (
      <PDFPreview
        uploadButtonText={ previewItem ? strings.fileUpload.changeFile : strings.fileUpload.addFile }
        path={ previewItem }
        allowSetUrl={ true }
        onDelete={ this.onPdfFileDelete }
        onUpload={ this.onPdfFileChange }
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

    const resourceData = ResourceToJSON(resource);
    const form = validateForm(
      initForm<ResourceSettingsForm>(resource, resourceRules)
    );

    this.setState({
      form,
      resourceId,
      resourceData,
    });
  }

  /**
   * Handles save changes to resource and child resources
   */
  private onSaveChanges = async () => {
    const { onSave } = this.props;
    const { resourceData, form } = this.state;

    const resource = {
      name: form.values.name,
      orderNumber: form.values.orderNumber,
      slug: form.values.slug,
      parentId: form.values.parentId,
      type: form.values.type,
      id: form.values.id,
      data: resourceData["data"],
      styles: resourceData["styles"],
      properties: resourceData["properties"]
    } as Resource;

    onSave(resource);

    this.setState({
      resourceData,
      dataChanged: false
    });
  };

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
   * Handles pdf file change
   *
   * @param newUri new URI
   * @param resourceId resource id
   */
  private onPdfFileChange = (newUri: string) => {
    const { resourceData } = this.state;

    this.setState({
      resourceData: { ...resourceData, data: newUri },
      dataChanged: true
    });
  };

  /**
   * Handles pdf file delete
   */
  private onPdfFileDelete = () => {
    const { resourceData } = this.state;

    this.setState({
      resourceData: { ...resourceData, data: undefined },
      dataChanged: true
    });
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

export default withStyles(styles)(PDFResourceSettingsView);