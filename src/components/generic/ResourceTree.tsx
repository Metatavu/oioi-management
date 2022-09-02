import * as React from "react";
import { connect, ConnectedProps } from "react-redux";
import Api from "api";
import { Resource, ResourceType } from "../../generated/client";
import { ReduxDispatch, ReduxState } from "app/store";
import { setResources, updateResources } from "features/resource-slice";
import strings from "localization/strings";
import { ErrorContext } from "components/containers/ErrorHandler";
import { ErrorContextType } from "types";
import { ListItem, ListItemIcon, ListItemText, withStyles, WithStyles } from "@material-ui/core";
import SortableTree, { TreeItem, NodeData, FullTree, OnMovePreviousAndNextLocation, ExtendedNodeData, OnDragPreviousAndNextLocation, OnVisibilityToggleData } from "react-sortable-tree";
import FileExplorerTheme from "react-sortable-tree-theme-file-explorer";
import styles from "styles/generic/resource-tree";
import ResourceTreeItem from "./ResourceTreeItem";
import { resolveChildResourceTypes } from "commons/resourceTypeHelper";
import AddIcon from "@material-ui/icons/AddCircle";
import { toast } from "react-toastify";
import { ResourceUtils } from "utils/resource";
import AddResourceDialog from "./AddResourceDialog";
import theme from "styles/theme";
import { Config } from "app/config";
import deepEqual from "fast-deep-equal";

/**
 * Component properties
 */
interface Props extends ExternalProps { 
  selectResource: (resource?: Resource) => void;
  lockedResourceIds: string[];
}

/**
 * Component state
 */
interface State {
  treeData: TreeItem[];
  expandedKeys: string[];
  addResourceDialogOpen: boolean;
  loading: boolean;
  updating: boolean;
}

/**
 * Resource tree component
 */
class ResourceTree extends React.Component<Props, State> {

  static contextType: React.Context<ErrorContextType> = ErrorContext;

  private resourceLockInterval?: NodeJS.Timeout;

  /**
   * Component constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      treeData: [],
      expandedKeys: [],
      addResourceDialogOpen: false,
      loading: false,
      updating: false
    };
  }

  /**
   * Component did mount life cycle method
   */
  public componentDidMount = async () => {
    const {
      resources,
      selectedContentVersionId,
      keycloak,
      customer,
      device,
      application
    } = this.props;

    if (!keycloak?.token || !customer?.id || !device?.id || !application?.id || !selectedContentVersionId) {
      return;
    }

    this.setState({ treeData: this.buildTree(resources) });

    window.addEventListener("beforeunload", this.componentCleanup);
  }

  /**
   * Component did update life cycle method
   *
   * @param prevProps previous component properties
   */
  public componentDidUpdate = async (prevProps: Props) => {
    const { resources, selectedResource, lockedResourceIds } = this.props;


    const selectedResourceChanged = !deepEqual(prevProps.selectedResource, selectedResource) || prevProps.selectedResource?.id !== selectedResource?.id;
    const lockedResourcesChanged = !deepEqual(prevProps.lockedResourceIds, lockedResourceIds);
    const loading = selectedResourceChanged || lockedResourcesChanged;
    
    if (loading) {
      this.setState({ 
        loading: true
      });
    };

    if (selectedResourceChanged) {
      await this.releaseAndAcquireLock(selectedResource, prevProps.selectedResource);
      this.resourceLockInterval = setInterval(this.renewLock, 10000);
    };

    if (selectedResourceChanged || lockedResourcesChanged) {
      this.setState({ 
        treeData: this.buildTree(resources)
      });
    };

    if (loading) {
      this.setState({ 
        loading: false
      });
    };
  }

  /**
   * Component will unmount life cycle handler
   */
  public componentWillUnmount = async () => {
    this.componentCleanup();
    window.removeEventListener("beforeunload", this.componentCleanup);
  }

