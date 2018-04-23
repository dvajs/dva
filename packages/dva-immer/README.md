# dva-immer

[![NPM version](https://img.shields.io/npm/v/dva-immer.svg?style=flat)](https://npmjs.org/package/dva-immer)
[![Build Status](https://img.shields.io/travis/dvajs/dva-immer.svg?style=flat)](https://travis-ci.org/dvajs/dva-immer)
[![Coverage Status](https://img.shields.io/coveralls/dvajs/dva-immer.svg?style=flat)](https://coveralls.io/r/dvajs/dva-immer)
[![NPM downloads](http://img.shields.io/npm/dm/dva-immer.svg?style=flat)](https://npmjs.org/package/dva-immer)

Create the next immutable state tree by simply modifying the current tree

---

## Install

```bash
$ npm install dva-immer --save
```

## Usage

```javascript

const app = dva();
app.use(require('dva-immer').default());
```
some like [umi-plugin-dva](https://github.com/umijs/umi/blob/master/packages/umi-plugin-dva/src/index.js) line 106

Look more [Immer](https://github.com/mweststrate/immer)


## License

[MIT](https://tldrlegal.com/license/mit-license)
