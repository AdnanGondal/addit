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
  };

  constructor(props) {
    super(props);

    this.state = this.initialState;
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
    }
    if (!passwordValidate) {
      this.setState({
        passwordError: `Error: Invalid Password`,
      });
    } else if (!passwordsMatch) {
      this.setState({
        passwordError: `Error: Passwords Don't Match`,
      });
    }
    if (emailValidate && passwordsMatch && passwordValidate) {
      this.setState(this.initialState);
    }
  };

  handleChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };
  render() {
    return (
      <ReactModal
        isOpen={this.props.showModal}
        contentLabel="Register Modal"
        onRequestClose={this.props.handleCloseModal}
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
            </div>
          </form>
        </div>
      </ReactModal>
    );
  }
}

export default Register;
