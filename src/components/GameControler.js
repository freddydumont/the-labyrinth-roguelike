import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class GameControler extends Component {
  render() {
    return (
      <div className="pa5">
        <div className="flex flex-column">
          <p>To add your score to leaderboard</p>
          <Link
            to="/login"
            className="f6 link dim br3 ba bw1 ph3 pv2 mb2 near-black center"
          >
            Login with Github
          </Link>
          <span className="center"> or </span>
          <div className="pa2 black-80">
            <label className="f6 b db mb2">Submit your name</label>
            <input className="input-reset ba b--black-20 pa2 mb2 db w-100" />
          </div>
        </div>
      </div>
    );
  }
}

export default GameControler;
