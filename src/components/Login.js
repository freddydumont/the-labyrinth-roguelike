import React, { Component } from 'react';
import * as actions from '../actions';
import { connect } from 'react-redux';

class Login extends Component {
  onLogin() {
    const { dispatch } = this.props;
    dispatch(actions.startLogin());
  }

  render() {
    return (
      <div>
        <h1 className="page-title">Rougelike Game</h1>

        <div className="callout-auth">
          <h3>Login</h3>
          <p>Login with the GitHub account below</p>
          <button className="button" onClick={this.onLogin.bind(this)}>
            Login with Github
          </button>
        </div>
      </div>
    );
  }
}

export default connect()(Login);
