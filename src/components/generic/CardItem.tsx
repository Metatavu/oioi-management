import * as React from "react";
import { Typography, Card, CardMedia, withStyles, WithStyles, CardActions, CardActionArea, Button } from "@material-ui/core";
import styles from "../../styles/card-item";
import strings from "../../localization/strings";

interface Props extends WithStyles<typeof styles> {
  /**
   * Card title
   */
  title: string;
  /**
   * Card image
   */
  img: string;

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
  detailsClick(): void;
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
    this.state = {
      title: "title",
      img: ""
    };
  }

  /**
   * Component render method
   */
  public render() {
    const { classes } = this.props;
    return (
      <Card elevation={10} className={classes.card}>
        <CardActionArea className={classes.actionArea} onClick={this.props.editConfiguration}>
          <CardMedia className={classes.media} image={this.props.img}></CardMedia>
          <div className={classes.overlay}>
            <Typography variant="h3">{this.props.title}</Typography>
          </div>
        </CardActionArea>
        <CardActions className={classes.cardActions}>
          <Button size="small" className={classes.edit} onClick={this.props.editClick}>
            {strings.edit}
          </Button>
          <Button size="small" className={classes.details} onClick={this.props.detailsClick}>
            {strings.details}
          </Button>
          <Button size="small" className={classes.delete} onClick={this.props.deleteClick}>
            {strings.delete}
          </Button>
        </CardActions>
      </Card>
    );
  }
}

export default withStyles(styles)(CardItem);
