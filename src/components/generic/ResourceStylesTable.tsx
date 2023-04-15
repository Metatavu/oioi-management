import { Resource } from "generated/client";
import React, { FC } from "react";
import strings from "../../localization/strings";
import StyledMTableToolbar from "../../styles/generic/styled-mtable-toolbar";
import MaterialTable from "material-table";
import { nanoid } from "@reduxjs/toolkit";
import { forwardRef } from "react";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import DeleteIcon from "@material-ui/icons/DeleteForever";
import CheckIcon from "@material-ui/icons/Check";
import ClearIcon from "@material-ui/icons/Clear";
import EditIcon from "@material-ui/icons/Edit";
import { ResourceUtils } from "utils/resource";
import { Paper } from "@material-ui/core";

/**
 * Component props
 */
interface Props {
  resourceData: Resource;
  onConfirmationRequired: (confirmationRequired: boolean) => void;
  onResourceDataChange: (resourceData: Resource) => void;
}

/**
 * Resource styles table component
 * 
 * @returns resource styles table component
 */
const ResourceStylesTable: FC<Props> = ({ resourceData, onConfirmationRequired, onResourceDataChange }: Props) => {
  if (!resourceData?.styles) {
    return null;
  }
  
  return (
    <MaterialTable
      key={ nanoid() }
      icons={{
        Add: forwardRef((props, ref) => <AddCircleIcon color="secondary" { ...props } ref={ ref } />),
        Delete: forwardRef((props, ref) => <DeleteIcon { ...props } ref={ ref } />),
        Check: forwardRef((props, ref) => <CheckIcon { ...props } ref={ ref } />),
        Clear: forwardRef((props, ref) => <ClearIcon { ...props } ref={ ref } />),
        Edit: forwardRef((props, ref) => <EditIcon { ...props } ref={ ref } />)
      }}
      columns={[
        { title: strings.key, field: "key" },
        { title: strings.value, field: "value" }
      ]}
      data={ resourceData.styles }
      editable={{
        onRowAdd: async updatedData => {
          const updatedResourceData = ResourceUtils.updateMaterialTableStyle(resourceData, updatedData);
          if (!updatedResourceData) {
            return;
          }

          onResourceDataChange(updatedResourceData);
          onConfirmationRequired(true);
        },
        onRowUpdate: async (updatedData, currentData) => {
          if (!currentData) {
            return;
          }

          const updatedResourceData = ResourceUtils.updateMaterialTableStyle(resourceData, currentData, updatedData);
          if (!updatedResourceData) {
            return;
          }

          onResourceDataChange(updatedResourceData);
        },
        onRowDelete: async updatedData => {
          const updatedResourceData = ResourceUtils.deleteFromStyleList(resourceData, updatedData.key);
          if (!updatedResourceData) {
            return;
          }

          onResourceDataChange(updatedResourceData);
          onConfirmationRequired(true);
        }
      }}
      title={ strings.styles }
      components={{
        Toolbar: props => <StyledMTableToolbar { ...props } />,
        Container: props => <Paper { ...props } elevation={ 0 }/>
      }}
      localization={{
        body: {
          editTooltip: strings.edit,
          deleteTooltip: strings.delete,
          addTooltip: strings.addNew
        },
        header: {
          actions: strings.actions
        }
      }}
      options={{
        grouping: false,
        search: false,
        selection: false,
        sorting: false,
        draggable: false,
        exportButton: false,
        filtering: false,
        paging: false,
        showTextRowsSelected: false,
        showFirstLastPageButtons: false,
        showSelectAllCheckbox: false,
        actionsColumnIndex: 3
      }}
    />
  );
};

export default ResourceStylesTable;