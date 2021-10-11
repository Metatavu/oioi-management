/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from "react";
import { withStyles, WithStyles, TextField, Divider, Typography, Button, Box, Accordion, AccordionDetails, AccordionSummary, Paper } from "@material-ui/core";
import MaterialTable from "material-table";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import DeleteIcon from "@material-ui/icons/Delete";
import CheckIcon from "@material-ui/icons/Check";
import ClearIcon from "@material-ui/icons/Clear";
import EditIcon from "@material-ui/icons/Edit";
import styles from "../../styles/editor-view";
import strings from "../../localization/strings";
import { Resource, ResourceToJSON } from "../../generated/client";
import { forwardRef } from "react";
import { MessageType, initForm, Form, validateForm } from "ts-form-validation";
import { ErrorContextType } from "../../types";
import { resourceRules, ResourceSettingsForm } from "../../commons/formRules";
import VisibleWithRole from "../generic/VisibleWithRole";
import { ErrorContext } from "../containers/ErrorHandler";
import PDFPreview from "../generic/PDFPreview";
import StyledMTableToolbar from "../../styles/generic/styled-mtable-toolbar";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { KeycloakInstance } from "keycloak-js";
import { nanoid } from "@reduxjs/toolkit";
import { ResourceUtils } from "utils/resource";

/**
 * Component props
 */
interface Props extends WithStyles<typeof styles> {
  keycloak?: KeycloakInstance;
  deviceId: string;
  applicationId: string;
  resource: Resource;
  customerId: string;
  confirmationRequired: (value: boolean) => void;
  onUpdate: (resource: Resource) => void;
  onDelete: () => void;
}

/**
 * Component state
 */
