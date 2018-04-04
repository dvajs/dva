import useImmer from 'dva-immer';

export function config() {
  return {
    ...useImmer(),
  };
}
