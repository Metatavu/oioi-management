/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from "react";
import { withStyles, WithStyles, TextField, Divider, Typography, Button, TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, Box, Accordion, AccordionSummary, AccordionDetails } from "@material-ui/core";
import MaterialTable from "material-table";
import AddIcon from "@material-ui/icons/Add";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import DeleteIcon from "@material-ui/icons/DeleteForever";
import CheckIcon from "@material-ui/icons/Check";
import ClearIcon from "@material-ui/icons/Clear";
import EditIcon from "@material-ui/icons/Edit";
import styles from "../../styles/editor-view";
import strings from "../../localization/strings";
import theme from "../../styles/theme";
import { Resource } from "../../generated/client";
import { forwardRef } from "react";
import { MessageType, initForm, Form, validateForm } from "ts-form-validation";
import { ErrorContextType } from "../../types";
import Api from "../../api";
import IconButton from "@material-ui/core/IconButton";
import { resourceRules, ResourceSettingsForm } from "../../commons/formRules";
import ImagePreview from "../generic/ImagePreview";
import AddIconDialog from "../generic/AddIconDialog";
import { IconKeys, getLocalizedIconTypeString } from "../../commons/iconTypeHelper";
import VisibleWithRole from "../generic/VisibleWithRole";
import { getLocalizedTypeString } from "../../commons/resourceTypeHelper";
import { ErrorContext } from "../containers/ErrorHandler";
import { resolveChildResourceTypes } from "../../commons/resourceTypeHelper";
import StyledMTableToolbar from "../../styles/generic/styled-mtable-toolbar";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { KeycloakInstance } from "keycloak-js";
import { nanoid } from "@reduxjs/toolkit";
import { ResourceUtils } from "utils/resource";

/**
 * Component props
 */
interface Props extends WithStyles<typeof styles> {
  deviceId: string;
  applicationId: string;
  keycloak?: KeycloakInstance;
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
  childResources?: Resource[];
  dataChanged: boolean;
  iconDialogOpen: boolean;
}

/**
 * Component for menu resource settings view
 */
