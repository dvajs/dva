const vfs = require('vinyl-fs');
const babel = require('@babel/core');
const through = require('through2');
const chalk = require('chalk');
const rimraf = require('rimraf');
const { readdirSync, readFileSync, writeFileSync, existsSync } = require('fs');
const { join } = require('path');
const chokidar = require('chokidar');

const lib = process.env.ES ? 'es' : 'lib';

const nodeBabelConfig = {
  presets: [
    [
      require.resolve('@babel/preset-env'),
      {
        targets: {
          node: 6,
        },
      },
    ],
    [require.resolve('@babel/preset-stage-0'), { decoratorsLegacy: true }],
  ],
};
const browserBabelConfig = {
  presets: [
    [
      require.resolve('@babel/preset-env'),
      {
        browsers: ['last 2 versions', 'IE 10'],
        modules: process.env.ES ? false : 'commonjs',
      },
    ],
    require.resolve('@babel/preset-react'),
    [require.resolve('@babel/preset-stage-0'), { decoratorsLegacy: true }],
  ],
  plugins: [require.resolve('@babel/plugin-transform-runtime')],
};

const cwd = process.cwd();

function isBrowserTransform(path) {
  return true;
}

function transform(opts = {}) {
  const { content, path } = opts;
  const isBrowser = isBrowserTransform(path);
  console.log(
    chalk[isBrowser ? 'yellow' : 'blue'](
      `[TRANSFORM] ${path.replace(`${cwd}/`, '')}`
    )
  );
  const config = isBrowser ? browserBabelConfig : nodeBabelConfig;
  return babel.transform(content, config).code;
}

function buildPkg(pkg) {
  rimraf.sync(join(cwd, 'packages', pkg, lib));
  vfs
    .src(`./packages/${pkg}/src/**/*.js`)
    .pipe(
      through.obj((f, enc, cb) => {
        f.contents = new Buffer( // eslint-disable-line
          transform({
            content: f.contents,
            path: f.path,
          })
        );
        cb(null, f);
      })
    )
    .pipe(vfs.dest(`./packages/${pkg}/${lib}/`));
}

function build() {
  const dirs = readdirSync(join(cwd, 'packages'));
  const arg = process.argv[2];
  const isWatch = arg === '-w' || arg === '--watch';
  dirs.forEach(pkg => {
    if (pkg.charAt(0) === '.') return;
    buildPkg(pkg);
    if (isWatch) {
      const watcher = chokidar.watch(join(cwd, 'packages', pkg, 'src'), {
        ignoreInitial: true,
      });
      watcher.on('all', (event, fullPath) => {
        if (!existsSync(fullPath)) return;
        const relPath = fullPath.replace(`${cwd}/packages/${pkg}/src/`, '');
        const content = readFileSync(fullPath, 'utf-8');
        try {
          const code = transform({
            content,
            path: fullPath,
          });
          writeFileSync(
            join(cwd, 'packages', pkg, lib, relPath),
            code,
            'utf-8'
          );
        } catch (e) {
          console.log(chalk.red('Compiled failed.'));
          console.log(chalk.red(e.message));
        }
      });
    }
  });
}

build();
