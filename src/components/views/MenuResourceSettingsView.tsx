/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from "react";
import { withStyles, WithStyles, FormControlLabel, Checkbox, TextField, Divider, Typography, Button, TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, Box, Accordion, AccordionSummary, AccordionDetails } from "@material-ui/core";
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
import { Resource, KeyValueProperty, ResourceType, ResourceToJSON } from "../../generated/client";
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
  onDelete: (resource: Resource) => void;
}

/**
 * Component state
 */
interface State {
  form: Form<ResourceSettingsForm>;
  resourceId: string;
  resourceData: any;
  childResources?: Resource[];
  dataChanged: boolean;
  resourceMap: Map<string, string>;
  iconsMap: Map<string, string>;
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
      resourceMap: new Map(),
      iconsMap: new Map(),
      resourceId: "",
      resourceData: {},
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
        { this.renderFields() }
        <Box mb={ 3 }>
          <Divider/>
        </Box>
        <Box className={ classes.gridRow }>
          <Box className={ classes.gridItem }>
            { this.renderUploaderAndPreview(strings.backgroundMedia, "background") }
          </Box>
          <Box className={ classes.gridItem }>
            { this.renderUploaderAndPreview(strings.menuImage, "menuImg") }
          </Box>
          <Box className={ classes.gridItem }>
            { this.renderUploaderAndPreview(strings.foregroundImage, "foreground") }
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
          onSave={ this.onIconFileChange }
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
   * Render text fields
   */
  private renderFields = () => {
    const { resource } = this.props;

    return (
      <>
        <Box mb={ 3 }>
          { this.renderFormField("name", strings.name, "text") }
        </Box>
        <Box mb={ 3 }>
          { this.renderPropertiesField("nameText", strings.nameText, "textarea") }
        </Box>
        <Box mb={ 3 }>
          { this.renderPropertiesField("title", strings.title, "text") }
        </Box>
        <Box mb={ 3 }>
          { this.renderPropertiesField("content", strings.content, "textarea") }
        </Box>
        { resource.type === ResourceType.SLIDESHOW &&
        <Box mb={ 3 }>
          { this.renderSlideShowFields() }
        </Box>
        }
      </>
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
    const { resourceMap, form } = this.state;
    const { messages: { [key]: message } } = form;

    return (
      <TextField
        fullWidth
        multiline={ type === "textarea" }
        rows={ type === "textarea" ? 8 : undefined }
        type={ type }
        error={ message && message.type === MessageType.ERROR }
        helperText={ message && message.message }
        value={ resourceMap.get(key) || "" }
        onChange={ this.onHandleChange(key) }
        onBlur={ this.onHandleBlur(key) }
        name={ key }
        variant="outlined"
        label={ placeholder }
      />
    );
  };

  /**
   * Render slideshow specific fields
   */
  private renderSlideShowFields = () => {
    return (
      <Box display="flex" mt={ 3 }>
        <Box mr={ 2 } mb={ 4 }>
          <Box>
            <Typography variant="h4">
              { strings.playback }
            </Typography>
          </Box>
          <Box ml={ 2 } mt={ 2 }>
            { this.renderCheckbox("autoplay", strings.autoplay) }
            { this.renderCheckbox("loop", strings.loop) }
          </Box>
        </Box>
        <Divider orientation="vertical" flexItem />
        <Box ml={ 4 } display="flex" alignItems="center">
          { this.renderPropertiesField("slideTimeOnScreen", strings.slideTimeOnScreen, "text") }
        </Box>
      </Box>
    );
  }

  /**
   * Renders advanced settings
   */
  private renderAdvancedSettings = () => {
    return (
      <>
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
                { this.renderFormField("orderNumber", strings.orderNumber, "number") }
              </Box>
              <Box mb={ 1 }>
                { this.renderFormField("slug", strings.slug, "text") }
              </Box>
              <Box mt={ 3 } mb={ 3 }>
                <Divider/>
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
      </>
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
   * Render checkbox
   *
   * @param key data key
   * @param label label
   */
  private renderCheckbox = (key: keyof ResourceSettingsForm, label: string) => {
    const { resourceMap } = this.state;
    const value = (resourceMap.get(key) === "true");

    return (
      <FormControlLabel
        label={ label }
        control={
          <Checkbox
            checked={ value }
            onChange={ e => this.onHandleCheckBoxChange(key, e.target.checked) }
          />
        }
      />
    );
  }

  /**
   * Renders table that contains style data
   */
  private renderStyleTable = () => {
    const { resourceData } = this.state;

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
          onRowAdd: async newData => {
            const updatedData = { ...resourceData };
            updatedData.styles.push(newData);
            this.props.confirmationRequired(true);

            this.setState({
              dataChanged: true,
              resourceData: updatedData
            });
          },
          onRowUpdate: async (newData, oldData) => {
            const updatedData = { ...resourceData };
            updatedData.styles.splice(updatedData.styles.indexOf(oldData), 1, newData);
            this.props.confirmationRequired(true);

            this.setState({
              dataChanged: true,
              resourceData: updatedData
            });
          },
          onRowDelete: async oldData => {
            const updatedData = { ...resourceData };
            updatedData.styles.splice(updatedData.styles.indexOf(oldData), 1);
            this.props.confirmationRequired(true);

            this.setState({
              dataChanged: true,
              resourceData: updatedData
            });
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
   * Renders table that contains properties data
   */
  private renderPropertiesTable = () => {
    const { resourceData } = this.state;

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
          onRowAdd: async newData => {
            const { resourceMap, iconsMap } = this.state;
            const updatedData = { ...resourceData };
            updatedData.properties.push(newData);
            this.addResourceToMap(newData, iconsMap, resourceMap);
            this.props.confirmationRequired(true);

            this.setState({
              dataChanged: true,
              resourceData: updatedData
            });
          },
          onRowUpdate: async (newData, oldData) => {
            const updatedData = { ...resourceData };
            updatedData.properties.splice(updatedData.properties.indexOf(oldData), 1, newData);
            this.updateMapsOnTableDataChange(oldData, newData);
            this.props.confirmationRequired(true);

            this.setState({
              dataChanged: true,
              resourceData: updatedData
            });
          },
          onRowDelete: async oldData => {
            const { iconsMap, resourceMap } = this.state;
            const updatedData = { ...resourceData };
            updatedData.properties.splice(updatedData.properties.indexOf(oldData), 1);
            this.deleteResourceFromMap(oldData, iconsMap, resourceMap);
            this.props.confirmationRequired(true);

            this.setState({
              resourceData: resourceData,
              dataChanged: true
            });
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
   * Render child resources list
   * TODO: Needs styles (Tuomas)
   */
  private renderChildResourcesList = () => {
    const { childResources } = this.state;
    const { classes } = this.props;

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
          <TableCell align="right">
            <IconButton
              size="small"
              color="primary"
              edge="end"
              aria-label="delete"
              onClick={ () => this.props.onDelete(resource) }
              title={ strings.delete }
            >
              <DeleteIcon />
            </IconButton>
          </TableCell>
        </TableRow>
      );
    });

    return(
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
              <TableCell align="right"/>
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
    const { properties } = this.state.form.values;

    if (!properties) {
      return;
    }

    const previewItem = this.findImage(properties, uploadKey) || "";

    return (
      <>
        <Typography variant="h4" style={{ marginBottom: theme.spacing(1), whiteSpace: "nowrap" }}>
          { title }
        </Typography>
        <ImagePreview
          uploadButtonText={ previewItem ? strings.fileUpload.changeMedia : strings.fileUpload.addMedia }
          imagePath={ previewItem }
          allowSetUrl={ true }
          onUpload={ this.onPropertyFileChange }
          onSetUrl={ this.onPropertyFileChange }
          resource={ resource }
          uploadKey={ uploadKey }
          onDelete={ this.onPropertyFileDelete }
        />
      </>
    );
  };

  /**
   * Render media elements
   */
  private renderIconList = () => {
    const { iconsMap } = this.state;
    const { classes, resource } = this.props;
    const icons: JSX.Element[] = [];

    iconsMap.forEach((value, key) => {
      const iconTypeKey = Object.values(IconKeys).find(k => key === k.toString());
      const displayName = iconTypeKey ?
        getLocalizedIconTypeString(iconTypeKey) :
        key;

      icons.push(
        <Box key={ key } className={ classes.gridItem }>
          <Typography variant="h5">
            { displayName }
          </Typography>
          <ImagePreview
            uploadButtonText={ resource ? strings.fileUpload.changeImage : strings.fileUpload.addImage }
            key={ key }
            imagePath={ value }
            allowSetUrl={ false }
            onUpload={ this.onIconFileChange }
            onSetUrl={ () => {} }
            resource={ resource }
            uploadKey={ key }
            onDelete={ this.onIconFileDelete }
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
   * Update resource and icons maps
   * @param resource resource
   */
  private updateMaps(resource: Resource) {
    const initResourceMap = new Map<string, string>();
    const initIconsMap = new Map<string, string>();
    const props = resource.properties;
    const allKeys = Object.values(IconKeys);

    if (props) {
      props.forEach(p => {
        const iconTypeKey = allKeys.find(k => p.key === k.toString());
        if (p.key.startsWith("icon_") || iconTypeKey ) {
          initIconsMap.set(p.key, p.value);
        } else {
          initResourceMap.set(p.key, p.value);
        }
      });
    }
    return { initResourceMap, initIconsMap };
  }

  /**
   * Find image from prop
   */
  private findImage = (properties: KeyValueProperty[], propertyKey: string) => {
    const foundItem = properties.find((p: KeyValueProperty) => p.key === propertyKey);
    if (foundItem) {
      return foundItem.value;
    }
    return;
  }

  /**
   * Handles image change
   *
   * @param newUri new URI
   * @param key key
   */
  private onPropertyFileChange = (newUri: string, key: string) => {
    const tempMap = this.state.resourceMap;
    tempMap.set(key, newUri);

    this.setState({
      resourceMap: tempMap,
      dataChanged: true
    });

    this.onUpdateResource();
  };

  /**
   * Handles icon change
   *
   * @param newUri new URI
   * @param key key
   */
  private onIconFileChange = (newUri: string, key: string) => {
    const tempMap = this.state.iconsMap;
    tempMap.set(key, newUri);

    this.setState({
      iconsMap: tempMap,
      dataChanged: true
    });

    this.onUpdateResource();
  };

  /**
   * Toggle dialog
   */
  private toggleDialog = () => {
    const open = !this.state.iconDialogOpen;
    this.setState({iconDialogOpen: open});
  }

  /**
   * Delete property file with key
   */
  private onPropertyFileDelete = (key: string) => {
    const tempMap = this.state.resourceMap;

    tempMap.delete(key);
    this.setState({
      resourceMap: tempMap,
      dataChanged: true
    });

    this.onUpdateResource();
  };

  /**
   * Delete icon file with key
   *
   * @param key key
   */
  private onIconFileDelete = (key: string) => {
    const tempMap = this.state.iconsMap;

    tempMap.delete(key);
    this.setState({
      iconsMap: tempMap,
      dataChanged: true
    });

    this.onUpdateResource();
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
      data: resourceData?.data,
      styles: resourceData?.styles,
      properties: this.getPropertiesToUpdate().filter(p => !!p.value)
    });

    this.setState({ dataChanged: false });
  };
  /**
   * Event handler for text field change
   *
   * @param key key
   * @param event change event
   */
  private onHandleChange = (key: keyof ResourceSettingsForm) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const copy = this.state.resourceMap;
    copy.set(key, event.target.value);

    this.setState({
      resourceMap: copy,
      dataChanged: true
    });
    this.props.confirmationRequired(true);
  };

  /**
   * Event handler for checkbox change
   *
   * @param key key
   * @param event change event
   */
  private onHandleCheckBoxChange = (key: keyof ResourceSettingsForm, value: boolean) => {
    const copy = this.state.resourceMap;
    const stringValue = String(value);
    copy.set(key, stringValue);
    this.setState({
      resourceMap: copy,
      dataChanged: true
    });
    this.props.confirmationRequired(true);
  };

  /**
   * Event handler for blur
   *
   * @param key key
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

  /**
   * Push all property key value pairs from state maps to properties array
   *
   * @returns list of key-value properties
   */
  private getPropertiesToUpdate = () => {
    const { resourceMap, iconsMap } = this.state;

    const properties: KeyValueProperty[] = [];

    resourceMap.forEach((value: string, key: string) => {
      const index = properties.findIndex((p: KeyValueProperty) => p.key === key);
      if (index > -1) {
        properties[index] = { key: key, value: value || "" };
      } else {
        properties.push({ key: key, value: value || "" });
      }
    });

    iconsMap.forEach((value: string, key: string) => {
      const index = properties.findIndex((p: KeyValueProperty) => p.key === key);
      if (index > -1) {
        properties[index] = { key: key, value: value || "" };
      } else {
        properties.push({ key: key, value: value || "" });
      }
    });

    return properties;
  }

  /**
   * Update map values based on new and old value.
   * TODO: This needs cleaner implementation
   * @param oldData old data from table
   * @param newData new data from table
   */
  private updateMapsOnTableDataChange = (
    oldData: ({ key: string; } & { value: string; }) | undefined,
    newData: { key: string; } & { value: string; }
  ) => {
    const { resourceMap, iconsMap } = this.state;

    if (oldData) {
      const keyChanged = oldData.key !== newData.key;
      const valueChanged = oldData.value !== newData.value;
      const inResourceMap = resourceMap.has(oldData.key);
      const inIconsMap = iconsMap.has(oldData.key);

      if ((keyChanged && valueChanged) || keyChanged) {
        if (inResourceMap) {
          resourceMap.delete(oldData.key);
          resourceMap.set(newData.key, newData.value);
        } else if (inIconsMap) {
          iconsMap.delete(oldData.key);
          iconsMap.set(newData.key, newData.value);
        }
      } else if (valueChanged) {
        if (inResourceMap) {
          resourceMap.set(oldData.key, newData.value);
        } else if (inIconsMap) {
          iconsMap.set(oldData.key, newData.value);
        }
      }
    } else {
      this.addResourceToMap(newData, iconsMap, resourceMap);
    }
  }

  /**
   * Adds resource to map
   *
   * @param newData new data
   * @param iconsMap icons map
   * @param resourceMap resource map
   */
  private addResourceToMap(
    newData: { key: string; } & { value: string; },
    iconsMap: Map<string, string>, resourceMap: Map<string, string>
  ) {
    if (newData.key.startsWith("icon_")) {
      iconsMap.set(newData.key, newData.value);
    } else {
      resourceMap.set(newData.key, newData.value);
    }
  }

  /**
   * Deletes resource from map
   *
   * @param oldData  old data
   * @param iconsMap icons map
   * @param resourceMap resource map
   */
  private deleteResourceFromMap(
    oldData: { key: string; } & { value: string; },
    iconsMap: Map<string, string>, resourceMap: Map<string, string>
  ) {
    if (oldData.key.startsWith("icon_")) {
      iconsMap.delete(oldData.key);
    } else {
      resourceMap.delete(oldData.key);
    }
  }

  /**
   * Fetches data
   */
  private fetchData = async () => {
    const { keycloak, customerId, deviceId, applicationId, resource } = this.props;
    const resourceId = resource.id;

    if (!keycloak?.token || !resourceId) {
      return;
    }

    let form = initForm<ResourceSettingsForm>(
      {
        ...resource,
      },
      resourceRules
    );

    form = validateForm(form);
    const { initResourceMap, initIconsMap } = this.updateMaps(resource);

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
        resourceData: ResourceToJSON(resource),
        childResources: childResources,
        resourceMap: initResourceMap,
        iconsMap: initIconsMap
      });
    } catch (error) {
      this.context.setError(strings.errorManagement.resource.list, error);
    }
  }
}

export default withStyles(styles)(MenuResourceSettingsView);