interface State {
  form: Form<ResourceSettingsForm>;
  resourceId: string;
  resourceData: Resource;
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
      resourceData: ResourceUtils.getMaterialTableResourceData(props.resource),
      loading: false,
      dataChanged: false
    };
  }

  /**
   * Component did mount life cycle handler
   */
  public componentDidMount = async () => {
    const { keycloak } = this.props;

    keycloak?.token && this.updateComponentData();
  }

  /**
   * Component did update  life cycle handler
   *
   * @param prevProps previous props
   */
  public componentDidUpdate = async (prevProps: Props) => {
    const { keycloak, resource } = this.props;

    if (prevProps.resource !== resource) {
      keycloak?.token && this.updateComponentData();
    }
  }

  /**
   * Component render method
   */
  public render = () => {
    const { classes } = this.props;
    const { loading, dataChanged, form } = this.state;
    const { isFormValid } = form;

    if (loading) {
      return;
    }

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
        { this.renderField("name", strings.commonSettingsTexts.name, "text") }
        { this.renderUploaderAndPreview() }
        <Box mt={ 3 } mb={ 3 }>
          <Divider/>
        </Box>
        <VisibleWithRole role="admin">
          { this.renderAdvancedSettings() }
        </VisibleWithRole>
      </Box>
    );
  }

  /**
   * Renders text field
   *
   * @param key to look for
   * @param label label to be shown
   * @param type text field type
   */
  private renderField = (key: keyof ResourceSettingsForm, placeholder: string, type: string) => {
    const { form } = this.state;
    const { values, messages: { [key]: message } } = form;

    return (
      <TextField
        fullWidth
        multiline={ type === "textarea" }
        rows={ type === "textarea" ? 8 : undefined }
        type={ type }
        error={ message && message.type === MessageType.ERROR }
        helperText={ message && message.message }
        value={ values[key] || "" }
        onChange={ this.onHandleResourceTextChange(key) }
        onBlur={ this.onHandleBlur(key) }
        name={ key }
        variant="outlined"
        label={ placeholder }
      />
    );
  };

  /**
   * Renders table that contains properties data
   */
  private renderPropertiesTable = () => {
    const { resourceData } = this.state;

    if (!resourceData?.properties) {
      return null;
    }

    return (
      <MaterialTable
        key={ nanoid() }
        icons={{
          Add: forwardRef((props, ref) => <AddCircleIcon color="secondary" { ...props } ref={ ref }/>),
          Delete: forwardRef((props, ref) => <DeleteIcon { ...props } ref={ ref }/>),
          Check: forwardRef((props, ref) => <CheckIcon { ...props } ref={ ref }/>),
          Clear: forwardRef((props, ref) => <ClearIcon { ...props } ref={ ref }/>),
          Edit: forwardRef((props, ref) => <EditIcon { ...props } ref={ ref }/>)
        }}
        columns={[
          { title: strings.key, field: "key" },
          { title: strings.value, field: "value" }
        ]}
        data={ resourceData.properties }
        editable={{
          onRowAdd: async currentData => {
            const updatedData = ResourceUtils.updateMaterialTableProperty(resourceData, currentData);
            if (!updatedData) {
              return;
            }

            this.setState({
              dataChanged: true,
              resourceData: updatedData,
            }, () => this.props.confirmationRequired(true));
          },
          onRowUpdate: async (updatedData, currentData) => {
            if (!currentData) {
              return;
            }

            const updatedResourceData = ResourceUtils.updateMaterialTableProperty(resourceData, currentData, updatedData);
            if (!updatedResourceData) {
              return;
            }

            this.setState({
              dataChanged: true,
              resourceData: updatedResourceData
            });
          },
          onRowDelete: async updatedData => {
            const updatedResourceData = ResourceUtils.deleteFromPropertyList(resourceData, updatedData.key);
            if (!updatedResourceData) {
              return;
            }

            this.setState({
              resourceData: updatedResourceData,
              dataChanged: true
            }, () => this.props.confirmationRequired(true));
          }
        }}
        title={ strings.properties }
        components={{
          Toolbar: props => <StyledMTableToolbar { ...props } />,
          Container: props => <Paper {...props} elevation={ 0 } />
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
   * Renders table that contains style data
   */
  private renderStyleTable = () => {
    const { resourceData } = this.state;

    if (!resourceData.styles) {
      return null;
    }

    return (
      <MaterialTable
        key={ nanoid() }
        icons={{
          Add: forwardRef((props, ref) => <AddCircleIcon color="secondary" { ...props } ref={ ref }/>),
          Delete: forwardRef((props, ref) => <DeleteIcon { ...props } ref={ ref }/>),
          Check: forwardRef((props, ref) => <CheckIcon { ...props } ref={ ref }/>),
          Clear: forwardRef((props, ref) => <ClearIcon { ...props } ref={ ref }/>),
          Edit: forwardRef((props, ref) => <EditIcon { ...props } ref={ ref }/>)
        }}
        columns={[
          { title: strings.key, field: "key" },
          { title: strings.value, field: "value" }
        ]}
        data={ resourceData.styles }
        editable={{
          onRowAdd: async updatedData => {
            const updatedResourceData = ResourceUtils.updateMaterialTableStyle(resourceData, updatedData);
            if (!updatedResourceData) {
              return;
            }

            this.setState({
              dataChanged: true,
              resourceData: updatedResourceData,
            }, () => this.props.confirmationRequired(true));
          },
          onRowUpdate: async (updatedData, currentData) => {
            if (!currentData) {
              return;
            }

            const updatedResourceData = ResourceUtils.updateMaterialTableStyle(resourceData, currentData, updatedData);
            if (!updatedResourceData) {
              return;
            }

            this.setState({
              dataChanged: true,
              resourceData: updatedResourceData
            });
          },
          onRowDelete: async updatedData => {
            const updatedResourceData = ResourceUtils.deleteFromStyleList(resourceData, updatedData.key);
            if (!updatedResourceData) {
              return;
            }

            this.setState({
              resourceData: updatedResourceData,
              dataChanged: true
            }, () => this.props.confirmationRequired(true));
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
   * Renders file uploaders for background image and custom icons
   */
  private renderUploaderAndPreview = () => {
    const { resource } = this.props;
    const { resourceData } = this.state;

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
   * Renders advanced settings
   */
  private renderAdvancedSettings = () => {
    const { classes, onDelete } = this.props;

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
              className={ classes.advancedSettingRow }
            >
              <Box
                display="flex"
                flexDirection="row"
              >
                <Box mb={ 1 } mr={ 2 }>
                  { this.renderField("orderNumber", strings.orderNumber, "number") }
                </Box>
                <Box mb={ 1 }>
                  { this.renderField("slug", strings.slug, "text") }
                </Box>
              </Box>
              <Box>
                <Button
                  disableElevation
                  className={ classes.deleteButton }
                  color="primary"
                  variant="contained"
                  onClick={ onDelete }
                >
                  { strings.pdfSettingsView.delete }
                </Button>
              </Box>
            </Box>
            <Box mb={ 3 }>
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
   * Updates component data
   */
  private updateComponentData = async () => {
    const { resource } = this.props;
    const resourceId = resource.id;

    if (!resourceId) {
      return;
    }

    const resourceData = ResourceToJSON(resource);
    const form = validateForm(initForm<ResourceSettingsForm>(resource, resourceRules));
    const tableResource = ResourceUtils.getMaterialTableResourceData(resource);

    this.setState({
      form: form,
      resourceId: resourceId,
      resourceData: resourceData
    });
  }

  /**
   * Handles save changes to resource and child resources
   */
  private onSaveChanges = async () => {
    const { onUpdate } = this.props;
    const { resourceData, form } = this.state;
    const { id, name, slug, orderNumber, type, parentId } = form.values;

    if (!id || !name || !slug || !orderNumber || !type || !parentId) {
      return;
    }

    onUpdate({
      id: id,
      name: name,
      slug: slug,
      orderNumber: orderNumber,
      type: type,
      parentId: parentId,
      data: resourceData.data,
      styles: resourceData.styles,
      properties: resourceData.properties
    });

    this.setState({
      dataChanged: false,
      resourceData
    });
  };

  /**
   * Handles resource text fields change events
   *
   * @param key key
   * @param event React change event
   */
  private onHandleResourceTextChange = (key: keyof ResourceSettingsForm) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const { form } = this.state;

    this.setState({
      dataChanged: true,
      form: validateForm({
        ...form,
        values: { ...form.values, [key]: event.target.value }
      }, { usePreprocessor: false })
    });

    this.props.confirmationRequired(true);
  };

  /**
   * Handles pdf file change
   *
   * @param newUri new URI
   */
  private onPdfFileChange = (newUri: string) => {
    const { resourceData } = this.state;

    this.setState({
      dataChanged: true,
      resourceData: { ...resourceData, data: newUri }
    });
  };

  /**
   * Handles pdf file delete
   */
  private onPdfFileDelete = () => {
    const { resourceData } = this.state;

    this.setState({
      dataChanged: true,
      resourceData: { ...resourceData, data: undefined }
    });
  }

  /**
   * Event handler creator for blur
   *
   * @param key key
   */
  private onHandleBlur = (key: keyof ResourceSettingsForm) => () => {
    const { form } = this.state;

    this.setState({
      dataChanged: true,
      form: validateForm({
        ...form,
        filled: {
          ...form.filled,
          [key]: true
        }
      })
    });

    this.props.confirmationRequired(true);
  };
}

export default withStyles(styles)(PDFResourceSettingsView);