class MenuResourceSettingsView extends React.Component<Props, State> {

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
          data: undefined,
        },
        resourceRules
      ),
      resourceId: "",
      resourceData: ResourceUtils.getMaterialTableResourceData(props.resource),
      dataChanged: false,
      iconDialogOpen: false
    };
  }

  /**
   * Component did mount life cycle handler
   */
  public componentDidMount = async () => {
    await this.fetchData();
  }

  /**
   * Component did update method
   *
   * @param prevProps previous props
   */
  public componentDidUpdate = async (prevProps: Props) => {
    if (prevProps.resource !== this.props.resource) {
      await this.fetchData();
    }
  }

  /**
   * Component render method
   */
  public render = () => {
    const { classes, keycloak } = this.props;
    const { dataChanged, form } = this.state;
    const { isFormValid } = form;

    return (
      <div>
        <Button
          className={ classes.saveButton }
          color="primary"
          variant="outlined"
          disabled={ !isFormValid || !dataChanged }
          onClick={ this.onUpdateResource }
        >
          { strings.save }
        </Button>
        <Box mb={ 3 }>
          { this.renderFormField("name", strings.commonSettingsTexts.name, "text") }
        </Box>
        <Box mb={ 3 }>
          { this.renderPropertiesField("nameText", strings.commonSettingsTexts.teaserText, "textarea") }
        </Box>
        <Box maxWidth={ 300 }>
          { this.renderUploaderAndPreview(strings.commonSettingsTexts.media, "menuImg") }
        </Box>
        <Box mt={ 3 } mb={ 3 }>
          <Divider/>
        </Box>
        <Box mb={ 3 }>
          { this.renderPropertiesField("title", strings.menuSettingsView.title, "text") }
        </Box>
        <Box mb={ 3 }>
          { this.renderPropertiesField("content", strings.menuSettingsView.contentText, "textarea") }
        </Box>
        <Box className={ classes.gridRow }>
          <Box className={ classes.gridItem }>
            { this.renderUploaderAndPreview(strings.menuSettingsView.backgroundMedia, "background") }
          </Box>
          <Box className={ classes.gridItem }>
            { this.renderUploaderAndPreview(strings.menuSettingsView.foregroundMedia, "foreground") }
          </Box>
        </Box>
        <Box mt={ 3 } mb={ 3 }>
          <Divider/>
        </Box>
        <Box mb={ 3 }>
          <Typography variant="h4">
            { strings.replacedIcons }
          </Typography>
        </Box>
        { this.renderIconList() }
        <AddIconDialog
          keycloak={ keycloak }
          resource={ this.props.resource }
          onSave={ this.onPropertyOrIconChange }
          onToggle={ this.toggleDialog }
          open={ this.state.iconDialogOpen }
        />
        <Box mt={ 3 } mb={ 3 }>
          <Divider/>
        </Box>
        { this.renderChildResources() }
        <VisibleWithRole role="admin">
          { this.renderAdvancedSettings() }
        </VisibleWithRole>
      </div>
    );
  }

  /**
   * Renders form text field
   *
   * @param key to look for
   * @param label label to be shown
   * @param type text field type
   */
  private renderFormField = (key: keyof ResourceSettingsForm, placeholder: string, type: string) => {
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
   * Renders properties field
   *
   * @param key to look for
   * @param label label to be shown
   * @param type text field type
   */
  private renderPropertiesField = (key: keyof ResourceSettingsForm, placeholder: string, type: string) => {
    const { resourceData, form } = this.state;
    const { messages: { [key]: message } } = form;

    const property = resourceData.properties?.find(p => p.key === key);

    return (
      <TextField
        fullWidth
        multiline={ type === "textarea" }
        rows={ type === "textarea" ? 8 : undefined }
        type={ type }
        error={ message && message.type === MessageType.ERROR }
        helperText={ message && message.message }
        value={ property?.value || "" }
        onChange={ event => this.onPropertyOrIconChange(event.target.value, key) }
        name={ key }
        variant="outlined"
        label={ placeholder }
      />
    );
  };

  /**
   * Renders advanced settings
   */
  private renderAdvancedSettings = () => {
    const { classes, onDelete } = this.props;

    return (
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
                { this.renderFormField("orderNumber", strings.orderNumber, "number") }
              </Box>
              <Box mb={ 1 }>
                { this.renderFormField("slug", strings.slug, "text") }
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
                { strings.menuSettingsView.delete }
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
    );
  }

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
          Toolbar: props => <StyledMTableToolbar { ...props }/>,
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

    if (resourceData.styles === undefined) {
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
          Toolbar: props => <StyledMTableToolbar { ...props }/>,
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
   * Render child resources
   */
  private renderChildResources = () => {
    const { resource } = this.props;

    const childTypes = resolveChildResourceTypes(resource.type);

    if (childTypes.length === 0) {
      return null;
    }

    return (
      <Box mb={ 3 }>
        <Typography variant="h4" style={{ marginBottom: theme.spacing(1) }}>
          { strings.childResources }
        </Typography>
        { this.renderChildResourcesList() }
      </Box>
    );
  }

  /**
   * Renders child resource list
   */
  private renderChildResourcesList = () => {
    const { classes } = this.props;
    const { childResources } = this.state;

    if (!childResources) {
      return null;
    }

    const listItems = childResources.map(resource => {
      return (
        <TableRow key={ resource.name }>
          <TableCell component="th" scope="row">
            { resource.name }
          </TableCell>
          <TableCell align="left">
            { getLocalizedTypeString(resource.type) }
          </TableCell>
          <TableCell align="center">
            { resource.orderNumber }
          </TableCell>
        </TableRow>
      );
    });

    return (
      <TableContainer component={ Paper }>
        <Table
          size="small"
          className={ classes.table }
          aria-label="simple table"
        >
          <TableHead>
            <TableRow>
              <TableCell>
                { strings.page }
              </TableCell>
              <TableCell align="left">
                { strings.type }
              </TableCell>
              <TableCell align="center">
                { strings.orderFromLeftToRight }
              </TableCell>
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
   *
   * @param title title
   * @param uploadKey upload key
   */
  private renderUploaderAndPreview = (title: string, uploadKey: string) => {
    const { resource } = this.props;
    const { resourceData } = this.state;

    if (!resourceData.properties) {
      return;
    }

    const previewItem = resourceData.properties.find(property => property.key === uploadKey)?.value || "";

    return (
      <>
        <Typography variant="h4" style={{ marginBottom: theme.spacing(1), whiteSpace: "nowrap" }}>
          { title }
        </Typography>
        <ImagePreview
          uploadButtonText={ previewItem ? strings.fileUpload.changeMedia : strings.fileUpload.addMedia }
          imagePath={ previewItem }
          allowSetUrl={ true }
          onUpload={ this.onPropertyOrIconChange }
          onSetUrl={ this.onPropertyOrIconChange }
          resource={ resource }
          uploadKey={ uploadKey }
          onDelete={ this.onPropertyOrIconFileDelete }
        />
      </>
    );
  };

  /**
   * Render media elements
   */
  private renderIconList = () => {
    const { classes, resource } = this.props;
    const { resourceData } = this.state;

    const iconResources = (resourceData.properties || []).filter(property => property.key.startsWith("icon_"));

    const icons = iconResources.map(iconResource => {
      const { key, value } = iconResource;
      const iconTypeKey = Object.values(IconKeys).find(k => key === k.toString());
      const displayName = iconTypeKey ?
        getLocalizedIconTypeString(iconTypeKey) :
        key;

      return (
        <Box key={ key } className={ classes.gridItem }>
          <Typography variant="h5">
            { displayName }
          </Typography>
          <ImagePreview
            uploadButtonText={ resource ? strings.fileUpload.changeImage : strings.fileUpload.addImage }
            key={ key }
            imagePath={ value }
            allowSetUrl={ false }
            onUpload={ this.onPropertyOrIconChange }
            onSetUrl={ () => {} }
            resource={ resource }
            uploadKey={ key }
            onDelete={ this.onPropertyOrIconFileDelete }
          />
        </Box>
      );
    });

    return (
      <Box className={ classes.gridRow }>
        { icons }
        <Box className={ classes.gridItem }>
          <Box className={ classes.newItem }>
            <IconButton
              className={ classes.iconButton }
              onClick={ this.toggleDialog }
            >
              <AddIcon fontSize="large" />
            </IconButton>
          </Box>
        </Box>
      </Box>
    );
  }


  /**
   * Handles resource text fields change events
   *
   * @param key data key
   * @param event change event
   */
  private onHandleResourceTextChange = (key: keyof ResourceSettingsForm) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const values = {
      ...this.state.form.values,
      [key]: event.target.value
    };

    const form = validateForm(
      { ...this.state.form, values },
      { usePreprocessor: false }
    );

    this.setState({ form: form, dataChanged: true });
    this.props.confirmationRequired(true);
  };

  /**
   * Handles image change
   *
   * @param newUri new URI
   * @param key key
   */
  private onPropertyOrIconChange = (newUri: string, key: string) => {
    const updatedResourceData = ResourceUtils.updatePropertyList(this.state.resourceData, key, newUri);

    if(!updatedResourceData) {
      return;
    }

    this.setState({
      resourceData: updatedResourceData,
      dataChanged: true
    });
  };

  /**
   * Toggle dialog
   */
  private toggleDialog = () => {
    this.setState({iconDialogOpen: !this.state.iconDialogOpen});
  }

  /**
   * Delete icon file with key
   *
   * @param key key
   */
  private onPropertyOrIconFileDelete = (key: string) => {
    const updatedResourceData = ResourceUtils.deleteFromPropertyList(this.state.resourceData, key);

    if (!updatedResourceData) {
      return;
    }

    this.setState({
      resourceData: updatedResourceData,
      dataChanged: true
    });
  };

  /**
   * Handle resource update
   */
  private onUpdateResource = () => {
    const { onUpdate } = this.props;
    const { form, resourceData } = this.state;
    const { id, name, slug, orderNumber, type, parentId } = form.values;

    if (!id || !name || !slug || !orderNumber || !type || !parentId) {
      return;
    }

    onUpdate({
      ...this.props.resource,
      name: name,
      orderNumber: orderNumber,
      slug: slug,
      parentId: parentId,
      type: type,
      id: id,
      data: resourceData.data,
      styles: resourceData.styles,
      properties: resourceData.properties
    });

    this.setState({ dataChanged: false });
  };

  /**
   * Event handler for blur
   *
   * @param key key
   */
  private onHandleBlur = (key: keyof ResourceSettingsForm) => () => {
    let form = { ...this.state.form };

    const filled = { ...form.filled, [key]: true };
    form = validateForm({ ...this.state.form, filled });

    this.setState({ form: form, dataChanged: true });
    this.props.confirmationRequired(true);
  };

  /**
   * Fetches data
   */
  private fetchData = async () => {
    const { keycloak, customerId, deviceId, applicationId, resource } = this.props;
    const resourceId = resource.id;

    if (!keycloak?.token || !resourceId) {
      return;
    }

    const form = validateForm(initForm<ResourceSettingsForm>(resource, resourceRules));
    const tableResource = ResourceUtils.getMaterialTableResourceData(resource);

    try {
      const childResources = await Api.getResourcesApi(keycloak.token).listResources({
        customerId: customerId,
        deviceId: deviceId,
        applicationId: applicationId,
        parentId: resourceId
      });

      this.setState({
        form: form,
        resourceId: resourceId,
        resourceData: tableResource,
        childResources: childResources
      });
    } catch (error) {
      this.context.setError(strings.errorManagement.resource.list, error);
    }
  }
}

export default withStyles(styles)(MenuResourceSettingsView);