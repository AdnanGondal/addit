import React from "react";
import "./Header.css";
import Login from "./Modals/Login";
import Register from "./Modals/Register";

class Header extends React.Component {
  constructor() {
    super();
    this.state = { showRegisterModal: false, showLoginModal: false };
  }

  handleRegister = () => {
    this.setState({ showRegisterModal: true });
  };

  handleLogin = () => {
    this.setState({ showLoginModal: true });
  };

  handleCloseModal = () => {
    this.setState({ showRegisterModal: false, showLoginModal: false });
  };

  render() {
    return (
      <header>
        <div>Addit: A Social News Site</div>
        <div>
          <button onClick={this.handleLogin}>Log In</button>
          <button onClick={this.handleRegister}>Register</button>
        </div>
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
