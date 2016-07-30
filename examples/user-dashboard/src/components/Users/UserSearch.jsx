import React, { PropTypes } from 'react';
import { Form, Input, Button, Select } from 'antd';
import styles from './UserSearch.less';

function UserSearch({
  form, field, keyword,
  onSearch,
  onAdd
  }) {
  const { getFieldProps, validateFields, getFieldsValue } = form;

  function handleSubmit(e) {
    e.preventDefault();
    validateFields((errors) => {
      if (!!errors) {
        return;
      }

      onSearch(getFieldsValue());
    });
  }

  return (
    <div className={styles.normal}>
      <div className={styles.search}>
        <Form inline onSubmit={handleSubmit}>
          <Form.Item>
            <Select {...getFieldProps('field', { initialValue: field || 'name' })}>
              <Select.Option value="name">名字</Select.Option>
              <Select.Option value="address">地址</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            hasFeedback
          >
            <Input
              {...getFieldProps('keyword', {
                initialValue: keyword || ''
              })}
            />
          </Form.Item>
          <Button style={{ marginRight: '10px' }} type="primary" htmlType="submit">搜索</Button>
        </Form>
      </div>
      <div className={styles.create}>
        <Button type="ghost" onClick={onAdd}>添加</Button>
      </div>
    </div>
  );
}

UserSearch.propTypes = {
  form: PropTypes.object.isRequired,
  onSearch: PropTypes.func,
  onAdd: PropTypes.func,
  field: PropTypes.string,
  keyword: PropTypes.string
};

export default Form.create()(UserSearch);
