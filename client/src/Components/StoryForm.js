import React from "react";
import validator from "validator";

class StoryForm extends React.Component {
  constructor(props) {
    super();
    this.state = { title: "", url: "", error: "" };
  }

  handleChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  handleSubmit = (event) => {
    if (validator.isURL(this.state.url)) {
      if (this.state.url.startsWith("http")) {
        this.props.addStory(this.state.title, this.state.url);
      } else {
        this.props.addStory(this.state.title, `https://${this.state.url}`);
      }
    } else {
      this.setState({ error: "Error: Invalid URL" });
      event.preventDefault();
    }
  };

  render() {
    return (
      <div className="story-form">
        <h2> Add a Story </h2>
        <form onSubmit={this.handleSubmit}>
          <label>
            Title:
            <input
              type="text"
              name="title"
              value={this.state.title}
              onChange={this.handleChange}
            />
          </label>
          <label>
            URL:
            <input
              type="text"
              name="url"
              value={this.state.url}
              onChange={this.handleChange}
            />
          </label>

          <button>Submit</button>
        </form>
        <p class="error-message">{this.state.error && this.state.error}</p>
      </div>
    );
  }
}

export default StoryForm;
