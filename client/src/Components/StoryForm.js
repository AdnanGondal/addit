import React from 'react';

class StoryForm extends React.Component {
  constructor(props) {
    super();
    this.state = { title: '', url: '' };
  }

  handleChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  handleSubmit = (event) => {
    this.props.addStory(this.state.title, this.state.url);
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
      </div>
    );
  }
}

export default StoryForm;
