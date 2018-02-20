
import isPlainObject from 'is-plain-object';
export { isPlainObject }
export const isArray = Array.isArray.bind(Array);
export const isFunction = o => typeof o === 'function';
export const returnSelf = m => m;
export const noop = () => {};
