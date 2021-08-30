import * as React from "react";
import { Typography, Card, CardMedia, withStyles, WithStyles, CardActions, CardActionArea, Button, Box } from "@material-ui/core";
import styles from "../../styles/card-item";
import strings from "../../localization/strings";
import placeholderImg from "../../resources/images/no-image-available-icon.jpg";
import VisibleWithRole from "./VisibleWithRole";

interface Props extends WithStyles<typeof styles> {
  /**
   * Card title
   */
  title: string;
  /**
   * Card image
   */
  img?: string;

  /**
   * Edit configuration button click
   */
  editConfiguration(): void;
  /**
   * Edit button click
   */
  editClick(): void;
  /**
   * Details button click
   */
  detailsClick?(): void;
  /**
   * Delete button click
   */
  deleteClick(): void;
}

interface State {}

class CardItem extends React.Component<Props, State> {
  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  /**
   * Component render method
   */
  public render() {
    const {
      classes,
      img,
      title,
      editConfiguration,
      editClick,
      detailsClick,
      deleteClick
    } = this.props;
    return (
      <Card elevation={ 10 } className={ classes.card }>
        <CardActionArea className={ classes.actionArea } onClick={ editConfiguration }>
          <CardMedia className={ classes.media } image={ img || placeholderImg }/>
          <Box className={ classes.overlay }>
            <Typography variant="h3">{ title}</Typography>
          </Box>
        </CardActionArea>
        <CardActions className={ classes.cardActions }>
          <VisibleWithRole role="admin">
            <Button
              size="small"
              className={ classes.edit }
              onClick={ editClick }
            >
              { strings.edit }
            </Button>
          </VisibleWithRole>
          { detailsClick && 
            <Button
              size="small"
              className={ classes.details }
              onClick={ detailsClick }
            >
              { strings.details }
            </Button>
          }
          <VisibleWithRole role="admin">
            <Button
              size="small"
              className={ classes.delete }
              onClick={ deleteClick }
            >
              { strings.delete }
            </Button>
          </VisibleWithRole>
        </CardActions>
      </Card>
    );
  }
}

export default withStyles(styles)(CardItem);
