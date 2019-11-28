import * as React from "react";
import styles from "../../styles/editor-view";
import { withStyles, WithStyles, SvgIcon } from "@material-ui/core";
import LanguageIcon from "@material-ui/icons/Language";
import TreeItem from "@material-ui/lab/TreeItem";
import TransitionComponent from "../generic/TransitionComponent";
import { Resource, ResourceType } from "../../generated/client/src";
import ApiUtils from "../../utils/ApiUtils";
import { AuthState } from "../../types";
import { ReduxState, ReduxActions } from "../../store";
import { Dispatch } from "redux";
import { connect } from "react-redux";
import AddResourceDialog from "./AddResourceDialog";

const pageIconPath = <path d="M24 17H1.14441e-05V1.90735e-06H24V17ZM23 1H1V16H23V1Z" />;
const folderIconPath = <path d="M17.9999 18H-0.000127792V6H17.9999V18ZM20.9998 15H19.9998V4H2.99982V3H20.9998V15ZM0.999872 7H16.9999V17H0.999872V7ZM24 12H23V0.999998H6V-1.90735e-06H24V12Z" />;
const addIconPath = <path d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7zm-1-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />;

interface Props extends WithStyles<typeof styles> {
  customerId: string,
  deviceId: string,
  applicationId: string,
  resource: Resource,
  auth?: AuthState,
  onOpenResource(resource: Resource): void
}

interface State {
  open: boolean,
  addResourceDialogOpen: boolean,
  resource: Resource,
  parentResourceId?: string,
  childResources: Resource[]
}

class ResourceTreeItemClass extends React.Component<Props, State> {

  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      open: false,
      addResourceDialogOpen: false,
      resource: this.props.resource,
      childResources: []
    };
  }

  /**
   * Component render method
   */
  public render() {
    const { classes } = this.props;
    const { resource, childResources } = this.state;
    const treeItemStyles = {
      iconContainer: classes.treeIconContainer,
      group: classes.treeGroup,
      content: classes.treeContent,
      label: classes.treeLabel
    };

    const icon = this.getIconComponentByResourceType(resource.type);

    const childTreeItems = childResources ? childResources.map((resource) => this.renderTreeItem(resource)) : [];

    if (!resource.id) {
      return;
    }

    return (
      <div>
        <TreeItem
          classes={ treeItemStyles }
          TransitionComponent={ TransitionComponent }
          icon={ icon }
          nodeId={ resource.id }
          label={ this.state.resource.name }
          onClick={ this.onTreeItemClick }
        >
          {
            this.state.childResources != [] &&
            childTreeItems
          }
          {
            this.renderAdd()
          }
        </TreeItem>
        <AddResourceDialog
          open={ this.state.addResourceDialogOpen }
          parentResourceId={ this.state.parentResourceId || "" }
          saveClick={ this.onSaveNewResourceClick }
          handleClose={ this.onDialogCloseClick }
        />
      </div>
    )
  }

  /**
   * On treeItem open method
   */
  private onTreeItemClick = async () => {
    this.props.onOpenResource(this.props.resource);

    if (!this.state.open) {
      console.log(this.state.childResources);
      if (this.state.childResources.length === 0) {
        const { auth, customerId, deviceId, applicationId } = this.props;
        if (!auth || !auth.token) {
          return;
        }

        const resourcesApi = ApiUtils.getResourcesApi(auth.token);
        const childResources = await resourcesApi.listResources({ customer_id: customerId, device_id: deviceId, application_id: applicationId, parent_id: this.state.resource.id });
        this.setState({
          open: true,
          childResources: childResources
        })

        return;
      }
      this.setState({
        open: true
      });
    } else {
      this.setState({
        open: false
      });
    }
  }

  /**
   * Render treeItem method
   */
  private renderTreeItem = (resource: Resource) => {
    const { classes } = this.props;
    const { customerId, deviceId, applicationId } = this.props;

    return (
      <ResourceTreeItem
        resource={ resource }
        customerId={ customerId }
        deviceId={ deviceId }
        applicationId={ applicationId }
        classes={ classes }
        onOpenResource={ this.props.onOpenResource }
      />
    );
  }

  /**
   * Render add resource treeItem method
   */
  private renderAdd = () => {
    const resourceId = this.state.resource.id;
    if (!resourceId) {
      return;
    }

    return (
      <TreeItem TransitionComponent={ TransitionComponent }
        nodeId={ resourceId + "add" }
        icon={ <SvgIcon fontSize="small">{ addIconPath }</SvgIcon> }
        onClick={ this.onAddNewResourceClick }
      />
    );
  }

  private onAddNewResourceClick = () => {
    const parentResourceId = this.props.resource && this.props.resource.id;

    if (!parentResourceId) {
      return;
    }

    this.setState({
      addResourceDialogOpen: true,
      parentResourceId: parentResourceId
    });
  }

  private onSaveNewResourceClick = async (resource: Resource) => {
    const { auth, customerId, deviceId, applicationId } = this.props;

    if (!auth || !auth.token) {
      return;
    }
    const resourcesApi = ApiUtils.getResourcesApi(auth.token);

    const newResource = await resourcesApi.createResource({
      customer_id: customerId,
      device_id: deviceId,
      application_id: applicationId,
      resource: resource
    });

    const { childResources } = this.state;
    childResources.push(newResource);
    this.setState({
      addResourceDialogOpen: false,
      childResources: childResources
    });
  }

  /**
   * Close dialog method
   *
   * TODO: handle prompt if unsaved
   */
  private onDialogCloseClick = () => {
    this.setState({ addResourceDialogOpen: false });
  }

  /**
   * get icon component by resource type method
   * 
   * @param resourceType resource type
   */
  private getIconComponentByResourceType = (resourceType: ResourceType) => {
    switch (resourceType) {
      case ResourceType.INTRO: {
        return <SvgIcon fontSize="small">{ pageIconPath }</SvgIcon>;
      }
      case ResourceType.LANGUAGE: {
        return <LanguageIcon fontSize="small" />;
      }
      case ResourceType.MENU: {
        return <SvgIcon fontSize="small">{ folderIconPath }</SvgIcon>;
      }
      default: {
        return <SvgIcon fontSize="small">{ folderIconPath }</SvgIcon>;
      }
    }
  }
}

const mapStateToProps = (state: ReduxState) => ({
  auth: state.auth
});

const mapDispatchToProps = (dispatch: Dispatch<ReduxActions>) => {
  return {};
}

const ResourceTreeItem = connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(ResourceTreeItemClass));

export default ResourceTreeItem;