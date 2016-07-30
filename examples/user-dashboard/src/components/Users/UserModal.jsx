import React, { PropTypes } from 'react';
import { Form, Input, Modal } from 'antd';
const FormItem = Form.Item;

const formItemLayout = {
  labelCol: {
    span: 6
  },
  wrapperCol: {
    span: 14
  }
};

function UserModal({
  visible, form, item = {},
  onOk,
  onCancel,
  }) {

  const { getFieldProps } = form;

  function handleOk() {
    form.validateFields((errors) => {
      if (errors) {
        return;
      }

      const data = { ...form.getFieldsValue(), key: item.key };

      onOk(data);
    });
  }

  function checkNumber(rule, value, callback) {
    if (!/^[\d]{1,2}$/.test(value)) {
      callback(new Error('年龄不合法'));
    } else {
      callback();
    }
  }

  function getFieldPropsBy(key, message, validator) {
    const rules = [{
      required: true,
      message,
      validator
    }];
    return getFieldProps(key, { rules, initialValue: item[key] || '' });
  }

  const modalOpts = {
    title: '修改用户',
    visible,
    onOk: handleOk,
    onCancel,
  };

  return (
    <Modal {...modalOpts}>
      <Form horizontal>
        <FormItem
          label="姓名："
          hasFeedback
          {...formItemLayout}
        >
          <Input {...getFieldPropsBy('name', '不能为空')} />
        </FormItem>
        <FormItem
          label="年龄："
          hasFeedback
          {...formItemLayout}
        >
          <Input type="age" {...getFieldPropsBy('age', '年龄不合法', checkNumber)} />
        </FormItem>
        <FormItem
          label="住址："
          hasFeedback
          {...formItemLayout}
        >
          <Input type="address" {...getFieldPropsBy('address', '不能为空')} />
        </FormItem>
      </Form>
    </Modal>
  );
}

UserModal.propTypes = {
  visible: PropTypes.any,
  form: PropTypes.object,
  item: PropTypes.object,
  onOk: PropTypes.func,
  onCancel: PropTypes.func,
};

export default Form.create()(UserModal);
