import "./App.css";
import React from "react";
import Story from "./Components/Story";
import StoryForm from "./Components/StoryForm";
import Header from "./Components/Header";
import ReactModal from "react-modal";

ReactModal.setAppElement("#root");

class App extends React.Component {
  state = {
    stories: [],
    loading: false,
    responseError: "",
    loggedIn: "",
  };

  async componentDidMount() {
    await this.fetchData();
  }

  async fetchData() {
    this.setState({ loading: true });
    try {
      let response = await fetch("http://localhost:8080/api/stories", {
        credentials: "include",
      });
      let json = await response.json();
      console.log("JSON:");
      console.log(json.loggedIn);
      this.setState({
        stories: json.stories,
        loading: false,
        loggedIn: json.loggedIn,
      });
    } catch (err) {
      alert(err);
    }
  }

  async postVote(direction, id) {
    try {
      const res = await fetch(`http://localhost:8080/api/stories/${id}/votes`, {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ direction: direction }),
      });

      const data = res.json(res);
      if (res.status === 403) {
        this.setState({ responseError: "You are not logged in. " });
      }
    } catch (err) {
      alert(err);
    }
  }

  handleClick = (event) => {
    const direction = event.target.name;
    const id = event.target.value;

    this.postVote(direction, id);
  };

  getStoriesComponentList(stories) {
    if (stories.length == 0) return <p>No Stories yet</p>;

    return stories.map((story) => (
      <Story key={story.title} story={story} handleClick={this.handleClick} />
    ));
  }

  getLoadingComponent() {
    return <div className="loader" />;
  }

  showHeader() {
    if (this.state.loggedIn === true || this.state.loggedIn === false) {
      return <Header loggedIn={this.state.loggedIn} />;
    }
  }

  render() {
    return (
      <div className="App">
        {this.showHeader()}
        <StoryForm />
        <main>
          <h2>Top Stories</h2>
          <p className="error-message">{this.state.responseError}</p>
          {this.state.loading
            ? this.getLoadingComponent()
            : this.getStoriesComponentList(this.state.stories)}
        </main>
      </div>
    );
  }
}

export default App;
