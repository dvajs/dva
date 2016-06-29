import React, { PropTypes } from 'react';

const propTypes = {
  name: PropTypes.string,
  username: PropTypes.string
};

const FriendThumbnail = ({ name, username }) => (
  <div className="friend-thumbnail">
    <h4>{name} <span className="username">{username}</span></h4>
  </div>
);

FriendThumbnail.propTypes = propTypes;
export default FriendThumbnail;
