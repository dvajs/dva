import React from 'react';
import { connect } from '../../../index';
import { Link } from '../../../router';

const Profile = ({ profile, dispatch }) => {
  const { name, age } = profile;

  function changeAgeHandler() {
    dispatch({
      type: 'profile/changeAge',
      payload: Math.floor(Math.random() * 100),
    });
  }

  return (
    <div>
      <h1>{ name }</h1>
      <p>{ age }</p>
      <button onClick={changeAgeHandler}>Change Age</button>
      <hr/>
      <Link to="/">go to /</Link>
    </div>
  );
};

export default connect(({ profile }) => ({ profile }))(Profile);
