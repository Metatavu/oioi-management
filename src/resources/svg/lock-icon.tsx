import { SvgIcon, SvgIconProps } from "@material-ui/core";
import * as React from "react"

/**
 * Component properties
 */
interface Props extends SvgIconProps {}

/**
 * Logo svg component
 *
 * @param props component properties
 */
const LockIcon: React.FC<Props> = () => {
  return (
    <SvgIcon style={{ color: "red" }}>
      <path d="M18.2,7.1h-0.9V5.4c0-1.4-0.6-2.8-1.6-3.8S13.4,0.1,12,0.1S9.2,0.6,8.2,1.6c-1,1-1.6,2.3-1.6,3.8v1.8H5.8
        c-2,0-3.5,1.6-3.5,3.5v9.7c0,2,1.6,3.5,3.5,3.5h12.4c2,0,3.5-1.6,3.5-3.5v-9.7C21.7,8.7,20.1,7.1,18.2,7.1z M8.5,5.4
        c0-0.9,0.4-1.8,1-2.5c0.7-0.7,1.6-1,2.5-1s1.8,0.4,2.5,1c0.7,0.7,1,1.6,1,2.5v1.8H8.5V5.4z M20,20.4c0,1-0.8,1.8-1.8,1.8H5.8
        c-1,0-1.8-0.8-1.8-1.8v-9.7c0-1,0.8-1.8,1.8-1.8h12.4c1,0,1.8,0.8,1.8,1.8V20.4z"/>
    </SvgIcon>
  )
}

export default LockIcon;