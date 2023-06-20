/* eslint-disable @typescript-eslint/no-unused-vars */
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Divider, Paper, TextField, Typography, withStyles, WithStyles } from "@material-ui/core";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import CheckIcon from "@material-ui/icons/Check";
import ClearIcon from "@material-ui/icons/Clear";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { nanoid } from "@reduxjs/toolkit";
import { ReduxState } from "app/store";
import AdminOnly from "components/containers/AdminOnly";
import WithDebounce from "components/generic/with-debounce";
import deepEqual from "fast-deep-equal";
import Keycloak from "keycloak-js";
import MaterialTable from "material-table";
import * as React from "react";
import { forwardRef } from "react";
import { connect, ConnectedProps } from "react-redux";
import { Form, initForm, MessageType, validateForm } from "ts-form-validation";
import { ResourceUtils } from "utils/resource";
import { resourceRules, ResourceSettingsForm } from "../../commons/formRules";
import { Resource, ResourceType } from "../../generated/client";
import strings from "../../localization/strings";
import styles from "../../styles/editor-view";
import StyledMTableToolbar from "../../styles/generic/styled-mtable-toolbar";
import theme from "../../styles/theme";
import { ErrorContextType } from "../../types";
import { ErrorContext } from "../containers/ErrorHandler";
import MediaPreview from "../generic/MediaPreview";

/**
 * Component props
 */
