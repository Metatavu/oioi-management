import * as React from "react";
import { withStyles, WithStyles, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Divider, Typography, Grid } from "@material-ui/core";
import styles from "../../styles/dialog";
import { DropzoneArea } from "material-ui-dropzone";
import { Customer } from "../../generated/client/src";
import strings from "../../localization/strings";
import FileUpload from "../../utils/FileUpload";
import { DialogType } from "../../types/index";

interface Props extends WithStyles<typeof styles> {
  /**
   * Dialog open state
   */
  open: boolean;

  /**
   * Dialog type
   */
  dialogType: DialogType;

  /**
   * Customer
   */
  customer?: Customer;

  /**
   * Save button click
   */
  saveClick(customer: Customer, dialogType: DialogType): void;
  /**
   * Close handler
   */
  handleClose(): void;
}

interface State {
  customerData: Partial<Customer>;
}

/**
 * Creates customer dialog component
 */
class CustomerDialog extends React.Component<Props, State> {
  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      customerData: {}
    };
  }

  /**
   * Component did mount
   */
  public componentDidMount = () => {
    this.setState({
      customerData: {
        ...this.props.customer
      }
    });
  };

  /**
   * Component did update
   */
  public componentDidUpdate = (prevProps: Props, prevState: State) => {
    if (prevProps.customer !== this.props.customer) {
      this.setState({
        customerData: {
          ...this.props.customer
        }
      });
    }
  };

  /**
   * Component render method
   */
  public render() {
    const { classes, dialogType } = this.props;

    return (
      <Dialog fullScreen={false} open={this.props.open} onClose={this.props.handleClose} aria-labelledby="dialog-title">
        <DialogTitle id="dialog-title">
          <div>
            <Typography variant="h2">{this.renderDialogTitle(dialogType)}</Typography>
          </div>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item className={classes.fullWidth}>
              <TextField
                fullWidth
                variant="outlined"
                value={this.state.customerData.name || ""}
                onChange={this.onDataChange}
                name="name"
                label={strings.name}
                disabled={dialogType === "show"}
              />
            </Grid>
            <Grid item className={classes.fullWidth}>
              {dialogType !== "show" && (
                <>
                  <Typography variant="subtitle1">{strings.customerLogo}</Typography>
                  <DropzoneArea
                    dropzoneClass={classes.dropzone}
                    dropzoneParagraphClass={classes.dropzoneText}
                    dropzoneText={strings.dropFile}
                    onChange={this.onImageChange}
                  />
                </>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <Divider />
        <DialogActions>
          <Button variant="outlined" onClick={this.props.handleClose} color="primary">
            {strings.cancel}
          </Button>
          {dialogType !== "show" && (
            <Button variant="contained" onClick={this.onSave} color="primary" autoFocus>
              {strings.save}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    );
  }

  /**
   * Renders dialog title by type
   * @param dialogType
   */
  private renderDialogTitle = (dialogType: DialogType) => {
    switch (dialogType) {
      case "edit":
        return strings.editCustomer;
      case "show":
        return strings.customerInformation;

      case "new":
        return strings.addNewCustomer;

      default:
        return strings.addNewCustomer;
    }
  };

  /**
   * Handles save button click
   */
  private onSave = () => {
    const { saveClick, dialogType } = this.props;
    const { customerData } = this.state;

    saveClick(customerData as Customer, dialogType);
  };

  /**
   * Handles data change
   * @param e
   */
  private onDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { customerData } = this.state;

    this.setState({
      customerData: { ...customerData, [e.target.name]: e.target.value }
    });
  };

  /**
   * Handles image changes
   * @param files
   */
  private onImageChange = async (files: File[]) => {
    const file = files[0];
    const response = await FileUpload.uploadFile(file, "customerImages");
    const { customerData } = this.state;

    this.setState({
      customerData: { ...customerData, image_url: response.uri }
    });
  };
}

export default withStyles(styles)(CustomerDialog);
