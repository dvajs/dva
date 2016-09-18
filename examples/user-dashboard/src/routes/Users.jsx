import React, { PropTypes } from 'react';
import { routerRedux } from 'dva/router';
import { connect } from 'dva';
import MainLayout from '../components/MainLayout/MainLayout';
import styles from './Users.less';
import UserList from '../components/Users/UserList';
import UserSearch from '../components/Users/UserSearch';
import UserModal from '../components/Users/UserModal';

function Users({ location, dispatch, users }) {
  const {
    loading, list, total, current,
    currentItem, modalVisible, modalType
    } = users;

  const { field, keyword } = location.query;

  const userModalProps = {
    item: modalType === 'create' ? {} : currentItem,
    type: modalType,
    visible: modalVisible,
    onOk(data) {
      dispatch({
        type: `users/${modalType}`,
        payload: data
      });
    },
    onCancel() {
      dispatch({
        type: 'users/hideModal'
      });
    },
  };

  const userListProps = {
    dataSource: list,
    loading,
    total,
    current,
    onPageChange(page) {
      dispatch(routerRedux.push({
        pathname: '/users',
        query: { page },
      }));
    },
    onDeleteItem(id) {
      dispatch({
        type: 'users/delete',
        payload: id
      });
    },
    onEditItem(item) {
      dispatch({
        type: 'users/showModal',
        payload: {
          modalType: 'update',
          currentItem: item,
        }
      });
    }
  };

  const userSearchProps = {
    field,
    keyword,
    onSearch(fieldsValue) {
      dispatch({
        type: 'users/query',
        payload: fieldsValue
      });
    },
    onAdd() {
      dispatch({
        type: 'users/showModal',
        payload: {
          modalType: 'create'
        }
      });
    }
  };


  // 解决 Form.create initialValue 的问题
  // 每次创建一个全新的组件, 而不做diff
  // 如果你使用了redux, 请移步 http://react-component.github.io/form/examples/redux.html
  const UserModalGen = () =>
    <UserModal {...userModalProps} />;

  return (
    <MainLayout location={location}>
      <div className={styles.normal}>
        <UserSearch {...userSearchProps} />
        <UserList {...userListProps} />
        <UserModalGen />
      </div>
    </MainLayout>
  );
}

Users.propTypes = {
  users: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
};

function mapStateToProps({ users }) {
  return {users};
}

export default connect(mapStateToProps)(Users);
