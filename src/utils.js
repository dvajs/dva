
export function check(value, predicate, error) {
  if(!predicate(value)) {
    log('error', 'uncaught at check', error)
    throw new Error(error)
  }
}

export const is = {
  undef     : v => v === null || v === undefined,
  notUndef  : v => v !== null && v !== undefined,
  string    : f => typeof f === 'string',
  func      : f => typeof f === 'function',
  number    : n => typeof n === 'number',
  array     : Array.isArray,
  jsx       : v => v && v.$$typeof && v.$$typeof.toString() === 'Symbol(react.element)',
};

/**
 Print error in a useful way whether in a browser environment
 (with expandable error stack traces), or in a node.js environment
 (text-only log output)
 **/
export function log(level, message, error) {
  /*eslint-disable no-console*/
  if(typeof window === 'undefined') {
    console.log(`redux-saga ${level}: ${message}\n${(error && error.stack) || error}`)
  } else {
    console[level].call(console, message, error)
  }
}
