import React from "react";
import ReactModal from "react-modal";
const validator = require("email-validator");
const passwordValidator = require("password-validator");

const schema = new passwordValidator();
schema
  .is()
  .min(8) // Minimum length 8
  .is()
  .max(100) // Maximum length 100
  .has()
  .lowercase() // Must have lowercase letters
  .has()
  .digits(1); // Must have at least 1 digit

class Register extends React.Component {
  initialState = {
    email: "",
    password: "",
    passwordConfirm: "",
    emailError: "",
    passwordError: "",
    responseError: "",
  };

  constructor(props) {
    super(props);

    this.state = this.initialState;
  }
  async postRegister(email, password, passwordConfirmation) {
    try {
      const res = await fetch(`http://localhost:8080/api/users`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
          passwordConfirmation: passwordConfirmation,
        }),
      });

      const message = await res.json();
      if (res.status === 409) {
        this.setState({ responseError: message.message });
      } else {
        alert("Succesfully Registered");
        this.setState(this.initialState);
        this.props.handleCloseModal();
      }
    } catch (err) {
      alert(err);
    }
  }

  handleSubmit = (event) => {
    event.preventDefault();
    const emailValidate = validator.validate(this.state.email);
    const passwordValidate = schema.validate(this.state.password);
    const passwordsMatch = this.state.password === this.state.passwordConfirm;

    if (!emailValidate) {
      this.setState({
        emailError: `Error: Invalid Email`,
      });
    } else {
      this.setState({
        emailError: ``,
      });
    }
    if (!passwordValidate) {
      this.setState({
        passwordError: `Error: Invalid Password`,
      });
    } else if (!passwordsMatch) {
      this.setState({
        passwordError: `Error: Passwords Don't Match`,
      });
    } else {
      this.setState({
        passwordError: ``,
      });
    }
    if (emailValidate && passwordsMatch && passwordValidate) {
      this.postRegister(
        this.state.email,
        this.state.password,
        this.state.passwordConfirm
      );
    }
  };

  handleChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  handleClose = () => {
    this.setState(this.initialState);
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
          <h2>Create Account</h2>
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
              <label>
                Confirm Password:
                <input
                  type="text"
                  name="passwordConfirm"
                  value={this.state.passwordConfirm}
                  onChange={this.handleChange}
                />
              </label>
              <button> Create Account</button>
              <p className="error-message">{this.state.emailError}</p>
              <p className="error-message">{this.state.passwordError}</p>
              <p className="error-message">{this.state.responseError}</p>
            </div>
          </form>
        </div>
      </ReactModal>
    );
  }
}

export default Register;
