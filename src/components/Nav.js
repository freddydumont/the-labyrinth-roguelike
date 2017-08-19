import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { logout } from '../actions';

const Nav = ({ auth, dispatch }) => {
  return (
    <nav className="flex justify-between">
      <Link
        to="/"
        className="link dib black dim no-underline flex items-center pa3"
        href=""
      >
        Home
      </Link>
      <div className="flex-grow pa3 flex items-center">
        <Link to="/game" className="f6 link dib black dim mr3 mr4-ns">
          Game
        </Link>
        {auth.uid
          ? <Link
              to="/"
              className="f6 link dib black dim mr3 mr4-ns"
              onClick={() => dispatch(logout())}
            >
              Logout
            </Link>
          : <Link to="/login" className="f6 link dib black dim mr3 mr4-ns">
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
