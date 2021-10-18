import * as React from "react";
import { useAppSelector } from "app/hooks";
import { selectKeycloak } from "features/auth-slice";
import { selectCustomer } from "features/customer-slice";

/**
 * Shows content only if user is admin or customer admin
 *
 * @param props component properties
 */
const AdminOnly: React.FC = ({ children }) => {
  const customer = useAppSelector(selectCustomer);
  const token = useAppSelector(selectKeycloak)?.tokenParsed;
  const roles = token?.realm_access?.roles;
  const groups = token?.groups;

  if (!roles || !customer || !groups) {
    return null;
  }

  if (!roles.includes("admin") && !groups.includes(`${customer.name}-admin`)) {
    return null;
  }

  return <>{ children }</>;
}

export default AdminOnly;