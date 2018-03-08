export isPlainObject from 'is-plain-object';
export const isArray = Array.isArray.bind(Array);
export const isFunction = o => typeof o === 'function';
export const returnSelf = m => m;
export const noop = () => {};
export const deepClone = (target) => {
    let clone = {};
    if (!target || typeof target !== 'object') {
        return target;
    }
    if (isArray(target)) {
        clone = target.map(item => deepClone(item));
        return clone;
    }
    for (let key in target) {
        if (target.hasOwnProperty(key)) {
            clone[key] = deepClone(target[key]);
        }
    }
    return clone;
};
