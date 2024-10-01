import * as React from "react";
import { withStyles, WithStyles, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Divider, Typography, MenuItem, Box, IconButton, LinearProgress } from "@material-ui/core";
import styles from "../../styles/generic/add-content-version-dialog";
import strings from "../../localization/strings";
import slugify from "slugify";
import CloseIcon from "@material-ui/icons/Close";
import { ContentVersion } from "../../types";
import { ReduxState } from "app/store";
import { connect, ConnectedProps } from "react-redux";
import { nanoid } from "@reduxjs/toolkit";

const EMPTY_VALUE = nanoid();

/**
 * Component props
 */
interface Props extends ExternalProps {
  open: boolean;
  onSave: (name: string, slug: string, copyId?: string) => void;
  onClose: () => void;
  loading: boolean;
  loaderMessage?: string;
}

/**
 * Component state
 */
interface State {
  name: string;
  slug: string;
  error?: string;
  copyFromOtherVersion?: ContentVersion;
}

/**
 * Create content version dialog
 */
class AddContentVersionDialog extends React.Component<Props, State> {

  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);

    this.state = {
      name: "",
      slug: ""
    };
  }

  /**
   * Component did update life cycle handler
   *
   * @param prevProps previous props
   */
  public componentDidUpdate = (prevProps: Props) => {
    const { open } = this.props;

    if (!prevProps.open && open) {
      this.setState({
        name: "",
        slug: "",
        copyFromOtherVersion: undefined
      });
    }
  }

  /**
   * Component render method
   */
  public render = () => {
    const { classes, open, loading } = this.props;

    return (
      <Dialog
        maxWidth="sm"
        open={ open }
        onClose={ this.clearAndClose }
        fullWidth
      >
        <DialogTitle disableTypography>
          { this.renderDialogTitle() }
        </DialogTitle>
        <Box mb={ 3 }>
          <Divider />
        </Box>
        <DialogContent className={ classes.content }>
          { loading ? this.renderLoader() : this.renderDialogContent() }
        </DialogContent>
        <Box mt={ 3 }>
          <Divider/>
        </Box>
        <DialogActions>
          { this.renderDialogActions() }
        </DialogActions>
      </Dialog>
    );
  }

  /**
   * Renders dialog title
   */
  private renderDialogTitle = () => {
    return (
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Typography variant="h4">
          { strings.contentVersionControls.addNewVersion }
        </Typography>
        <IconButton
          size="small"
          onClick={ this.clearAndClose }
        >
          <CloseIcon color="primary"/>
        </IconButton>
      </Box>
    );
  }

  /**
   * Renders loader
   */
  private renderLoader = () => {
    const { loaderMessage } = this.props;
    const loaderText = loaderMessage || strings.loading;

    return (
      <Box marginBottom={ 2 }>
        <LinearProgress color="secondary" style={{ flex: 1 }}/>
        <Box mt={ 2 } display="flex" flex={ 1 } justifyContent="flex-end">
          <Typography>
            { loaderText }
          </Typography>
        </Box>
      </Box>
    )
  }

  /**
   * Renders dialog content
   */
  private renderDialogContent = () => {
    const { contentVersions } = this.props;
    const { name, error, copyFromOtherVersion } = this.state;

    const sortedContentVersions = contentVersions.slice().sort((a, b) => {
      if (!a.createdAt || !b.createdAt) {
        return 0;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return (
      <>
        <TextField
          fullWidth
          variant="outlined"
          label={ strings.name }
          value={ name }
          onChange={ this.onChangeName }
          error={ !!error }
          helperText={ error || "" }
        />
        <TextField
          fullWidth
          select
          variant="outlined"
          label={ strings.contentVersionControls.content }
          value={ copyFromOtherVersion?.id || EMPTY_VALUE }
          onChange={ this.onChangeCopyFromOtherVersion }
        >
          { this.renderEmptyOption() }
          { sortedContentVersions.map(this.renderContentVersionOption) }
        </TextField>
      </>
    )
  }

  /**
   * Renders empty option
   */
  private renderEmptyOption = () => (
    <MenuItem value={ EMPTY_VALUE }>
      { strings.contentVersionControls.empty }
    </MenuItem>
  );

  /**
   * Renders content version option
   *
   * @param contentVersion content version
   */
  private renderContentVersionOption = (contentVersion: ContentVersion) => (
    <MenuItem key={ contentVersion.id } value={ contentVersion.id }>
      { contentVersion.name }
    </MenuItem>
  )

  /**
   * Renders dialog actions
   */
  private renderDialogActions = () => {
    const { loading } = this.props;
    const { name, slug } = this.state;

    return (
      <>
        <Button
          variant="text"
          onClick={ this.clearAndClose }
          color="primary"
          disabled={ loading }
        >
          { strings.cancel }
        </Button>
        <Button
          variant="text"
          color="primary"
          autoFocus
          onClick={ this.handleSave }
          disabled={ !name || !slug || loading }
        >
          { strings.save }
        </Button>
      </>
    );
  }

  /**
   * Event handler for change name
   *
   * @param event change event
   */
  private onChangeName = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { contentVersions } = this.props;
    const { value } = event.target;
    const slug = slugify(value);

    const error = contentVersions.some(contentVersion => contentVersion.name === value || contentVersion.slug === slug) ?
      strings.contentVersionControls.alreadyExists :
      undefined;

    this.setState({
      name: value,
      slug: slug,
      error: error
    });
  }

  /**
   * Event handler for change copy from other version
   *
   * @param event change event
   */
  private onChangeCopyFromOtherVersion = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { contentVersions } = this.props;

    const contentVersion = contentVersions.find(version => version.id === event.target.value);

    this.setState({ copyFromOtherVersion: contentVersion });
  }

  /**
   * Handle save click
   */
  private handleSave = () => {
    const { application, onSave } = this.props;
    const { name, slug, copyFromOtherVersion } = this.state;

    if (!application) {
      return;
    }

    onSave(name, slug, copyFromOtherVersion?.id);
  }

  /**
   * Handle cancel click
   */
  private clearAndClose = () => {
    const { onClose } = this.props;

    this.setState({
      name: "",
      slug: "",
      copyFromOtherVersion: undefined
    });

    onClose();
  }

}

/**
 * Map Redux state to props
 *
 * @param state state
 */
const mapStateToProps = (state: ReduxState) => ({
  application: state.application.application,
  contentVersions: state.contentVersion.contentVersions
});

const connector = connect(mapStateToProps);

type ExternalProps = ConnectedProps<typeof connector> & WithStyles<typeof styles>;

export default connector(withStyles(styles)(AddContentVersionDialog));