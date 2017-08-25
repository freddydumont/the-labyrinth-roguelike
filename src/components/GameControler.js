import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from '../actions';
import Login from './Login';

class GameControler extends Component {
  render() {
    const { dispatch, auth } = this.props;
    return (
      <div className="pa3">
        {auth.authed
          ? <a
              className="link dim black absolute pointer mr3 back-button"
              onClick={() => dispatch(actions.startLogout())}
            >
              Logout
            </a>
          : <Login />}
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    auth: state.auth
  };
};

export default connect(mapStateToProps, null)(GameControler);
