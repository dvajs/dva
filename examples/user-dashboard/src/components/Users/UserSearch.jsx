import React, { Component, PropTypes } from 'react';
import { Form, Input, Button, Select } from 'antd';
import styles from './UserSearch.less';

function UserSearch({ dispatch, form, field, keyword }) {
  const { getFieldProps, validateFields, getFieldsValue } = form;

  function handleSubmit(e) {
    e.preventDefault();
    validateFields((errors) => {
      if (!!errors) {
        return;
      }
      dispatch({
        type: 'users/query',
        payload: getFieldsValue(),
      });
    });
  }

  function handleShowCreateModal() {
    dispatch({
      type: 'users/showModal',
      payload: {
        modalType: 'create',
      },
    });
  }

  const keywordRules = [
    {
      required: true,
      message: '不能为空',
    },
  ];

  return (
    <div className={styles.normal}>
      <div className={styles.search}>
        <Form inline onSubmit={handleSubmit} form={form}>
          <Form.Item>
            <Select { ...getFieldProps('field', { initialValue: field || 'name' }) }>
              <Select.Option value="name">名字</Select.Option>
              <Select.Option value="age">年龄</Select.Option>
              <Select.Option value="address">地址</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            hasFeedback
          >
            <Input
              { ...getFieldProps('keyword', {
                initialValue: keyword || '',
                rules: keywordRules,
              }) }
            />
          </Form.Item>
          <Button style={{ marginRight: '10px' }} type="primary" htmlType="submit">搜索</Button>
        </Form>
      </div>
      <div className={styles.create}>
        <Button type="ghost" onClick={handleShowCreateModal}>添加</Button>
      </div>
    </div>
  );
}

UserSearch.propTypes = {
  form: PropTypes.object.isRequired,
};

export default Form.create()(UserSearch);
