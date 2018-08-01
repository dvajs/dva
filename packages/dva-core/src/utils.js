export isPlainObject from 'is-plain-object';
export const isArray = Array.isArray.bind(Array);
export const isFunction = o => typeof o === 'function';
export const returnSelf = m => m;
// avoid es6 array.prototype.findIndex polyfill
export const noop = () => {};
export const findIndex = (array, predicate) => {
  for (let i = 0, length = array.length; i < length; i++) {
    if (predicate(array[i], i)) return i;
  }

  return -1;
};
