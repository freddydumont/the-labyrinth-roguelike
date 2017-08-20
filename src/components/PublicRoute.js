import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';

const PublicRoute = ({ component: Component, auth, ...rest }) => {
  const { authed } = auth;
  console.log(authed);

  return (
    <Route
      {...rest}
      render={props =>
        !authed ? <Component {...props} /> : <Redirect to="/game" />}
    />
  );
};

const mapStateToProps = state => {
  return {
    auth: state.auth
  };
};

export default connect(mapStateToProps, null)(PublicRoute);
