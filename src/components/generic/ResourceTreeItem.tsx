/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from "react";
import styles from "../../styles/editor-view";
import { withStyles, WithStyles, Typography } from "@material-ui/core";
import TreeItem from "@material-ui/lab/TreeItem";
import TransitionComponent from "../generic/TransitionComponent";
import { Resource, ResourceType } from "../../generated/client/src";
import ApiUtils from "../../utils/ApiUtils";
import { AuthState } from "../../types";
import { ReduxState, ReduxActions } from "../../store";
import { Dispatch } from "redux";
import { connect } from "react-redux";
import strings from "../../localization/strings";
import { openResource } from "../../actions/resources";

import LanguageIcon from "@material-ui/icons/Language";
import AddIcon from "@material-ui/icons/AddCircle";
import PageIcon from "@material-ui/icons/CropLandscapeOutlined";
import IntroIcon from "@material-ui/icons/VideoLibraryOutlined";
import MenuIcon from "@material-ui/icons/Menu";
import SlideshowIcon from "@material-ui/icons/SlideshowOutlined";
import UnknownIcon from "@material-ui/icons/HelpOutlineOutlined";
import VideoIcon from "@material-ui/icons/PlayCircleOutlineOutlined";
import TextIcon from "@material-ui/icons/TitleOutlined";
import PDFIcon from "@material-ui/icons/PictureAsPdfOutlined";

/**
 * Component props
 */
interface Props extends WithStyles<typeof styles> {
  customerId: string;
  deviceId: string;
  applicationId: string;
  resource: Resource;
  auth?: AuthState;
  openedResource?: Resource;
  openResource: typeof openResource;
  onDelete: (resourceId: string) => void;
  onOpenResource(resource: Resource): void;
}

/**
 * Component state
 */
interface State {
  resource: Resource;
  parentResourceId?: string;
}

/**
 * Creates tree item
 */
class ResourceTreeItemClass extends React.Component<Props, State> {
  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      resource: this.props.resource,
    };
  }

  /**
   * Component did update
   * @param prevProps
   * @param prevState
   */
  public componentDidUpdate = async (prevProps: Props, prevState: State) => {};

  /**
   * Component render method
   */
  public render() {
    const { classes } = this.props;
    const { resource } = this.state;

    const treeItemStyles = {
      iconContainer: classes.treeIconContainer,
      group: classes.treeGroup,
      content: classes.treeContent,
      label: classes.treeLabel
    };

    const icon = this.renderIconComponentByResourceType(resource.type);

    if (!resource.id) {
      return;
    }

    if (this.isAllowedChildren()) {
      return (
        <TreeItem
          classes={ treeItemStyles }
          TransitionComponent={ TransitionComponent }
          icon={ icon }
          nodeId={ resource.id }
          label={ this.state.resource.name }
          onClick={this.onTreeItemClick}
        >
          { this.renderAdd() }
        </TreeItem>
      );
    } else {
      return (
        <TreeItem
          classes={ treeItemStyles }
          TransitionComponent={ TransitionComponent }
          icon={ icon }
          nodeId={ resource.id }
          label={
            <div>
              { this.state.resource.name }
            </div>
          }
          onClick={ this.onTreeItemClick }
        />
      );
    }
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
      <TreeItem
        TransitionComponent={ TransitionComponent }
        nodeId={ resourceId + "add" }
        icon={ <AddIcon /> }
        label={ <Typography variant="h6">{ strings.addNew }</Typography> }
      />
    );
  };

  /**
   * get icon component by resource type method
   *
   * @param resourceType resource type
   */
  private renderIconComponentByResourceType = (resourceType: ResourceType) => {
    switch (resourceType) {
      case ResourceType.INTRO: {
        return <IntroIcon />;
      }
      case ResourceType.PAGE: {
        return <PageIcon />;
      }
      case ResourceType.VIDEO: {
        return <VideoIcon />;
      }
      case ResourceType.TEXT: {
        return <TextIcon />;
      }
      case ResourceType.PDF: {
        return <PDFIcon />;
      }
      case ResourceType.LANGUAGE: {
        return <LanguageIcon />;
      }
      case ResourceType.MENU: {
        return <MenuIcon />;
      }
      case ResourceType.SLIDESHOW : {
        return <SlideshowIcon />;
      }
      default: {
        return <UnknownIcon />;
      }
    }
  };

  /**
   * Delete method
   */
  private onDeleteIconClick = async () => {
    const { auth, customerId, deviceId, applicationId, resource } = this.props;
    const resourceId = resource.id;

    if (!auth || !auth.token || !resourceId) {
      return;
    }

    const resourcesApi = ApiUtils.getResourcesApi(auth.token);
    const childResources = await resourcesApi.listResources({
      customer_id: customerId,
      device_id: deviceId,
      application_id: applicationId,
      parent_id: resourceId
    });

    /**
     * TODO: prettier delete confirmation
     */
    if (window.confirm(`${strings.deleteResourceDialogDescription} ${resource.name} ${childResources && strings.andAllChildren}?`)) {
      await resourcesApi.deleteResource({ customer_id: customerId, device_id: deviceId, application_id: applicationId, resource_id: resourceId });
      await this.props.onDelete(resourceId);
    }
  };

  /**
   * On treeItem open method
   */
  private onTreeItemClick = async () => {
    this.props.onOpenResource(this.state.resource);
  };

  /**
   * check if resource is allowed to have children method
   */
  private isAllowedChildren = (): boolean => {
    const resourceType = this.props.resource.type;
    if (!resourceType) {
      return false;
    }

    return (
      resourceType !== ResourceType.IMAGE && resourceType !== ResourceType.PDF && resourceType !== ResourceType.TEXT && resourceType !== ResourceType.VIDEO
    );
  };
}

const mapStateToProps = (state: ReduxState) => ({
  auth: state.auth,
  openedResource: state.resource.resourceOpen
});

const mapDispatchToProps = (dispatch: Dispatch<ReduxActions>) => {
  return {
    openResource: (resource?: Resource) => dispatch(openResource(resource))
  };
};

const ResourceTreeItem = connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(ResourceTreeItemClass));

export default ResourceTreeItem;
