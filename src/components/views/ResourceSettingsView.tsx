/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from "react";
import { withStyles, WithStyles, TextField, Divider, Typography, Button, Box, Accordion, AccordionDetails, AccordionSummary, Paper } from "@material-ui/core";
import MaterialTable from "material-table";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import DeleteIcon from "@material-ui/icons/Delete";
import CheckIcon from "@material-ui/icons/Check";
import ClearIcon from "@material-ui/icons/Clear";
import EditIcon from "@material-ui/icons/Edit";
import styles from "styles/editor-view";
import strings from "localization/strings";
import { Resource, ResourceToJSON, ResourceType } from "generated/client";
import { forwardRef } from "react";
import { MessageType, initForm, Form, validateForm } from "ts-form-validation";
import { ResourceSettingsForm, resourceRules } from "commons/formRules";
import ImagePreview from "../generic/ImagePreview";
import VisibleWithRole from "../generic/VisibleWithRole";
import { ErrorContextType } from "types";
import { ErrorContext } from "../containers/ErrorHandler";
import StyledMTableToolbar from "../../styles/generic/styled-mtable-toolbar";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

/**
 * Component props
 */
interface Props extends WithStyles<typeof styles> {
  resource: Resource;
  customerId: string;
  onUpdate: (resource: Resource) => void;
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

/**
 * Component for resource settings view
 */
class ResourceSettingsView extends React.Component<Props, State> {

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
   * Component did mount life cycle handler
   */
  public componentDidMount = () => {
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
   * Component did update life cycle handler
   *
   * @param prevProps previous props
   * @param prevState previous state
   */
  public componentDidUpdate = (prevProps: Props, prevState: State) => {
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
  public render = () => {
    const { updated, dataChanged } = this.state;
    const { classes } = this.props;

    if (updated) {
      this.setState({
        updated: false
      });
      return <div></div>;
    }

    const localizedDataString = this.getLocalizedDataString();

    const { isFormValid } = this.state.form;

    return (
      <Box>
        <Button
          className={ classes.saveButton }
          color="primary"
          variant="outlined"
          disabled={ !isFormValid || !dataChanged }
          onClick={ this.onUpdateResource }
        >
          { strings.save }
        </Button>
        { this.renderFields() }
        <Box mb={ 3 }>
          <Divider/>
        </Box>
        <Box>
          { this.renderDataField(localizedDataString) }
        </Box>
        <VisibleWithRole role="admin">
          { this.renderAdvancedSettings() }
        </VisibleWithRole>
      </Box>
    );
  }

  /**
   * Render text fields
   */
  private renderFields = () => {
    return (
      <Box>
        { this.renderField("name", strings.name, "text") }
      </Box>
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
        label={ placeholder }
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
        label={ placeholder }
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
        data={ resourceData["styles"] }
        editable={{
          onRowAdd: newData =>
            new Promise<void>((resolve, reject) => {
              {
                const { resourceData } = this.state;
                const styles = resourceData["styles"];
                styles.push(newData);
                resourceData["styles"] = styles;
                this.setState({ resourceData: resourceData, dataChanged: true }, () => resolve());
                this.props.confirmationRequired(true);
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
                this.setState({ resourceData: resourceData, dataChanged: true }, () => resolve());
                this.props.confirmationRequired(true);
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
                this.setState({ resourceData: resourceData, dataChanged: true }, () => resolve());
                this.props.confirmationRequired(true);
              }
              resolve();
            })
        }}
        title={ strings.styles }
        components={{
          Toolbar: props => (
            <StyledMTableToolbar { ...props } />
          ),
          Container: props => <Paper { ...props } elevation={ 0 } />
        }}
        localization={{
          body: {
            editTooltip: strings.edit,
            deleteTooltip: strings.delete,
            addTooltip: strings.addNew
          },
          header: {
            actions: strings.actions
          }
        }}
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
          showSelectAllCheckbox: false,
          actionsColumnIndex: 3
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
                this.setState({ resourceData: resourceData, dataChanged: true }, () => resolve());
                this.props.confirmationRequired(true);
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
                this.setState({ resourceData: resourceData, dataChanged: true }, () => resolve());
                this.props.confirmationRequired(true);
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
                this.setState({ resourceData: resourceData, dataChanged: true }, () => resolve());
                this.props.confirmationRequired(true);
              }
              resolve();
            })
        }}
        title={ strings.properties }
        components={{
          Toolbar: props => (
            <StyledMTableToolbar { ...props } />
          ),
          Container: props => <Paper { ...props } elevation={ 0 } />
        }}
        localization={{
          body: {
            editTooltip: strings.edit,
            deleteTooltip: strings.delete,
            addTooltip: strings.addNew
          },
          header: {
            actions: strings.actions
          }
        }}
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
          showSelectAllCheckbox: false,
          actionsColumnIndex: 3
        }}
      />
    )
  };

  /**
   * Render file drop zone method
   */
  private renderDataField = (label: string) => {
    const { resource } = this.props;
    const resourceType = resource.type;

    if (resourceType === ResourceType.TEXT) {
      return (
        <TextField
          fullWidth
          name="data"
          value={ this.state.resourceData ? this.state.resourceData["data"] : undefined }
          onChange={ this.onDataChange }
          label={ label }
          multiline
          margin="normal"
          variant="outlined"
        />
      );
    } else {
      const fileData = this.state.form.values.data || "";

      return (
        <ImagePreview
          uploadButtonText={ fileData ? strings.fileUpload.changeFile : strings.fileUpload.addFile }
          imagePath={ fileData }
          allowSetUrl={ true }
          onUpload={ this.onFileOrUriChange }
          onSetUrl={ this.onFileOrUriChange }
          resource={ resource }
          uploadKey="data"
          onDelete={ this.onImageFileDelete }
        />
      );
    }
  };

  /**
   * Renders advanced settings
   */
  private renderAdvancedSettings = () => {
    return (
      <Box mt={ 3 }>
        <Accordion>
          <AccordionSummary
            expandIcon={ <ExpandMoreIcon color="primary" /> }
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Typography variant="h4">
              { strings.applicationSettings.advancedSettings }
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box
              mt={ 3 }
              mb={ 3 }
              display="flex"
              flexDirection="row"
            >
              <Box mb={ 1 } mr={ 2 }>
                { this.renderField("orderNumber", strings.orderNumber, "number") }
              </Box>
              <Box ml={ 1 }>
                { this.renderField("slug", strings.slug, "text") }
              </Box>
            </Box>
            <Box mb={ 4 }>
              { this.renderPropertiesTable() }
            </Box>
            <Box>
              { this.renderStyleTable() }
            </Box>
          </AccordionDetails>
        </Accordion>
      </Box>
    );
  }

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
   * Handles file and URI change
   *
   * @param newUri new URI
   * @param key resource key
   */
  private onFileOrUriChange = (newUri: string, key: string) => {
    const { resourceData } = this.state;
    resourceData[key] = newUri;

    this.setState({ resourceData: resourceData });
    this.onUpdateResource();
  };

  /**
   * Handles image delete
   */
  private onImageFileDelete = (key?: string) => {
    const { resourceData } = this.state;
    resourceData["data"] = "";
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
      resourceData: resourceData,
      dataChanged: false
    });
  };

  /**
   * Handles text fields change events
   *
   * @param key key
   * @param event React change event
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