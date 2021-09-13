/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from "react";
import styles from "styles/generic/resource-tree-item";
import { withStyles, WithStyles, ListItem, ListItemIcon, ListItemText } from "@material-ui/core";
import { Resource, ResourceType } from "generated/client";
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

/**
 * Component props
 */
interface Props extends ExternalProps {
  resource: Resource;
  onSelect?: (resource: Resource) => void;
}

/**
 * Resource tree item
 */
class ResourceTreeItem extends React.Component<Props> {

  /**
   * Component render method
   */
  public render() {
    const {
      classes,
      resource,
      selectedResource
    } = this.props;

    return (
      <ListItem
        key={ resource.id }
        selected={ selectedResource?.id === resource.id }
        onClick={ () => this.onSelectResource(resource) }
      >
        <ListItemIcon className={ classes.icon }>
          { this.renderIcon(resource.type) }
        </ListItemIcon>
        <ListItemText primary={ resource.name }/>
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
   * get icon component by resource type method
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
}

/**
 * Map Redux state to props
 *
 * @param state Redux state
 */
const mapStateToProps = (state: ReduxState) => ({
  selectedResource: state.resource.selectedResource
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