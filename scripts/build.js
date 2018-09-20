const vfs = require('vinyl-fs');
const babel = require('@babel/core');
const through = require('through2');
const chalk = require('chalk');
const rimraf = require('rimraf');
const { readdirSync, readFileSync, writeFileSync, existsSync } = require('fs');
const { join } = require('path');
const chokidar = require('chokidar');

const lib = process.env.ES ? 'es' : 'lib';

const browserBabelConfig = {
  presets: [
    [
      require.resolve('@babel/preset-env'),
      {
        targets: {
          browsers: ['last 2 versions', 'IE 10'],
        },
        modules: process.env.ES ? false : 'commonjs',
      },
    ],
    require.resolve('@babel/preset-react'),
  ],
  plugins: [
    require.resolve('@babel/plugin-transform-runtime'),
    require.resolve('@babel/plugin-proposal-export-default-from'),
  ],
};

const cwd = process.cwd();

function transform(opts = {}) {
  const { content, path } = opts;
  console.log(chalk.yellow(`[TRANSFORM] ${path.replace(`${cwd}/`, '')}`));
  return babel.transform(content, browserBabelConfig).code;
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
