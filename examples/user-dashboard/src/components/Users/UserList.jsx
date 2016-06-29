import React, { Component, PropTypes } from 'react';
import { Table, Icon, Popconfirm, Modal, Pagination, message } from 'antd';

function UserList({
  dispatch, total, current, loading, dataSource,
}) {
  function handleChange(page) {
    dispatch({
      type: 'users/query',
      payload: { page },
    });
  }

  function handleDelete(id) {
    dispatch({
      type: 'users/delete',
      payload: id,
    });
  }

  function handleShowEditModal(currentItem) {
    dispatch({
      type: 'users/showModal',
      payload: {
        modalType: 'update',
        currentItem,
      },
    });
  }

  const columns = [{
    title: '姓名',
    dataIndex: 'name',
    key: 'name',
    render: (text) => <a href="#">{text}</a>,
  }, {
    title: '年龄',
    dataIndex: 'age',
    key: 'age',
  }, {
    title: '住址',
    dataIndex: 'address',
    key: 'address',
  }, {
    title: '操作',
    key: 'operation',
    render: (text, record) => (
      <p>
        <a onClick={handleShowEditModal.bind(this, record)}>编辑</a>
        &nbsp;
        <Popconfirm title="确定要删除吗？" onConfirm={handleDelete.bind(this, record.id)}>
          <a>删除</a>
        </Popconfirm>
      </p>
    ),
  }];

  return (
    <div>
      <Table
        columns={columns}
        dataSource={dataSource}
        loading={loading}
        rowKey={record => record.id}
        pagination={false}
      />
      <Pagination
        className="ant-table-pagination"
        total={total}
        current={current}
        pageSize={10}
        onChange={handleChange}
      />
    </div>
  );
}

export default UserList;
