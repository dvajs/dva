import isPlainObject from 'is-plain-object';
export { isPlainObject };
export const isArray = Array.isArray.bind(Array);
export const isFunction = o => typeof o === 'function';
export const returnSelf = m => m;
export const noop = () => {};
export const findIndex = (array, predicate) => {
  for (let i = 0, { length } = array; i < length; i += 1) {
    if (predicate(array[i], i)) return i;
  }

  return -1;
};
