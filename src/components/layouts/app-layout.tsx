import React from "react";
import { Box } from "@material-ui/core";
import { useEditorLayoutStyles } from "../../styles/layouts/app-layout";
import Header from "../generic/Header";
import BreadCrumb from "../generic/BreadCrumb";
import { HeaderProps } from "../generic/Header";

interface Props {
  headerProps?: HeaderProps;
}

/**
 * Application layout component
 *
 * @param props component properties
 */
const AppLayout: React.FC<Props> = ({ children, headerProps }) => {
  const classes = useEditorLayoutStyles();

  /**
   * Component render
   */
  return (
    <Box className={ classes.root }>
      <Header
        {...headerProps}
      />
      <main className={ classes.content }>
        <BreadCrumb
          level={
            window.location.pathname
              .split("/")
              .filter(val => !!val)
              .length
          }
        />
        { children }
      </main>
    </Box>
  );
}

export default AppLayout;