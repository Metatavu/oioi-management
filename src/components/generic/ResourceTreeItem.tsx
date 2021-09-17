/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from "react";
import styles from "styles/generic/resource-tree-item";
import { withStyles, WithStyles, ListItem, ListItemIcon, ListItemText, Box, Tooltip } from "@material-ui/core";
import { Resource, ResourceLock, ResourceType } from "generated/client";
import { ReduxDispatch, ReduxState } from "app/store";
import { connect, ConnectedProps } from "react-redux";
import { selectResource } from "features/resource-slice";

import LanguageIcon from "@material-ui/icons/Language";
import PageIcon from "@material-ui/icons/CropLandscapeOutlined";
import IntroIcon from "@material-ui/icons/VideoLibraryOutlined";
import MenuIcon from "@material-ui/icons/Menu";
import SlideshowIcon from "@material-ui/icons/SlideshowOutlined";
import VideoIcon from "@material-ui/icons/PlayCircleOutlineOutlined";
import TextIcon from "@material-ui/icons/TitleOutlined";
import PDFIcon from "@material-ui/icons/PictureAsPdfOutlined";
import ImageIcon from "@material-ui/icons/ImageOutlined";
import ApplicationIcon from "@material-ui/icons/LaptopMacOutlined";
import LockIcon from "../../resources/svg/lock-icon";
import Api from "api";

/**
 * Component props
 */
interface Props extends ExternalProps {
  resource: Resource;
  parent?: Resource;
  onSelect?: (resource: Resource) => void;
  parentLocked: boolean;
  locked: boolean;
  loading: boolean;
}

/**
 * Component state
 */
interface State {
  lockInfo?: ResourceLock;
}

/**
 * Resource tree item
 */
class ResourceTreeItem extends React.Component<Props, State> {

  /**
   * Component constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
    };
  }

  /**
   * Component did mount life cycle handler
   */
  public componentDidMount = async () => {
    await this.fetchLockInfo();
  }

  /**
   * Component did update life cycle handler
   *
   * @param prevProps previous props
   */
  public componentDidUpdate = async (prevProps: Props) => {
    if (!prevProps.locked && this.props.locked) {
      await this.fetchLockInfo();
    }
  }

  /**
   * Component render method
   */
  public render = () => {
    const {
      classes,
      resource,
      selectedResource,
      parentLocked,
      locked,
      loading,
      parent
    } = this.props;
    const { lockInfo } = this.state;

    const selected = selectedResource?.id === resource.id;
    const parentSelected = parent?.id === selectedResource?.id;
    const parentTypeIsPage = parent?.type === ResourceType.PAGE;
    const disabled = loading || (selectedResource?.id !== resource.id && locked) || (parentLocked && parentTypeIsPage && !parentSelected);

    return (
      <ListItem
        key={ resource.id }
        selected={ selected }
        onClick={ () => !disabled && this.onSelectResource(resource) }
        disabled={ disabled }
      >
        <ListItemIcon className={ classes.icon }>
          { this.renderIcon(resource.type) }
        </ListItemIcon>
        <ListItemText primary={ resource.name }/>
        { locked && !loading && !selected &&
          <Tooltip title={ lockInfo?.userDisplayName || "" }>
            <Box className={ classes.lockContainer }>
              <LockIcon
                fontSize="small"
                color="error"
              />
            </Box>
          </Tooltip> 
        }
      </ListItem>
    );
  }

  /**
   * Returns icon by resource type
   *
   * @param type resource type
   */
  private renderIcon = (type: ResourceType) => {
    const NodeIcon = this.getIconByResourceType(type);

    if (NodeIcon) {
      return (
        <NodeIcon
          fontSize="small"
          style={{ marginRight: 10 }}
        />
      );
    }
  }

  /**
   * Get icon component by resource type method
   *
   * @param resourceType resource type
   */
  private getIconByResourceType = (type: ResourceType) => ({
    [ResourceType.ROOT]: null,
    [ResourceType.CONTENTVERSION]: null,
    [ResourceType.INTRO]: IntroIcon,
    [ResourceType.PAGE]: PageIcon,
    [ResourceType.IMAGE]: ImageIcon,
    [ResourceType.VIDEO]: VideoIcon,
    [ResourceType.TEXT]: TextIcon,
    [ResourceType.PDF]: PDFIcon,
    [ResourceType.LANGUAGEMENU]: LanguageIcon,
    [ResourceType.LANGUAGE]: LanguageIcon,
    [ResourceType.MENU]: MenuIcon,
    [ResourceType.SLIDESHOW]: SlideshowIcon,
    [ResourceType.SLIDESHOWPDF]: PDFIcon,
    [ResourceType.APPLICATION]: ApplicationIcon
  })[type];

  /**
   * Event handler for select resource
   *
   * @param resource resource
   */
  private onSelectResource = (resource: Resource) => {
    const { onSelect, selectResource } = this.props;

    selectResource(resource);
    onSelect && onSelect(resource);
  }

  /**
   * Fetches lock info
   */
  private fetchLockInfo = async () => {
    const { keycloak, customer, device, application, resource } = this.props;

    if (!keycloak?.token || !customer?.id || !device?.id || !application?.id || !resource.id) {
      return;
    }

    const lockInfo = await Api.getResourcesApi(keycloak.token).findResourceLock({
      customerId: customer.id,
      deviceId: device.id,
      applicationId: application.id,
      resourceId: resource.id,
    });

    this.setState({ lockInfo: lockInfo });
  }
}

/**
 * Map Redux state to props
 *
 * @param state Redux state
 */
const mapStateToProps = (state: ReduxState) => ({
  keycloak: state.auth.keycloak,
  selectedResource: state.resource.selectedResource,
  customer: state.customer.customer,
  device: state.device.device,
  application: state.application.application,
});

/**
 * Map Redux dispatch to props
 *
 * @param dispatch Redux dispatch
 */
const mapDispatchToProps = (dispatch: ReduxDispatch) => ({
  selectResource: (resource?: Resource) => dispatch(selectResource(resource))
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type ExternalProps = ConnectedProps<typeof connector> & WithStyles<typeof styles>;

export default connector(withStyles(styles)(ResourceTreeItem));