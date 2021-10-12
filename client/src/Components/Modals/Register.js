import React from "react";
import ReactModal from "react-modal";

class Register extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      username: "",
      password: "",
    };
  }

  handleChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  handleSubmit = (event) => {
    event.preventDefault();
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
                Username:
                <input
                  type="text"
                  name="username"
                  value={this.state.username}
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
              <button> Create Account</button>
            </div>
          </form>
        </div>
      </ReactModal>
    );
  }
}

export default Register;
