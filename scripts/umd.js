#!/usr/bin/env node

const shell = require('shelljs');
const { join } = require('path');

const cwd = process.cwd();
shell.cd(join(cwd, 'packages', 'dva'));

const affix = process.env.NODE_ENV === 'production' ? '.min.js' : '.js';

shell.exec(
  `../../node_modules/.bin/rollup ./umd/dva.js -o dist/dva${affix} -f umd --name "dva" -g "react:React,react-dom:ReactDOM" -c ../../rollup.config.js`
);
shell.exec(
  `../../node_modules/.bin/rollup ./umd/router.js -o dist/dva.router${affix} -f umd --name "dva.router" -g "react:React,react-dom:ReactDOM" -c ../../rollup.config.js`
);
shell.exec(
  `../../node_modules/.bin/rollup ./umd/dynamic.js -o dist/dva.dynamic${affix} -f umd --name "dva.dynamic" -g "react:React,react-dom:ReactDOM" -c ../../rollup.config.js`
);
