import React, { Component, PropTypes } from 'react';
import { connect } from 'dva';
import MainLayout from '../layouts/MainLayout/MainLayout';
import styles from './Users.less';
import UserList from '../components/Users/UserList';
import UserSearch from '../components/Users/UserSearch';
import UserModal from '../components/Users/UserModal'

function Users({ location, dispatch, users }) {
  const {
    loading, list, total, current,
    currentItem, modalVisible, modalType,
  } = users;
  const { field, keyword } = location.query;

  // 解决 Form.create initialValue 的问题
  // 每次创建一个全新的组件, 而不做diff
  // 如果你使用了redux, 请移步 http://react-component.github.io/form/examples/redux.html
  const UserModalGen = () => {
    return <UserModal
      dispatch={dispatch}
      item={currentItem}
      visible={modalVisible}
      type={modalType}
    />
  };

  return (
    <MainLayout location={location}>
      <div className={styles.normal}>
        <UserSearch
          dispatch={dispatch}
          field={field}
          keyword={keyword}
        />
        <UserList
          dispatch={dispatch}
          dataSource={list}
          loading={loading}
          total={total}
          current={current}
        />
        <UserModalGen />
      </div>
    </MainLayout>
  );
}

Users.propTypes = {};

function mapStateToProps({ users }) {
  return { users };
}

export default connect(mapStateToProps)(Users);
