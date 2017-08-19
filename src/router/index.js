import React, { Component } from 'react';
import firebase from '../firebase';
import GameContainer from '../components/GameContainer';
import Login from '../components/Login';
import Home from '../components/Home';
import { Route, BrowserRouter, Redirect, Switch } from 'react-router-dom';
import * as actions from '../actions';
import { connect } from 'react-redux';

function PrivateRoute({ component: Component, authed, ...rest }) {
  console.log(authed);
  return (
    <Route
      {...rest}
      render={props =>
        authed
          ? <Component {...props} />
          : <Redirect
              to={{ pathname: '/login', state: { from: props.location } }}
            />}
    />
  );
}

function PublicRoute({ component: Component, authed, ...rest }) {
  return (
    <Route
      {...rest}
      render={props =>
        !authed ? <Component {...props} /> : <Redirect to="/game" />}
    />
  );
}

class Root extends Component {
  componentDidMount() {
    const { dispatch, auth } = this.props;
    this.removeListener = firebase.auth().onAuthStateChanged(user => {
      console.log(user, auth.loading);
      if (user) {
        dispatch(actions.login(user.uid));
        dispatch(actions.loaded());
      } else {
        console.log(user, auth.loading);
        dispatch(actions.logout());
        dispatch(actions.loaded());
        console.log(user, auth.loading);
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
          <div>
            <Switch>
              <Route path="/" exact component={Home} />
              <PublicRoute
                authed={auth.authed}
                path="/login"
                component={Login}
              />
              <PrivateRoute
                authed={auth.authed}
                path="/game"
                component={GameContainer}
              />
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
