/* eslint-disable @typescript-eslint/no-unused-vars */
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Divider, Link, Paper, TextField, Typography, withStyles, WithStyles } from "@material-ui/core";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import CheckIcon from "@material-ui/icons/Check";
import ClearIcon from "@material-ui/icons/Clear";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { nanoid } from "@reduxjs/toolkit";
import { getAllowedFileTypes } from "commons/resourceTypeHelper";
import AdminOnly from "components/containers/AdminOnly";
import FileUploader from "components/generic/FileUploader";
import Keycloak from "keycloak-js";
import MaterialTable from "material-table";
import AudioPlayer from "material-ui-audio-player";
import * as React from "react";
import { forwardRef } from "react";
import theme from "styles/theme";
import { Form, initForm, MessageType, validateForm } from "ts-form-validation";
import { ResourceUtils } from "utils/resource";
import { resourceRules, ResourceSettingsForm } from "../../commons/formRules";
import { Resource, ResourceToJSON } from "../../generated/client";
import strings from "../../localization/strings";
import styles from "../../styles/editor-view";
import StyledMTableToolbar from "../../styles/generic/styled-mtable-toolbar";
import { ErrorContextType } from "../../types";
import { ErrorContext } from "../containers/ErrorHandler";

/**
 * Component props
 */
interface Props extends WithStyles<typeof styles> {
  keycloak?: Keycloak;
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
  canPlay: boolean;
}

/**
 * Component for audio resource settings view
 */
class AudioResourceSettingsView extends React.Component<Props, State> {

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
      dataChanged: false,
      canPlay: false
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
    const { classes, onDelete } = this.props;
    const { loading, dataChanged, form } = this.state;
    const { isFormValid } = form;

    if (loading) {
      return null;
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
        <AdminOnly>
          { this.renderAdvancedSettings() }
        </AdminOnly>
        <Box mt={1}>
          <Button
            disableElevation
            className={ classes.deleteButton }
            color="primary"
            variant="contained"
            onClick={ onDelete }
          >
            { strings.audioSettingsView.delete }
          </Button>
        </Box>
      </Box>
    );
  }

  /**
   * Renders text field
   *
   * @param key to look for
   * @param placeholder placeholder text
   * @param type text field type
   * @returns rendered text field
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
        value={ values[key] ?? "" }
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
    const { resource, classes } = this.props;
    const { resourceData } = this.state;

    if (!resource.id) {
      return;
    }

    const src = resourceData.data;
    return (
      <Box className={ classes.audioPreview }>
        { this.renderPlayer(src) }
        { this.renderDownloadLink(src) }
        { this.renderUpload(src) }
      </Box>
    );
  }

  /**
   * Renders player for audio file
   *
   * @param src URL to existing audio file or none if not set
   * @returns rendered player
   */
  private renderPlayer = (src: string | undefined) => {
    if (!src) {
      return null;
    }

    return (
      <AudioPlayer
        elevation={ 1 }
        width="100%"
        variation="primary"
        download={ false }
        loop={ false }
        spacing={ 1 }
        debug={ false }
        src={ [ src ] }
      />
    );
  }

  /**
   * Renders download link for audio file
   *
   * @param src URL to existing audio file or none if not set
   * @returns rendered link or null if not set
   */
  private renderDownloadLink = (src: string | undefined) => {
    if (!src) {
      return null;
    }

    return (
      <Box style={{ paddingLeft: theme.spacing(2), paddingRight: theme.spacing(2) }}>
        <Link href={ src } download={ true } target={ "_blank" }>
          { strings.audioSettingsView.download }
        </Link>
      </Box>
    );
  }

  /**
   * Renders file uploader for audio file
   *
   * @param src URL to existing audio file or none if not set
   * @returns rendered file uploader
   */
  private renderUpload = (src: string | undefined) => {
    const { resource } = this.props;

    return (
      <FileUploader
        title={ strings.audioSettingsView.uploadAudioTitle }
        uploadButtonText={ src ? strings.audioSettingsView.changeAudioFile : strings.audioSettingsView.uploadAudioFile }
        allowSetUrl={ false }
        onUpload={ this.onAudioFileChange }
        uploadKey={ resource.id }
        allowedFileTypes={ getAllowedFileTypes(resource.type) }
      />
    );
  }

  /**
   * Renders advanced settings
   */
  private renderAdvancedSettings = () => {
    const { classes } = this.props;

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

  /**
   * Handles audio file change
   *
   * @param newUri new URI
   */
  private onAudioFileChange = (newUri: string) => {
    const { resourceData } = this.state;

    this.setState({
      dataChanged: true,
      resourceData: { ...resourceData, data: newUri }
    });
  };

}

export default withStyles(styles)(AudioResourceSettingsView);