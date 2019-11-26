import * as React from "react";
import { withStyles, WithStyles, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Divider, Typography, Grid } from "@material-ui/core";
import styles from "../../styles/dialog";
import { DropzoneArea } from "material-ui-dropzone";
import { Customer, CustomerFromJSON } from "../../generated/client/src";
import strings from "../../localization/strings";
import FileUpload from './../../utils/FileUpload';

interface Props extends WithStyles<typeof styles> {
  /**
   * Dialog open state
   */
  open: boolean
  /**
   * Save button click
   */
  saveClick(customer: Customer): void
  /**
   * Close handler
   */
  handleClose(): void
}

interface State {
  customerData: any
}

class AddCustomerDialog extends React.Component<Props, State> {

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
   * Component render method
   */
  public render() {
    const { classes } = this.props;
    return (
      <Dialog
        fullScreen={ false }
        open={ this.props.open }
        onClose={ this.props.handleClose }
        aria-labelledby="dialog-title"
      >
        <DialogTitle id="dialog-title">
          <Typography variant="h2">{ strings.addNewCustomer }</Typography>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Grid container spacing={ 2 }>
            <Grid item className={ classes.fullWidth }>
              <TextField
                fullWidth
                variant="outlined"
                value={ this.state.customerData["name"] }
                onChange={ this.onDataChange }
                name="name"
                label={ strings.name }
              />
            </Grid>
            <Grid item className={ classes.fullWidth }>
              <Typography variant="subtitle1">{ strings.customerLogo }</Typography>
              <DropzoneArea
                dropzoneClass={ classes.dropzone }
                dropzoneParagraphClass={ classes.dropzoneText }
                dropzoneText={ strings.dropFile }
                onChange={ this.onImageChange }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <Divider />
        <DialogActions>
          <Button variant="outlined" onClick={ this.props.handleClose } color="primary">
            { strings.cancel }
          </Button>
          <Button variant="contained" onClick={ this.onSave } color="primary" autoFocus>
            { strings.save }
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  /**
   * Handles save button click
   */
  private onSave = () => {
    const { saveClick } = this.props;
    const { customerData } = this.state;
    const customer = CustomerFromJSON(customerData);
    saveClick(customer);
  }

  /**
   * Handles data change
   */
  private onDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { customerData } = this.state;
    customerData[e.target.name] = e.target.value;
    
    this.setState({
      customerData: customerData
    });
  }

  private onImageChange = async (files: File[]) => {
    const file = files[0];
    const response = await FileUpload.uploadFile(file, "customerImages");
    const { customerData } = this.state;
    customerData["imageUrl"] = response.uri;

    this.setState({
      customerData: customerData
    });
  }
}

export default withStyles(styles)(AddCustomerDialog);