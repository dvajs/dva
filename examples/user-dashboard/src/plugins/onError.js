import { message } from 'antd';

const ERROR_MSG_DURATION = 3; // 3 秒

export default {
  onError(e) {
    message.error(e.message, ERROR_MSG_DURATION);
  },
};
