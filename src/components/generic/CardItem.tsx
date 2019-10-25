import * as React from "react";
import { Typography, Grid, Card, CardMedia, withStyles, WithStyles, CardActions, CardActionArea, Button } from "@material-ui/core";
import styles from "../../styles/card-styles";

interface Props extends WithStyles<typeof styles> {
  /**
   * Card title
   */
  title: string
  /**
   * Card image
   */
  img: string
  /**
   * Edit button click
   */
  editClick(): void
  /**
   * Delete button click
   */
  deleteClick(): void
}

interface State {

}

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
      img: "",
    };
  }

  /**
   * Component render method
   */
  public render() {
    const { classes } = this.props;
    return (
      <Grid item>
      <Card elevation={10} className={classes.card}>
        <CardActionArea className={classes.actionArea} onClick={ this.props.editClick }>
          <CardMedia className={classes.media} image={ this.props.img }></CardMedia>
          <div className={classes.overlay}>
            <Typography variant="h3">
              { this.props.title }
            </Typography>
          </div>
        </CardActionArea>
        <CardActions className={classes.cardActions}>
          <Button size="small" className={classes.edit} onClick={ this.props.editClick }>
            Edit
          </Button>
          <Button size="small" className={classes.delete} onClick={ this.props.deleteClick }>
            Delete
          </Button>
        </CardActions>
      </Card>
    </Grid>
    );
  }
}

export default withStyles(styles)(CardItem);