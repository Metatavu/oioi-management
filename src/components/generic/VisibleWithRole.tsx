import * as React from "react";
import { useAppSelector } from "app/hooks";
import { selectKeycloak } from "features/auth-slice";

/**
 * Component props
 */
interface Props {
  role: string;
  children?: React.ReactNode;
}

/**
 * Shows content only if user has specified role
 *
 * @param props component properties
 */
const VisibleWithRole: React.FC<Props> = ({ role, children }) => {
  const keycloak = useAppSelector(selectKeycloak);

  return keycloak && keycloak.hasRealmRole(role) ?
    <>{ children }</> :
    null;
}

export default VisibleWithRole;