# dva-error

[![NPM version](https://img.shields.io/npm/v/dva-loading.svg?style=flat)](https://npmjs.org/package/dva-loading)
[![Build Status](https://img.shields.io/travis/dvajs/dva-loading.svg?style=flat)](https://travis-ci.org/dvajs/dva-loading)
[![Coverage Status](https://img.shields.io/coveralls/dvajs/dva-loading.svg?style=flat)](https://coveralls.io/r/dvajs/dva-loading)
[![NPM downloads](http://img.shields.io/npm/dm/dva-loading.svg?style=flat)](https://npmjs.org/package/dva-loading)

Auto error data binding plugin for dva. :clap: You don't need to write `setError` any more.

---

## Install

```bash
$ npm install dva-error --save
```

## Usage

```javascript
import createError from 'dva-error';

const app = dva();
app.use(createError(opts));
```

Then we can access error state from store.

### opts

- `opts.namespace`: property key on global state, type String, Default `error`

[See real project usage on dva-hackernews](https://github.com/dvajs/dva-hackernews/blob/2c3330b1c8ae728c94ebe1399b72486ad5a1a7a0/src/index.js#L4-L7).

## State Structure

```
error: {
  global: [],
  models: {
    users: [],
    todos: [],
    ...
  },
  effects: {
    'a/b': undefined,
    ...
  },
}
```

## License

[MIT](https://tldrlegal.com/license/mit-license)
