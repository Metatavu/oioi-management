import * as React from "react";
import { withStyles, Theme, createStyles } from "@material-ui/core";
import TreeItem, { TreeItemProps } from "@material-ui/lab/TreeItem";
import { fade, WithStyles } from "@material-ui/core/styles";
import TransitionComponent from "./TransitionComponent";

interface Props extends WithStyles<typeof styles> {

}

interface State {

}

const styles = (theme: Theme) =>
  createStyles({
    iconContainer: {
      marginRight: 5,
      "& .close": {
        opacity: 0.3,
      },
    },
    group: {
      marginLeft: 12,
      paddingLeft: 12,
      borderLeft: `1px dashed ${fade(theme.palette.text.primary, 0.4)}`,
    },
  });

class StyledTreeItem extends React.Component<TreeItemProps, State> {

  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: TreeItemProps) {
    super(props);
    this.state = {

    };
  }

  /**
   * Component render method
   */
  public render() {
    return (
      <TreeItem
        TransitionComponent={TransitionComponent}
        nodeId={ this.props.nodeId }
        icon={ this.props.icon }
        label={ this.props.label }
      >
        {
          this.props.children
        }
      </TreeItem>
    );
  }
}

export default withStyles(styles)(StyledTreeItem);