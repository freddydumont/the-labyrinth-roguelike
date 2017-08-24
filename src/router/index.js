import React, { Component } from 'react';
import firebase from '../firebase';
import GameContainer from '../components/GameContainer';
import Login from '../components/Login';
import { Route, BrowserRouter, Switch } from 'react-router-dom';
import * as actions from '../actions';
import { connect } from 'react-redux';
import PublicRoute from '../components/PublicRoute';
// import PrivateRoute from '../components/PrivateRoute';

class Root extends Component {
  componentDidMount() {
    const { dispatch } = this.props;
    this.removeListener = firebase.auth().onAuthStateChanged(user => {
      if (user) {
        dispatch(actions.login(user.uid));
        dispatch(actions.loaded());
      } else {
        dispatch(actions.logout());
        dispatch(actions.loaded());
      }
    });
  }
  componentWillUnmount() {
    this.removeListener();
  }
  render() {
    const { auth } = this.props;
    return auth.loading
      ? <h1>Loading</h1>
      : <BrowserRouter>
          <div className="w-100 bg-light-gray min-vh-100">
            <Switch>
              <Route path="/" exact component={GameContainer} />
              <PublicRoute path="/login" component={Login} />
              <Route render={() => <h3>No Match</h3>} />
            </Switch>
          </div>
        </BrowserRouter>;
  }
}

const mapStateToProps = state => {
  return {
    auth: state.auth
  };
};

export default connect(mapStateToProps, null)(Root);
