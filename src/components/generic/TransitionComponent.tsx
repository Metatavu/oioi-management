/* eslint-disable @typescript-eslint/no-useless-constructor */
import * as React from "react";
import { Collapse} from "@material-ui/core";
import { TransitionProps } from "@material-ui/core/transitions";
import { Spring } from "react-spring/renderprops";

class TransitionComponent extends React.Component<TransitionProps> {

  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: TransitionProps) {
    super(props);
  }

  /**
   * Component render method
   */
  public render() {
    return (
      <Spring
        from={{ opacity: 0, transform: "translate3d(20px,0,0)" }}
        to={{  opacity: this.props.in ? 1 : 0, transform: `translate3d(${ this.props.in ? 0 : 20 }px,0,0)`  }}>
        {(animationProps) => <div style={ animationProps }><Collapse { ...this.props } /></div> }
      </Spring>
    );
  }
}

export default TransitionComponent;