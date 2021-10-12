import React from "react";
import "./Header.css";
import Register from "./Modals/Register";

class Header extends React.Component {
  constructor() {
    super();
    this.state = { showRegisterModal: false };
  }

  handleRegister = () => {
    this.setState({ showRegisterModal: true });
  };

  handleCloseModal = () => {
    this.setState({ showRegisterModal: false });
  };

  render() {
    return (
      <header>
        <div>Addit: A Social News Site</div>
        <div>
          <button>Log In</button>
          <button onClick={this.handleRegister}>Register</button>
        </div>
        {console.log(this.state.showModal)}
        <Register
          showModal={this.state.showRegisterModal}
          handleCloseModal={this.handleCloseModal}
        />
      </header>
    );
  }
}

export default Header;
