/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from "react";
import { withStyles, WithStyles, TextField, Divider, Button, IconButton, Box, Accordion, AccordionDetails, AccordionSummary, Typography, Paper } from "@material-ui/core";
import MaterialTable from "material-table";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import DeleteIcon from "@material-ui/icons/Delete";
import CheckIcon from "@material-ui/icons/Check";
import ClearIcon from "@material-ui/icons/Clear";
import EditIcon from "@material-ui/icons/Edit";
import DeleteForeverIcon from "@material-ui/icons/DeleteForever";
import styles from "../../styles/editor-view";
import strings from "../../localization/strings";
import theme from "../../styles/theme";
import { Resource, ResourceType } from "../../generated/client";
import { forwardRef } from "react";
import { MessageType, initForm, Form, validateForm } from "ts-form-validation";
import { ErrorContextType } from "../../types";
import Api from "../../api";
import { resourceRules, ResourceSettingsForm } from "../../commons/formRules";
import ImagePreview from "../generic/ImagePreview";
import VisibleWithRole from "../generic/VisibleWithRole";
import { ErrorContext } from "../containers/ErrorHandler";
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
  onAddChild: (parentId: string) => void;
  onSave: (resource: Resource) => void;
  onSaveChildren: (childResources: Resource[]) => void;
  onDelete: (resource: Resource) => void;
  onDeleteChild: (resource: Resource, nextOpenResource?: Resource) => void;
  confirmationRequired: (value: boolean) => void;
  onDeletePageClick: () => void;
}

/**
 * Component state
 */
interface State {
  form: Form<ResourceSettingsForm>;
  resourceId: string;
  resourceData: Resource;
  loading: boolean;
  childResources?: Resource[];
  dataChanged: boolean;
}

/**
 * Component for page resource settings view
 */