  /**
   * Component clean up for unmount and beforeunload page event
   */
  private componentCleanup = () => {
    const { selectedResource } = this.props;

    selectedResource && this.releaseLock(selectedResource);
    this.resourceLockInterval && clearInterval(this.resourceLockInterval);
    this.releaseLockWithServiceWorker();
  }

  /**
   * Releases lock with service worker
   */
  private releaseLockWithServiceWorker = () => {
    const { keycloak, customer, device, application, selectedResource } = this.props;

    if (!keycloak?.token || !customer?.id || !device?.id || !application?.id || !selectedResource?.id) {
      return;
    }

    navigator.serviceWorker.controller?.postMessage({
      url: `${Config.get().api.baseUrl}/v1/customers/${customer.id}/devices/${device.id}/applications/${application.id}/resources/${selectedResource.id}/lock`,
      method: "DELETE",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        "Authorization": `Bearer ${keycloak.token}`
      },
      body: JSON.stringify({
        customerId: customer.id,
        deviceId: device.id,
        applicationId: application.id,
        resourceId: selectedResource.id
      })
    });
  }

  /**
   * Component render
   */
  public render = () => {
    const { classes, selectedResource } = this.props;
    const { treeData, addResourceDialogOpen } = this.state;

    return (
      <>
        { this.renderAdd() }
        <SortableTree
          className={ classes.treeWrapper }
          innerStyle={{ padding: theme.spacing(2) }}
          rowHeight={ 36 }
          treeData={ treeData }
          getNodeKey={({ node }) => node.id }
          onChange={ treeData => this.setState({ treeData: treeData }) }
          onVisibilityToggle={ this.onVisibilityToggle }
          onMoveNode={ this.onMoveNode }
          canDrag={ this.canDrag }
          canDrop={ this.canDrop }
          canNodeHaveChildren={ this.canHaveChildren }
          theme={ FileExplorerTheme }
        />
        { selectedResource?.id &&
          <AddResourceDialog
            open={ addResourceDialogOpen }
            onClose={ () => this.setState({ addResourceDialogOpen: false }) }
          />
        }
      </>
    );
  }

  /**
   * Renders add resource list item
   *
   * @param parentResource parent resource
   */
  private renderAdd = (parentResource?: Resource) => {
    const { classes, resources } = this.props;

    const selectedContentVersion = this.getSelectedContentVersion();

    if (!selectedContentVersion) {
      return null;
    }

    const rootResourcesExist = (
      resources.some(resource => resource.type === ResourceType.INTRO) &&
      resources.some(resource => resource.type === ResourceType.LANGUAGEMENU)
    )

    if (!parentResource?.id && rootResourcesExist) {
      return null;
    }

    return (
      <ListItem
        className={ classes.treeAddItem }
        onClick={ this.onAddResource(parentResource ?? selectedContentVersion) }
        key={ `${parentResource?.id || selectedContentVersion.id}-add` }
      >
        <ListItemIcon style={{ minWidth: 0, marginRight: 8 }}>
          <AddIcon fontSize="small"/>
        </ListItemIcon>
        <ListItemText
          className={ classes.addResourceText }
          primary={ parentResource?.id ? strings.addNew : strings.addNewIntroOrLanguageMenu }
        />
      </ListItem>
    );
  };

  /**
   * Toggles item expanded state
   *
   * @param item tree item or resource
   * @param expanded expanded
   */
  private toggleExpanded = (item: TreeItem | Resource, expanded: boolean) => {
    const { expandedKeys } = this.state;

    if (expanded) {
      !expandedKeys.includes(item.id) && this.setState({
        expandedKeys: [ ...expandedKeys, item.id ]
      });
    } else {
      this.setState({
        expandedKeys: expandedKeys.filter(key => key !== item.id)
      });
    }
  }

  /**
   * Builds tree structure
   *
   * @param resources resources
   *
   * @returns tree structure as array of data nodes
   */
  private buildTree = (resources: Resource[]): TreeItem[] => {
    const { selectedContentVersionId } = this.props;

    if (!selectedContentVersionId) {
      return [];
    }

    const treeData = this.recursiveTree(resources, selectedContentVersionId);

    return treeData;
  }

  /**
   * Releases single resource lock
   *
   * @param resource resource
   */
  private releaseLock = async (resource: Resource) => {
    const { keycloak, customer, device, application } = this.props;

    if (!keycloak?.token || !customer?.id || !device?.id || !application?.id || !resource.id) {
      return;
    }

    try {
      await Api.getResourcesApi(keycloak.token).deleteResourceLock({
        customerId: customer.id,
        deviceId: device.id,
        applicationId: application.id,
        resourceId: resource.id
      });
    } catch (error) {
      console.error("Failed to release lock", error);
    }
  }

  /**
   * Release old resource lock and acquire new lock for selected resource
   *
   * @param previousResource previous resource
   * @param newResource new resource
   */
  private releaseAndAcquireLock = async (newResource?: Resource, previousResource?: Resource) => {
    const { keycloak, customer, device, application, selectResource } = this.props;

    if (!keycloak?.token || !customer?.id || !device?.id || !application?.id || !newResource?.id) {
      return;
    }

    const resourcesApi = Api.getResourcesApi(keycloak.token);
    try {
      if (previousResource) {
        await this.releaseLock(previousResource);
        this.resourceLockInterval && clearInterval(this.resourceLockInterval);
      }
    } catch (error) {
      console.error("Error while releasing lock", error);
    }

    try {
      await resourcesApi.updateResourceLock({
        customerId: customer.id,
        deviceId: device.id,
        applicationId: application.id,
        resourceId: newResource.id,
        resourceLock: {}
      });

    } catch (error) {
      if (error instanceof Response && error.status === 409) {
        selectResource(undefined);
        this.context.setError(strings.errorManagement.resource.otherUserEditing, error);
      } else {
        console.error("Failed to obtain lock", error);
      }
    }

    this.setState({ loading: false });
  }

  /**
   * Renews single lock
   */
  private renewLock = async () => {
    const {
      keycloak,
      customer,
      device,
      application,
      selectedResource
    } = this.props;

    if (!keycloak?.token || !customer?.id || !device?.id || !application?.id || !selectedResource?.id) {
      return;
    }

    await Api.getResourcesApi(keycloak.token).updateResourceLock({
      customerId: customer.id,
      deviceId: device.id,
      applicationId: application.id,
      resourceId: selectedResource.id,
      resourceLock: {}
    });
  }

  /**
   * Recursive tree
   *
   * @param resources resources
   * @param parentId parent ID
   *
   * @returns list of tree items
   */
  private recursiveTree = (resources: Resource[], parentId: string): TreeItem[] => {
    const { lockedResourceIds, selectedResource } = this.props;
    const { loading } = this.state;

    const tree = [ ...resources ].reduce<TreeItem[]>((tree, resource) => {
      if (!resource?.id || resource.parentId !== parentId) {
        return tree;
      }

      const locked = lockedResourceIds.includes(resource.id);
      const parentLocked = lockedResourceIds.includes(resource.parentId);
      const treeItem = this.translateToTreeItem(resource, locked, parentLocked, loading);

      const children: TreeItem[] = [];

      const foundChildren = resources.some(child => child.parentId === resource.id);
      if (foundChildren) {
        children.push(...this.recursiveTree(resources, resource.id));
      }

      if (selectedResource?.id === resource.id && this.canHaveChildren(treeItem)) {
        children.push({ title: this.renderAdd(resource) });
      }

      if (children.length) {
        treeItem.children = children;
      }

      tree.push(treeItem);
      return tree;
    }, []);

    return tree.sort(this.sortByOrderNumber);
  }

  /**
   * Sort tree items by order number
   *
   * @param itemA tree item A
   * @param itemB tree item B
   */
  private sortByOrderNumber = (itemA: TreeItem, itemB: TreeItem) => {
    const orderNumberA: number = Number(itemA.resource?.orderNumber);
    const orderNumberB: number = Number(itemB.resource?.orderNumber);

    if (Number.isNaN(orderNumberA) && Number.isNaN(orderNumberB)) return 0;
    if (Number.isNaN(orderNumberA) && !Number.isNaN(orderNumberB)) return -1;
    if (!Number.isNaN(orderNumberA) && Number.isNaN(orderNumberB)) return 1;

    return orderNumberA - orderNumberB;
  }

  /**
   * Translates resource to tree item
   *
   * @param resource resource
   * @returns translated tree item
   */
  private translateToTreeItem = (resource: Resource, locked: boolean, parentLocked: boolean, loading: boolean): TreeItem => ({
    id: resource.id,
    key: resource.id,
    parentId: resource.parentId,
    orderNumber: resource.orderNumber,
    title: (
      <ResourceTreeItem
        parent={ this.props.resources.find(_resource => _resource.id === resource.parentId) }
        resource={ resource }
        parentLocked={ parentLocked }
        locked={ locked }
        loading={ loading }
        selectResource={ this.props.selectResource }
      />
    ),
    expanded: this.state.expandedKeys.includes(resource.id || ""),
    resource: resource
  });

  /**
   * Event handler for node visibility toggle
   *
   * @param event on visibility toggle event
   */
  private onVisibilityToggle = async (event: OnVisibilityToggleData) => {
    const { resources, setResources } = this.props;
    const { expanded, node } = event;

    this.toggleExpanded(node, expanded);

    if (
      !expanded ||
      !node.children ||
      !Array.isArray(node.children) ||
      !node.children.length
    ) {
      return;
    }

    try {
      const childrenOfChildren = await Promise.all(
        node.children
          .filter(child => !child.children && !!child.id)
          .map(child => this.listChildResources(child.id))
      );

      setResources([ ...resources, ...childrenOfChildren.flat() ]);
    } catch (error) {
      this.context.setError(strings.errorManagement.resource.listChild, error);
    }
  }

  /**
   * Event handler for move node
   *
   * @param data tree data change info object
   */
  private onMoveNode = async (data: NodeData & FullTree & OnMovePreviousAndNextLocation) => {
    const { keycloak, customer, device, application, updateResources } = this.props;
    const { treeData } = this.state;

    if (!keycloak?.token || !customer?.id || !device?.id || !application?.id) {
      return;
    }

    try {
      const { nextParentNode } = data;
      const nodesToUpdate = !!nextParentNode?.children && Array.isArray(nextParentNode.children) ?
        nextParentNode.children :
        treeData;

      if (!nodesToUpdate) {
        return;
      }

      const resourcesToUpdate = nodesToUpdate.reduce<Resource[]>((list, { resource }, index) => {
        if (resource) {
          list.push({
            ...resource,
            orderNumber: index + 1,
            parentId: nextParentNode?.resource?.id ?? resource.parentId
          });
        }

        return list;
      }, []);

      this.setState({
        updating: true
      });
      
      await Promise.all(resourcesToUpdate.map(this.updateResource));
      updateResources(resourcesToUpdate);

      this.setState({
        updating: false
      });

      toast.success(strings.updateSuccessMessage);
      
    } catch (error) {
      this.context.setError(strings.errorManagement.resource.update, error);
    }
  }

  /**
   * Event handler creator for add resource
   *
   * @param parentResource parent resource
   */
  private onAddResource = (parentResource: Resource) => () => {
    const { selectResource } = this.props;

    selectResource(parentResource);
    this.setState({ addResourceDialogOpen: true });
  }

  /**
   * Returns boolean value based on check whether item can be dragged
   *
   * @param data tree data object
   */
  private canDrag = (data: ExtendedNodeData) => {
    const { lockedResourceIds } = this.props;
    const { updating } = this.state;
    const { node } = data;
    const resource = node.resource;
    const resourceId = resource?.id;

    if (updating || !resourceId) {
      return false;
    }

    return !lockedResourceIds.includes(resourceId);
  }

  /**
   * Returns boolean value based on check whether item can be dropped
   *
   * @param data event data
   */
  private canDrop = (data: OnDragPreviousAndNextLocation & NodeData) => {
    const { updating } = this.state;
    
    if (updating) {
      return false;
    }
    
    if (data.nextParent && !this.canHaveChildren(data.nextParent)) {
      return false;
    }

    if (!ResourceUtils.isValidParentType(data.nextParent?.resource?.type, data.node.resource?.type)) {
      return false;
    }

    return true;
  }

  /**
   * Returns boolean value based on check whether item can have children
   *
   * @param node node to check
   */
  private canHaveChildren = (node: TreeItem) => {
    const resourceType = node.resource?.type as ResourceType | undefined;
    return resourceType ? !!resolveChildResourceTypes(resourceType).length : true;
  }

  /**
   * Updates resource
   *
   * @param resource resource to update
   *
   * @returns updated resource
   */
  private updateResource = (resource: Resource): Promise<Resource> => {
    const { keycloak, customer, device, application } = this.props;

    if (!keycloak?.token || !customer?.id || !device?.id || !application?.id || !resource?.id) {
      return Promise.reject("No access token, customer, device, application or resource ID found");
    }

    try {
      return Api.getResourcesApi(keycloak.token).updateResource({
        customerId: customer.id,
        deviceId: device.id,
        applicationId: application.id,
        resourceId: resource.id,
        resource: resource
      });
    } catch (error) {
      return Promise.reject(strings.errorManagement.resource.update);
    }
  }

  /**
   * List child resources
   *
   * @param parentId parent ID
   *
   * @returns list for resources
   */
  private listChildResources = async (parentId: React.Key): Promise<Resource[]> => {
    const { keycloak, customer, device, application } = this.props;

    if (!keycloak?.token) {
      throw new Error("No keycloak token");
    }

    if (!customer?.id || !device?.id || !application?.id) {
      throw new Error("customer, device or application missing");
    }

    try {
      return await Api.getResourcesApi(keycloak.token).listResources({
        customerId: customer.id,
        deviceId: device.id,
        applicationId: application.id,
        parentId: parentId.toString()
      });
    } catch (error) {
      return Promise.reject(new Error(strings.errorManagement.resource.listChild));
    }
  }

  /**
   * Returns selected content version or undefined if not set
   * 
   * @returns selected content version or undefined if not set
   */
  private getSelectedContentVersion = () => {
    const { selectedContentVersionId, contentVersions } = this.props;
    if (!selectedContentVersionId) {
      return undefined;
    }

    return contentVersions.find(contentVersion => contentVersion.id === selectedContentVersionId);
  }

}

/**
 * Map Redux state to props
 *
 * @param state state
 */
const mapStateToProps = (state: ReduxState) => ({
  keycloak: state.auth.keycloak,
  customer: state.customer.customer,
  device: state.device.device,
  application: state.application.application,
  contentVersions: state.contentVersion.contentVersions,
  selectedContentVersionId: state.contentVersion.selectedContentVersionId,
  resources: state.resource.resources,
  selectedResource: state.resource.selectedResource,
  lockedResourceIds: state.resource.lockedResourceIds
});

/**
 * Map Redux dispatch to props
 *
 * @param dispatch dispatch
 */
const mapDispatchToProps = (dispatch: ReduxDispatch) => ({
  setResources: (resources: Resource[]) => dispatch(setResources(resources)),
  updateResources: (resources: Resource[]) => dispatch(updateResources(resources))
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type ExternalProps = ConnectedProps<typeof connector> & WithStyles<typeof styles>;

export default connector(withStyles(styles)(ResourceTree));