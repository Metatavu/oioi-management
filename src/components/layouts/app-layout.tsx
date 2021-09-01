import React from "react";
import { Box } from "@material-ui/core";
import { useEditorLayoutStyles } from "../../styles/layouts/app-layout";
import Header from "../generic/Header";
import BreadCrumb from "../generic/BreadCrumb";

/**
 * Application layout component
 *
 * @param props component properties
 */
const AppLayout: React.FC = ({ children }) => {
  const classes = useEditorLayoutStyles();

  /**
   * Component render
   */
  return (
    <Box className={ classes.root }>
      <Header/>
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