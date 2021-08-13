import { Typography } from "@material-ui/core";
import * as React from "react";
import { useCallback, useState } from "react";
import strings from "../../localization/strings";
import { ErrorContextType } from "../../types";
import GenericDialog from "../generic/GenericDialog";

/**
 * Error context initialization
 */
export const ErrorContext = React.createContext<ErrorContextType>({
  setError: (message: string) => {}
});

/**
 * Provider for error context
 * 
 * @param children children of the component
 * @returns ErrorProvider component
 */
const ErrorHandler: React.FC = ({ children }) => {
  const [ error, setError ] = useState<string>();

  const contextValue = {
    setError: useCallback((message, error) => handleError(message, error), []),
  };

  /**
   * Handles error message and tries to print any given error to logs
   *
   * @param message error message
   * @param error any error
   */
  const handleError = async (message: string, error?: any): Promise<void> => {
    if (error) {
      if (error instanceof Response) {
        try {
          console.error(await error.json());
        } catch (e) {
          console.error(error);
        }
      }
    }

    setError(message);
  }

  /**
   * Renders error dialog
   */
  const renderErrorDialog = () => {
    return (
      <GenericDialog
        open={ error !== undefined }
        error={ false }
        onClose={ () => setError(undefined) }
        onCancel={ () => setError(undefined) }
        onConfirm={ () => setError(undefined) }
        title={ strings.errorManagement.title }
        positiveButtonText={ "OK" }
      >
        { error &&
          <Typography>{ error }</Typography>
        }
      </GenericDialog>
    );
  }

  /**
   * Component render
   */
  return (
    <ErrorContext.Provider value={ contextValue }>
      { renderErrorDialog() }
      { children }
    </ErrorContext.Provider>
  );
}

export default ErrorHandler;