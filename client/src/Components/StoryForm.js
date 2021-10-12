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
    event.preventDefault();
    if (validator.isURL(this.state.url)) {
      if (this.state.url.startsWith("http")) {
        this.postStory(this.state.title, this.state.url);
      } else {
        this.postStory(this.state.title, `https://${this.state.url}`);
      }
    } else {
      this.setState({ error: "Error: Invalid URL" });
    }
  };

  async postStory(title, url) {
    try {
      let res = await fetch(`http://localhost:8080/api/stories/`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: title, url: `${url}` }),
      });
      let status = await res.json();
      if (status.status == "success") {
        window.location.reload();
      }
    } catch (err) {
      console.log(err);
    }
  }

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
        <p className="error-message">{this.state.error && this.state.error}</p>
      </div>
    );
  }
}

export default StoryForm;
