import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { selectResource } from "../../actions/resources";
import { Resource } from "../../generated/client/src";
import { ReduxActions, ReduxState } from "../../store";
import "antd/dist/antd.css";

/**
 * Component properties
 */
interface Props {
  resources: Resource[];
  selectedResource?: Resource;
}

/**
 * Component state
 */
interface State {
  openNodes: string[];
}

/**
 * Resource tree component
 */
class ResourceTree extends React.Component<Props> {

  /**
   * Component did mount life cycle method
   */
  componentDidMount = () => {

  }

  /**
   * Component render method
   */
  public render = () => {
    return <></>;
  }

}

/**
 * Map Redux state to props
 *
 * @param state state
 */
const mapStateToProps = (state: ReduxState) => ({
  resources: state.resource.resources,
  selectedResource: state.resource.selectedResource
});

/**
 * Map Redux dispatch to props
 *
 * @param dispatch dispatch
 */
const mapDispatchToProps = (dispatch: Dispatch<ReduxActions>) => ({
  selectResource: (resource?: Resource) => dispatch(selectResource(resource))
});

export default connect(mapStateToProps, mapDispatchToProps)(ResourceTree);