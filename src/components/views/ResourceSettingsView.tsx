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

interface Props extends WithStyles<typeof styles> {
  resource: Resource;
  customerId: string;
  onUpdate(resource: Resource): void;
  onDelete(resource: Resource): void;
}

interface State {
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
      resourceId: "",
      resourceData: {}
    };
  }

  public componentDidMount() {
    const resourceId = this.props.resource.id;
    if (!resourceId) {
      return;
    }

    this.setState({
      resourceId: resourceId,
      resourceData: ResourceToJSON(this.props.resource)
    });
  }

  /**
   * Component did update method
   */
  public componentDidUpdate(prevProps: any) {
    const { resource } = this.props;
    const resourceId = this.props.resource.id;
    if (!resourceId) {
      return;
    }

    if (prevProps.resource !== resource) {
      this.setState({
        resourceId: resourceId,
        resourceData: ResourceToJSON(this.props.resource)
      });
    }
  }

  /**
   * Component render method
   */
  public render() {
    const { resourceData } = this.state;
    const localizedDataString = this.getLocalizedDataString();
    const dataField = this.renderDataField();

    return (
      <div>
        <TextField
          style={{ marginBottom: theme.spacing(3) }}
          variant="outlined"
          value={this.state.resourceData["name"]}
          onChange={this.onDataChange}
          name="name"
          label={strings.name}
        />
        <TextField
          style={{ marginLeft: theme.spacing(3) }}
          variant="outlined"
          value={this.state.resourceData["orderNumber"]}
          onChange={this.onDataChange}
          name="orderNumber"
          label={strings.orderNumber}
        />
        <TextField
          style={{ marginLeft: theme.spacing(3) }}
          variant="outlined"
          value={this.state.resourceData["slug"]}
          onChange={this.onDataChange}
          name="slug"
          label={strings.slug}
        />
        <Button
          style={{ marginLeft: theme.spacing(3), marginTop: theme.spacing(1) }}
          color="primary"
          variant="contained"
          startIcon={<SaveIcon />}
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
          value={this.state.resourceData["data"]}
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
      const fileData = resource.data;

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
   * Handles image change
   */
  private onImageChange = async (files: File[]) => {
    const { customerId } = this.props;
    const file = files[0];
    const response = await FileUpload.uploadFile(file, customerId);
    const { resourceData } = this.state;
    resourceData["data"] = response.uri;

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
    const { resourceData, resourceId } = this.state;
    resourceData["id"] = resourceId;
    const resource = ResourceFromJSON(resourceData);
    onUpdate(resource);
    this.setState({
      resourceData: resourceData
    });
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
}

export default withStyles(styles)(ResourceSettingsView);
