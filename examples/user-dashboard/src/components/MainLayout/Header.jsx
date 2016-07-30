import React, { PropTypes } from 'react';
import { Menu, Icon } from 'antd';
import { Link } from 'dva/router';

function getMenuKeyFromUrl(pathname) {
  let key = '';
  try {
    key = pathname.match(/\/([^\/]*)/i)[1];
    /* eslint no-empty:0 */
  } catch (e) {}
  return key;
}

function Header({ location }) {
  return (
    <Menu
      selectedKeys={[getMenuKeyFromUrl(location.pathname)]}
      mode="horizontal"
      theme="dark"
    >
      <Menu.Item key="users">
        <Link to="/users"><Icon type="bars" />Users</Link>
      </Menu.Item>
      <Menu.Item key="home">
        <Link to="/"><Icon type="home" />Home</Link>
      </Menu.Item>
      <Menu.Item key="404">
        <Link to="/page-you-dont-know"><Icon type="frown-circle" />404</Link>
      </Menu.Item>
      <Menu.Item key="antd">
        <a href="http://ant.design/" target="_blank">ant.design</a>
      </Menu.Item>
    </Menu>
  );
}

Header.propTypes = {
  location: PropTypes.object,
};

export default Header;
