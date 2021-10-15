import React from "react";
import "./Header.css";
import Login from "./Modals/Login";
import Register from "./Modals/Register";

class Header extends React.Component {
  constructor(props) {
    super(props);
    console.log("HEADER COMPONENT");
    console.log(this.props.loggedIn);

    this.state = {
      showRegisterModal: false,
      showLoginModal: false,
      loggedIn: props.loggedIn,
    };
  }

  handleRegister = () => {
    this.setState({ showRegisterModal: true });
  };

  handleLogin = () => {
    this.setState({ showLoginModal: true });
  };

  async logoutPost() {
    try {
      const res = await fetch(`http://localhost:8080/api/sessions`, {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "",
          password: "",
        }),
      });
      const message = await res.json();
    } catch (err) {
      alert(err);
    }
  }

  handleLogout = () => {
    console.log("You have logged out");

    // LOGOUT TO DO

    // ACTUALLY HAVE TO REMOVE THE COOKIES
    this.logoutPost();

    //
    this.setState({ loggedIn: false });
  };

  handleCloseModal = (authenticated) => {
    this.setState({ showRegisterModal: false, showLoginModal: false });
    if (authenticated) {
      this.setState({ loggedIn: true });
    }
  };

  showLoginButs = () => {
    return (
      <div>
        <button onClick={this.handleLogin}>Log In</button>
        <button onClick={this.handleRegister}>Register</button>
      </div>
    );
  };

  showLogoutButton = () => {
    return (
      <div>
        <button onClick={this.handleLogout}>Log Out</button>
      </div>
    );
  };

  render() {
    return (
      <header>
        <div>Addit: A Social News Site</div>
        {this.state.loggedIn ? this.showLogoutButton() : this.showLoginButs()}

        <Register
          showModal={this.state.showRegisterModal}
          handleCloseModal={this.handleCloseModal}
        />
        <Login
          showModal={this.state.showLoginModal}
          handleCloseModal={this.handleCloseModal}
        />
      </header>
    );
  }
}

export default Header;