class PageResourceSettingsView extends React.Component<Props, State> {

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
        slug: undefined
      }, resourceRules),
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
    const { resource, keycloak } = this.props;

    if (prevProps.resource !== resource) {
      keycloak?.token && this.updateComponentData();
    }
  }

  /**
   * Component render method
   */
  public render = () => {
    const { loading, dataChanged } = this.state;
    const { classes } = this.props;

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
        { this.renderField("name", strings.pageSettingsView.name, "text") }
        <Box mb={ 3 }>
          { this.renderChildResources() }
          { this.renderAddChild() }
        </Box>
        <Box mb={ 3 }>
          <Divider/>
        </Box>
        <VisibleWithRole role="admin">
          { this.renderAdvancedSettings() }
        </VisibleWithRole>
      </Box>
    );
  }

  /**
   * Renders resource text fields
   */
  private renderResourceFields = () => {
    return (
      <Box display="flex" flexDirection="row">
        <Box mb={ 1 } mr={ 2 }>
          { this.renderField("orderNumber", strings.orderNumber, "number") }
        </Box>
        <Box mb={ 1 }>
          { this.renderField("slug", strings.slug, "text") }
        </Box>
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
    const { values, messages: { [key]: message } } = this.state.form;

    return (
      <TextField
        fullWidth
        multiline={ type === "textarea" }
        rows={ type === "textarea" ? 8 : undefined }
        type={ type }
        error={ message && message.type === MessageType.ERROR }
        helperText={ message && message.message }
        value={ values[key] || "" }
        onChange={ this.onResourceTextChange(key) }
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
          Container: props => <Paper { ...props } elevation={ 0 }/>
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

    if (!resourceData?.styles) {
      return null;
    }

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
          Container: props => <Paper { ...props } elevation={ 0 }/>
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
   * Renders child resources
   */
  private renderChildResources = () => {
    const { childResources } = this.state;

    if (!childResources) {
      return;
    }

    const listItems = childResources.map(child =>
      <React.Fragment key={ child.id }>
        <Box
          display="flex"
          alignItems="center"
          mt={ 3 }
        >
          { this.renderChildResourceContentField(child) }
          { this.renderDeleteChild(child) }
        </Box>
      </React.Fragment>
    );

    return (
      <Box>
        { listItems }
      </Box>
    );
  };

  /**
   * Renders add child resource button
   */
  private renderAddChild = () => {
    const { resource, onAddChild } = this.props;
    const resourceId = resource?.id;

    if (!resourceId) {
      return;
    }

    return (
      <Box mt={ 3 }>
        <Button
          color="primary"
          startIcon={ <AddCircleIcon /> }
          onClick={ () => onAddChild(resourceId) }
        >
          { strings.addNewResource }
        </Button>
      </Box>
    );
  }

  /**
   * Renders delete child resource button
   *
   * @param resource resource
   */
  private renderDeleteChild = (resource: Resource) => {
    const { classes } = this.props;

    return (
      <IconButton
        className={ classes.iconButton }
        style={{ width: 50, height: 50, marginLeft: theme.spacing(3) }}
        title={ strings.deleteResource }
        key={ `delete.${resource.id}` }
        name={ resource.id }
        color="primary"
        onClick={ () => this.props.onDeleteChild(resource, this.props.resource) }
      >
        <DeleteForeverIcon />
      </IconButton>
    );
  }

  /**
   * Renders child resource content field
   */
  private renderChildResourceContentField = (resource: Resource) => {
    switch (resource.type) {
      case ResourceType.TEXT:
        return <>
          <TextField
            fullWidth
            multiline
            value={ resource.data || "" }
            onChange={ this.onHandleChildResourceTextChange(resource) }
            name={ resource.id }
            variant="outlined"
            label={ resource.name }
          />
        </>;
      case ResourceType.PDF:
      case ResourceType.IMAGE:
      case ResourceType.VIDEO:
        return this.renderUploaderAndPreview(resource);
      default:
      return null;
    }
  }

  /**
   * Renders file uploader for background image and custom icons
   *
   * @param resource resource
   */
  private renderUploaderAndPreview = (resource: Resource) => {
    if (!resource.id) {
      return;
    }

    const previewItem = resource.data || "";

    return (
      <Box>
        <Box mb={ 1 }>
          <Typography variant="h4">
            { resource.name }
          </Typography>
        </Box>
        <ImagePreview
          uploadButtonText={ previewItem ? strings.fileUpload.changeFile : strings.fileUpload.addFile }
          imagePath={ previewItem }
          resource={ resource }
          allowSetUrl={ true }
          onDelete={ this.onChildResourceFileDelete }
          onUpload={ this.onChildResourceFileChange }
          onSetUrl={ this.onChildResourceSetFileUrl }
          uploadKey={ resource.id }
        />
      </Box>
    );
  }

  /**
   * Renders advanced settings
   */
  private renderAdvancedSettings = () => {
    const { classes, onDeletePageClick } = this.props;

    return (
      <Accordion>
        <AccordionSummary expandIcon={ <ExpandMoreIcon color="primary"/> }>
          <Typography variant="h4">
            { strings.applicationSettings.advancedSettings }
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box
            mt={ 3 }
            className={ classes.advancedSettingRow }
          >
            { this.renderResourceFields() }
            <Button
              disableElevation
              className={ classes.deleteButton }
              color="primary"
              variant="contained"
              onClick={ onDeletePageClick }
            >
              { strings.pageSettingsView.delete }
            </Button>
          </Box>
          <Box mt={ 3 } mb={ 3 }>
            { this.renderPropertiesTable() }
          </Box>
          <Box>
            { this.renderStyleTable() }
          </Box>
        </AccordionDetails>
      </Accordion> 
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

    const childResources = await this.getChildResources();
    const tableResource = ResourceUtils.getMaterialTableResourceData(resource);
    const form = validateForm(initForm<ResourceSettingsForm>(resource, resourceRules));

    this.setState({
      form: form,
      resourceId: resourceId,
      resourceData: tableResource,
      childResources: childResources
    });
  }

  /**
   * Gets child resources
   */
  private getChildResources = async () => {
    const { keycloak, customerId, deviceId, applicationId, resource } = this.props;
    const resourceId = resource.id;

    if (!keycloak?.token || !resourceId) {
      return;
    }

    try {
      return await Api.getResourcesApi(keycloak.token).listResources({
        customerId: customerId,
        deviceId: deviceId,
        applicationId: applicationId,
        parentId: resourceId
      });
    } catch (error) {
      this.context.setError(strings.errorManagement.resource.listChild, error);
    }
  }

  /**
   * Handles save changes to resource and child resources
   */
  private onSaveChanges = async () => {
    const { onSave, onSaveChildren } = this.props;
    const { resourceData, childResources, form } = this.state;
    const { id, name, slug, orderNumber, type, parentId } = form.values;

    if (!id || !name || !slug || !orderNumber || !type || !parentId) {
      return;
    }

    onSave({
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

    childResources && onSaveChildren(childResources);

    this.setState({
      dataChanged: false,
      resourceData
    });
  };

  /**
   * Updates child resource
   *
   * @param childResource child resource
   */
  private updateChildResource = (childResource: Resource) => {
    const { childResources } = this.state;

    if (!childResources) {
      return;
    }

    this.setState({
      dataChanged: true,
      childResources: childResources.map(resource =>
        resource.id === childResource.id ? childResource : resource
      )
    });

    this.props.confirmationRequired(true);
  }

  /**
   * Event handler creator for resource text field change event
   *
   * @param key key
   */
  private onResourceTextChange = (key: keyof ResourceSettingsForm) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const form = { ...this.state.form };

    form.values = { ...form.values, [key]: event.target.value };

    this.setState({
      dataChanged: true,
      form: validateForm(form, { usePreprocessor: false })
    });

    this.props.confirmationRequired(true);
  };

  /**
   * Handles child resource text change
   *
   * @param childResource child resource
   */
  private onHandleChildResourceTextChange = (childResource: Resource) => (event: React.ChangeEvent<HTMLInputElement>) => {
    this.updateChildResource({ ...childResource, data: event.target.value });
  }

  /**
   * Event handler for child resource file change
   *
   * @param newUri new URI
   * @param resourceId resource id
   * @param fileType file type
   */
  private onChildResourceFileChange = (newUri: string, resourceId: string, fileType: string) => {
    const { childResources } = this.state;

    if (!childResources) {
      return;
    }

    const childResource = childResources.find(resource => resource.id === resourceId);

    if (!childResource) {
      return;
    }

    const resourceType = ResourceUtils.getResourceTypeFromFileType(fileType);

    this.updateChildResource({
      ...childResource,
      data: newUri,
      type: resourceType && resourceType !== childResource.type ?
        resourceType :
        childResource.type
    });
  };

  /**
   * Handles child resource file change
   *
   * @param url url
   * @param key resource id
   */
  private onChildResourceSetFileUrl = async (url: string, resourceId: string) => {
    const { childResources } = this.state;

    if (!childResources) {
      return 500;
    }

    const childResource = childResources.find(resource => resource.id === resourceId);

    if (!childResource) {
      return 500;
    }

    this.updateChildResource({ ...childResource, data: url });

    return 200;
  };

  /**
   * Handles child resource file delete
   *
   * @param resourceId resource ID
   */
  private onChildResourceFileDelete = (resourceId: string) => {
    const { childResources } = this.state;

    if (!childResources) {
      return;
    }

    const childResource = childResources.find(resource => resource.id === resourceId);

    if (!childResource) {
      return;
    }

    this.updateChildResource({ ...childResource, data: undefined });
  }

  /**
   * Event handler creator for blur
   *
   * @param key key
   */
  private onHandleBlur = (key: keyof ResourceSettingsForm) => () => {
    const form = { ...this.state.form };

    form.filled = { ...form.filled, [key]: true };

    this.setState({
      dataChanged: true,
      form: validateForm(form)
    });

    this.props.confirmationRequired(true);
  };

}

export default withStyles(styles)(PageResourceSettingsView);