import React from 'react';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';

const PrivateRoute = ({ component: Component, auth, ...rest }) => {
  const { authed } = auth;

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
};

const mapStateToProps = state => {
  return {
    auth: state.auth
  };
};

export default connect(mapStateToProps, null)(PrivateRoute);
