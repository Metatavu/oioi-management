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
import { Resource, ResourceType } from "generated/client";
import { forwardRef } from "react";
import { MessageType, initForm, Form, validateForm } from "ts-form-validation";
import { ResourceSettingsForm, resourceRules } from "commons/formRules";
import MediaPreview from "../generic/MediaPreview";
import AdminOnly from "components/containers/AdminOnly";
import { ErrorContextType } from "types";
import { ErrorContext } from "../containers/ErrorHandler";
import StyledMTableToolbar from "../../styles/generic/styled-mtable-toolbar";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { nanoid } from "@reduxjs/toolkit";
import { ResourceUtils } from "utils/resource";
import WithDebounce from "components/generic/with-debounce";
import { ColorResult, SketchPicker } from "react-color";

/**
 * Component props
 */
interface Props extends WithStyles<typeof styles> {
  resource: Resource;
  customerId: string;
  onUpdate: (resource: Resource) => void;
  confirmationRequired: (value: boolean) => void;
}

/**
 * Component state
 */
interface State {
  form: Form<ResourceSettingsForm>;
  resourceId: string;
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
      form: initForm<ResourceSettingsForm>({
        name: undefined,
        orderNumber: undefined,
        slug: undefined,
        data: undefined,
        styles: undefined,
        properties: undefined
      }, resourceRules),
      resourceId: "",
      dataChanged: false
    };
  }

  /**
   * Component did mount life cycle handler
   */
  public componentDidMount = () => {
    const { resource } = this.props;
    const resourceId = resource.id;

    if (!resourceId) {
      return;
    }

    this.setState({
      form: validateForm(initForm<ResourceSettingsForm>({ ...resource }, resourceRules)),
      resourceId: resourceId
    });
  }

  /**
   * Component did update life cycle handler
   *
   * @param prevProps previous props
   */
  public componentDidUpdate = (prevProps: Props) => {
    const { resource } = this.props;

    if (prevProps.resource !== resource) {
      this.setState({
        form: validateForm(initForm<ResourceSettingsForm>({ ...resource }, resourceRules))
      });
    }
  }

  /**
   * Component render method
   */
  public render = () => {
    const { classes } = this.props;
    const { dataChanged, form } = this.state;
    const { isFormValid } = form;

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
          { this.renderDataField(this.getLocalizedDataString()) }
        </Box>
        <AdminOnly>
          { this.renderAdvancedSettings() }
        </AdminOnly>
      </Box>
    );
  }

  /**
   * Render text fields
   */
  private renderFields = () => {
    return (
      <Box>
        { this.renderField("name", strings.commonSettingsTexts.name, "text") }
      </Box>
    );
  }

  /**
   * Renders text field
   *
   * @param key to look for
   * @param placeholder placeholder text to be shown
   * @param type text field type
   */
  private renderField = (key: keyof ResourceSettingsForm, placeholder: string, type: string) => {
    const { form } = this.state;
    const { values, messages: { [key]: message } } = form;

    return (
      <WithDebounce
        name={ key }
        label={ placeholder }
        component={ props => (
          <TextField
            { ...props }
            fullWidth
            type={ type }
            variant="outlined"
            multiline={ type === "textarea" }
            rows={ type === "textarea" ? 8 : undefined }
            error={ message && message.type === MessageType.ERROR }
            helperText={ message && message.message }
            onBlur={ this.onHandleBlur(key) }
          />
        )}
        onChange={ this.onHandleChange(key) }
        debounceTimeout={ 300 }
        value={ values[key]?.toString() || "" }
      />
    );
  };

  /**
   * Render table that contains style data
   */
  private renderStyleTable = () => {
    const { form } = this.state;

    return (
      <MaterialTable
        key={ nanoid() }
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
        data={ form.values.styles || [] }
        editable={{
          onRowAdd: async newStyle => {
            const updatedFormValues = { ...form.values };
            updatedFormValues.styles?.push(newStyle);
            this.props.confirmationRequired(true);

            this.setState({
              dataChanged: true,
              form: { ...form, values: updatedFormValues }
            });
          },
          onRowUpdate: async (newStyle, oldStyle) => {
            const updatedFormValues = { ...form.values };
            updatedFormValues.styles?.splice(
              updatedFormValues.styles.findIndex(style => style.key === oldStyle?.key),
              1,
              newStyle
            );
            this.props.confirmationRequired(true);

            this.setState({
              dataChanged: true,
              form: { ...form, values: updatedFormValues }
            });
          },
          onRowDelete: async styleToDelete => {
            const updatedFormValues = { ...form.values };
            updatedFormValues.styles?.splice(
              updatedFormValues.styles.findIndex(style => style.key === styleToDelete.key),
              1
            );
            this.props.confirmationRequired(true);

            this.setState({
              dataChanged: true,
              form: { ...form, values: updatedFormValues }
            });
          }
        }}
        title={ strings.styles }
        components={{
          Toolbar: props => <StyledMTableToolbar { ...props } />,
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
   * Render table that contains properties data
   */
  private renderPropertiesTable = () => {
    const { form } = this.state;

    return (
      <MaterialTable
        key={ nanoid() }
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
        data={ form.values.properties || [] }
        editable={{
          onRowAdd: async newProperty => {
            const updatedFormValues = { ...form.values };
            updatedFormValues.properties?.push(newProperty);
            this.props.confirmationRequired(true);

            this.setState({
              dataChanged: true,
              form: { ...form, values: updatedFormValues }
            });
          },
          onRowUpdate: async (updatedProperty, prevProperty) => {
            const updatedFormValues = { ...form.values };
            updatedFormValues.properties?.splice(
              updatedFormValues.properties.findIndex(property => property.key === prevProperty?.key),
              1,
              updatedProperty
            );
            this.props.confirmationRequired(true);

            this.setState({
              dataChanged: true,
              form: { ...form, values: updatedFormValues }
            });
          },
          onRowDelete: async propertyToDelete => {
            const updatedFormValues = { ...form.values };
            updatedFormValues.properties?.splice(
              updatedFormValues.properties.findIndex(property => property.key === propertyToDelete.key),
              1
            );
            this.props.confirmationRequired(true);

            this.setState({
              dataChanged: true,
              form: { ...form, values: updatedFormValues }
            });
          }
        }}
        title={ strings.properties }
        components={{
          Toolbar: props => <StyledMTableToolbar { ...props } />,
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
   *
   * @param label label
   */
  private renderDataField = (label: string) => {
    const { resource } = this.props;
    const { form } = this.state;

    if (resource.type === ResourceType.TEXT) {
      return (
        <TextField
          fullWidth
          name="data"
          value={ form.values.data || "" }
          onChange={ this.onDataChange }
          label={ label }
          multiline
          margin="normal"
          variant="outlined"
        />
      );
    }
    if (resource.type === ResourceType.COLOR) {
      return (
        <SketchPicker
          color={ form.values.data && JSON.parse(form.values.data).hsl }
          onChangeComplete={ (color: ColorResult) => this.onColorChange(color) }
        />
      );
    }

    return (
      <MediaPreview
        uploadButtonText={ form.values.data ? strings.fileUpload.changeFile : strings.fileUpload.addFile }
        resourcePath={ form.values.data || "" }
        allowSetUrl
        onUpload={ this.onFileOrUriChange }
        onSetUrl={ this.onFileOrUriChange }
        resource={ resource }
        uploadKey="data"
        onDelete={ this.onImageFileDelete }
        handleVideoPropertiesChange={ this.onDataChange }
      />
    );
  };

  /**
   * Renders advanced settings
   */
  private renderAdvancedSettings = () => {
    return (
      <Box mt={ 3 }>
        <Accordion>
          <AccordionSummary expandIcon={ <ExpandMoreIcon color="primary" /> }>
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

    switch (resource.type) {
      case ResourceType.IMAGE: return strings.resourceTypes.image;
      case ResourceType.PDF: return strings.resourceTypes.pdf;
      case ResourceType.TEXT: return strings.resourceTypes.text;
      case ResourceType.VIDEO: return strings.resourceTypes.video;
      case ResourceType.COLOR: return strings.resourceTypes.color;
      default: return strings.file;
    }
  };

  /**
   * Event handler for file and URI change
   *
   * @param newUri new URI
   * @param key resource key
   * @param fileType file type
   */
  private onFileOrUriChange = (newUri: string, _: string, fileType?: string) => {
    const { confirmationRequired } = this.props;
    const { form } = this.state;
    const updatedValues = { ...form.values };

    updatedValues.data = newUri;

    const resourceType = ResourceUtils.getResourceTypeFromFileType(fileType);

    if (resourceType && resourceType !== updatedValues.type) {
      updatedValues.type = resourceType;
    }

    this.setState({
      dataChanged: true,
      form: { ...form, values: updatedValues }
    });

    confirmationRequired(true);
  };

  /**
   * Handles image delete
   */
  private onImageFileDelete = () => {
    const { confirmationRequired } = this.props;
    const { form } = this.state;

    this.setState({
      dataChanged: true,
      form: { ...form, values: { ...form.values, data: "" } }
    });

    confirmationRequired(true);
  };

  /**
   * Event handler for data change
   *
   * @param event change event
   */
  private onDataChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { confirmationRequired } = this.props;
    const { form } = this.state;
    const { name, value } = event.target;

    if (name === "loop") {
      const checked = (event.target as HTMLInputElement).checked;
      const updatedProperties = (form.values.properties || []).map(property =>
        property.key === name ? { ...property, value: String(checked) } : property
      );

      if (!updatedProperties.some(property => property.key === name)) {
        updatedProperties.push({ key: name, value: String(checked) });
      }

      this.setState({
        dataChanged: true,
        form: {
          ...form,
          values: {
            ...form.values,
            properties: updatedProperties
          }
        }
      });
    } else if (name === "volume") {
      let value = parseFloat(event.target.value);

      if (value > 2) {
        value = 2;
      }

      const updatedProperties = (form.values.properties || []).map(property =>
        property.key === name ? { ...property, value: String(value || 0) } : property
      );

      if (!updatedProperties.some(property => property.key === name)) {
        updatedProperties.push({ key: name, value: String(value || 0) });
      }

      this.setState({
        dataChanged: true,
        form: {
          ...form,
          values: {
            ...form.values,
            properties: updatedProperties
          }
        }
      });
    } else {
      this.setState({
        dataChanged: true,
        form: { ...form, values: { ...form.values, [name]: value } }
      });
    }

    confirmationRequired(true);
  };

  /**
   * Event handler for color change
   *
   * @param color ColorResult
   */
  private onColorChange = (color: ColorResult) => {
    const { confirmationRequired } = this.props;
    const { form } = this.state;

    this.setState({
      dataChanged: true,
      form: { ...form, values: { ...form.values, data: JSON.stringify(color) } }
    });

    confirmationRequired(true);
  };

  /**
   * On update resource method
   */
  private onUpdateResource = () => {
    const { onUpdate } = this.props;
    const { form } = this.state;
    const { values } = form;
    const { id, name, slug, orderNumber, type, parentId, data, styles, properties } = values;

    if (!id || !name || !slug || !orderNumber || !type || !parentId || !data || !styles || !properties) {
      return;
    }

    onUpdate({
      id: id,
      name: name,
      slug: slug,
      orderNumber: orderNumber,
      type: type,
      parentId: parentId,
      data: data,
      styles: styles,
      properties: properties
    });

    this.setState({ dataChanged: false });
  };

  /**
   * Event handler creator for text field change events
   *
   * @param key key
   * @param event React change event
   */
  private onHandleChange = (key: keyof ResourceSettingsForm) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const { confirmationRequired } = this.props;
    const form = { ...this.state.form };

    form.values = { ...form.values, [key]: event.target.value };

    this.setState({
      dataChanged: true,
      form: validateForm(form, { usePreprocessor: false })
    });

    confirmationRequired(true);
  };

  /**
   * Event handler creator for blur
   *
   * @param key key
   */
  private onHandleBlur = (key: keyof ResourceSettingsForm) => () => {
    const { confirmationRequired } = this.props;
    const form = { ...this.state.form };
    form.filled = { ...form.filled, [key]: true };

    this.setState({
      dataChanged: true,
      form: validateForm(form)
    });

    confirmationRequired(true);
  };
}

export default withStyles(styles)(ResourceSettingsView);