interface Props extends ExternalProps {
  keycloak?: Keycloak;
  deviceId: string;
  applicationId: string;
  resource: Resource;
  customerId: string;
  onAddChild: (parentId: string) => void;
  onSave: (resource: Resource, childResources?: Resource[]) => void;
  onDeleteChild: (resource: Resource) => void;
  confirmationRequired: (value: boolean) => void;
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
  childResources: Resource[];
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
      dataChanged: false,
      childResources: []
    };
  }

  /**
   * Component did mount life cycle handler
   */
  public componentDidMount = async () => {
    const { keycloak, resource } = this.props;

    if (keycloak?.token && resource?.id) {
      this.setState({
        resourceId: resource.id,
        resourceData: ResourceUtils.getMaterialTableResourceData(resource),
        form: validateForm(initForm<ResourceSettingsForm>(resource, resourceRules)),
        childResources: this.getChildResources()
      });
    }
  }

  /**
   * Component did update life cycle handler
   *
   * @param prevProps previous props
   */
  public componentDidUpdate = async (prevProps: Props) => {
    const { resource, keycloak } = this.props;

    if (!keycloak?.token) {
      return;
    }

    if (prevProps.resource !== resource && resource?.id) {
      this.setState({
        resourceId: resource.id,
        resourceData: ResourceUtils.getMaterialTableResourceData(resource),
        form: validateForm(initForm<ResourceSettingsForm>(resource, resourceRules)),
        childResources: this.getChildResources()
      });

      return;
    }

    if (!deepEqual(prevProps.resources, this.props.resources)) {
      this.setState({ childResources: this.getChildResources() });
    }
  }

  /**
   * Component render method
   */
  public render = () => {
    const { loading, dataChanged, form } = this.state;
    const { classes, onDelete } = this.props;

    if (loading) {
      return;
    }

    return (
      <Box>
        <Button
          className={ classes.saveButton }
          color="primary"
          variant="outlined"
          disabled={ !form.isFormValid || !dataChanged }
          onClick={ this.onSaveChanges }
        >
          { strings.save }
        </Button>
        { this.renderField("name", strings.commonSettingsTexts.name, "text") }
        <Box mb={ 3 }>
          { this.renderChildResources() }
          { this.renderAddChild() }
        </Box>
        <Box mb={ 3 }>
          <Divider/>
        </Box>
        <AdminOnly>
          { this.renderAdvancedSettings() }
        </AdminOnly>
        {/* TODO: Check page delete works. */}
        <Box mt={1}>
          <Button
            disableElevation
            className={ classes.deleteButton }
            color="primary"
            variant="contained"
            onClick={ onDelete }
          >
            { strings.pageSettingsView.delete }
          </Button>
        </Box>
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
        value={ values[key] ?? "" }
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
    const { classes } = this.props;
    const { childResources } = this.state;

    const listItems = childResources.map(child =>
      <React.Fragment key={ child.id }>
        <Box className={ classes.resourceRow }>
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
    const { classes, onDeleteChild } = this.props;

    return (
      <Button
        style={{ marginLeft: theme.spacing(3) }}
        title={ strings.deleteResource }
        name={ resource.id }
        color="primary"
        variant="contained"
        onClick={ () => onDeleteChild(resource) }
      >
        { strings.delete }
      </Button>
    );
  }

  /**
   * Renders child resource content field
   */
  private renderChildResourceContentField = (resource: Resource) => {
    switch (resource.type) {
      case ResourceType.TEXT:
        return (
          <WithDebounce
            name={ resource.id  }
            label={ resource.name }
            component={ props => (
              <TextField
                { ...props }
                fullWidth
                multiline
                variant="outlined"
                label={ resource.name }
              />
            )}
            value={ resource.data || "" }
            onChange={ this.onHandleChildResourceTextChange(resource) }
            debounceTimeout={ 300 }
          />
        );
      case ResourceType.AUDIO:
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
      <Box style={{ display: "flex", flexDirection: "column", flex: 1 }}>
        <Box mb={ 1 }>
          <Typography variant="h4">
            { resource.name }
          </Typography>
        </Box>
        <MediaPreview
          uploadButtonText={ previewItem ? strings.fileUpload.changeFile : strings.fileUpload.addFile }
          resourcePath={ previewItem }
          resource={ resource }
          allowSetUrl={ true }
          onDelete={ this.onChildResourceFileDelete }
          onUpload={ this.onChildResourceFileChange }
          onSetUrl={ this.onChildResourceSetFileUrl }
          uploadKey={ resource.id }
          imgHeight="200px"
        />
      </Box>
    );
  }

  /**
   * Renders advanced settings
   */
  private renderAdvancedSettings = () => {
    const { classes } = this.props;

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
   * Returns child resources from resource list in Redux store
   */
  private getChildResources = (): Resource[] => {
    const { resource, resources } = this.props;

    return resources.filter(item => item.parentId === resource.id);
  }

  /**
   * Handles save changes to resource and child resources
   */
  private onSaveChanges = async () => {
    const { onSave } = this.props;
    const { resourceData, form, childResources } = this.state;
    const { id, name, slug, orderNumber, type, parentId } = form.values;

    if (!id || !name || !slug || !orderNumber || !type || !parentId) {
      return;
    }

    const updatedResource = {
      id: id,
      name: name,
      slug: slug,
      orderNumber: orderNumber,
      type: type,
      parentId: parentId,
      data: resourceData.data,
      styles: resourceData.styles,
      properties: resourceData.properties
    };

    onSave(updatedResource, childResources);

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
    const { confirmationRequired } = this.props;
    const { childResources } = this.state;

    this.setState({
      dataChanged: true,
      childResources: childResources.map(resource => resource.id === childResource.id ? childResource : resource)
    });

    confirmationRequired(true);
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
    const childResource = this.getChildResources().find(resource => resource.id === resourceId);

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
    const childResource = this.getChildResources().find(resource => resource.id === resourceId);

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
    const childResource = this.getChildResources().find(resource => resource.id === resourceId);

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

/**
 * Maps redux state to props
 *
 * @param state redux state
 */
const mapStateToProps = (state: ReduxState) => ({
  resources: state.resource.resources
});

const connector = connect(mapStateToProps);

type ExternalProps = ConnectedProps<typeof connector> & WithStyles<typeof styles>;

export default connector(withStyles(styles)(PageResourceSettingsView));