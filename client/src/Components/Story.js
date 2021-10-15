import React from "react";
import "./Story.css";

class Story extends React.Component {
  constructor(props) {
    super(props);
    console.log("The props passed to the Story component were: " + props);
    this.state = { score: props.story.score };
  }

  handleClick = (event) => {
    if (event.target.name === "up") {
      this.setState({ score: this.state.score + 1 });
    } else {
      this.setState({ score: this.state.score - 1 });
    }
    this.props.handleClick(event);
  };

  render() {
    const { title, score, url, id } = this.props.story;

    return (
      <li>
        <button
          name="up"
          onClick={(event) => {
            this.handleClick(event);
          }}
          value={id}
          className="upvote"
        >
          ⬆
        </button>
        <button
          name="down"
          onClick={(event) => {
            this.handleClick(event);
          }}
          value={id}
          className="downvote"
        >
          ⬇
        </button>
        <a className="title" href={url}>
          {title}
        </a>{" "}
        ({this.state.score} {this.state.score === 1 ? "point" : "points"})
      </li>
    );
  }
}

export default Story;
