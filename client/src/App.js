import "./App.css";
import React from "react";
import Story from "./Components/Story";
import StoryForm from "./Components/StoryForm";

class App extends React.Component {
  state = {
    stories: [],
    loading: false,
  };

  async componentDidMount() {
    await this.fetchData();
  }

  async fetchData() {
    this.setState({ loading: true });
    try {
      let response = await fetch("http://localhost:8080/api/stories");
      let json = await response.json();
      this.setState({ stories: json, loading: false });
    } catch (err) {
      alert(err);
    }
  }

  async postVote(direction, id) {
    try {
      await fetch(`http://localhost:8080/api/stories/${id}/votes`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ direction: direction }),
      });
    } catch (err) {
      console.log(err);
    }
  }

  async postStory(title, url) {
    console.log(url);
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

  handleClick = (event) => {
    const direction = event.target.name;
    const id = event.target.value;
    console.log(direction);
    console.log(id);

    this.postVote(direction, id);
  };

  addStory = (title, url) => {
    console.log(title);
    this.postStory(title, url);
  };

  getStoriesComponentList(stories) {
    if (stories.length == 0) return <p>No Stories yet</p>;
    return stories.stories.map((story) => (
      <Story key={story.title} story={story} handleClick={this.handleClick} />
    ));
  }

  getLoadingComponent() {
    return <div class="loader" />;
  }

  render() {
    return (
      <div className="App">
        <header>
          <h1>Addit: Very Good™️ Social News Site</h1>
        </header>
        <StoryForm addStory={this.addStory} />
        <main>
          <h2>Top Stories</h2>
          {this.state.loading
            ? this.getLoadingComponent()
            : this.getStoriesComponentList(this.state.stories)}
        </main>
      </div>
    );
  }
}

export default App;
