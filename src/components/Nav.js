import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { startLogout } from '../actions';

const Nav = ({ auth, dispatch }) => {
  return (
    <nav className="bg-blue white flex justify-between">
      <Link to="/" className="link dim white items-center flex ml3" href="">
        Home
      </Link>
      <div className="flex-grow pa3 flex items-center">
        <Link to="/game" className="link dim white mr3">
          Game
        </Link>
        {auth.authed
          ? <Link
              to="/"
              className="link dim white mr3"
              onClick={() => dispatch(startLogout())}
            >
              Logout
            </Link>
          : <Link to="/login" className="link dim white mr3">
              Login
            </Link>}
      </div>
    </nav>
  );
};

const mapStateToProps = state => {
  return {
    auth: state.auth
  };
};

export default connect(mapStateToProps, null)(Nav);
