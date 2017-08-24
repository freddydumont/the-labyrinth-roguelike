import React, { Component } from 'react';
import * as actions from '../actions';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

class Login extends Component {
  onLogin() {
    const { dispatch } = this.props;
    dispatch(actions.startLogin());
  }

  render() {
    return (
      <div>
        <h1 className="page-title">Rougelike Game</h1>
        <Link
          to="/"
          className="absolute back-button no-underline black link dim"
        >
          Back to Game
        </Link>
        <div className="callout-auth">
          <h3>Login</h3>
          <p>Login with the GitHub account below</p>
          <button className="button link dim" onClick={this.onLogin.bind(this)}>
            Login with Github
          </button>
        </div>
      </div>
    );
  }
}

export default connect()(Login);
