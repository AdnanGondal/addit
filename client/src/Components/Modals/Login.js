import React from "react";
import ReactModal from "react-modal";
const validator = require("email-validator");

class Login extends React.Component {
  initialState = {
    email: "",
    password: "",
    responseError: "",
    emailError: "",
    authenticated: false,
  };

  constructor(props) {
    super(props);
    this.state = this.initialState;
  }

  handleChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  async postLogin(email, password) {
    try {
      const res = await fetch(`http://localhost:8080/api/sessions`, {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const message = await res.json();

      if (res.status === 401) {
        this.setState({ responseError: message.message });
      } else if (message.success) {
        this.setState(this.initialState);
        alert("Succesfully Logged In");
      }
    } catch (err) {
      alert(err);
    }
  }

  handleSubmit = (event) => {
    event.preventDefault();
    const emailValidate = validator.validate(this.state.email);

    if (emailValidate) {
      this.setState({ emailError: "" });
      this.postLogin(this.state.email, this.state.password);
    } else {
      this.setState({ emailError: "Error: Invalid Email" });
    }
  };

  handleClose = () => {
    if (!this.state.authenticated) {
      this.setState(this.initialState);
    }
    this.props.handleCloseModal();
  };

  render() {
    return (
      <ReactModal
        isOpen={this.props.showModal}
        contentLabel="Register Modal"
        onRequestClose={this.handleClose}
      >
        <div>
          <h2>Login</h2>
          <form onSubmit={this.handleSubmit}>
            <div className="register">
              <label>
                Email:
                <input
                  type="text"
                  name="email"
                  value={this.state.email}
                  onChange={this.handleChange}
                />
              </label>
              <label>
                Password:
                <input
                  type="text"
                  name="password"
                  value={this.state.password}
                  onChange={this.handleChange}
                />
              </label>
              <button> Login </button>
              <p className="error-message">{this.state.responseError}</p>
              <p className="error-message">{this.state.emailError}</p>
            </div>
          </form>
        </div>
      </ReactModal>
    );
  }
}

export default Login;
