import React from 'react';
import { Link } from 'dva/router';
import styles from './HomePage.less';

function HomePage() {
  return (
    <div className={styles.normal}>
      <h1>Hello Antd.</h1>
      <hr />
      <ul className={styles.list}>
        <li>You can go to <Link to="/users">/users</Link></li>
      </ul>
    </div>
  );
}

HomePage.propTypes = {
};

export default HomePage;
