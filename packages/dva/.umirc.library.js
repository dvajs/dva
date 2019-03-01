export default {
  entry: ['src/index.js', 'src/dynamic.js', 'router.js'],
  cjs: { type: 'babel' },
  esm: { type: 'babel' },
  umd: {},
  overridesByEntry: {
    'src/index.js': {
      umd: {
        file: 'dva',
        name: 'dva',
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
    'src/dynamic.js': {
      umd: {
        file: 'dva.dynamic',
        name: 'dva.dynamic',
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
    'router.js': {
      umd: { file: 'dva.router', name: 'dva.router' },
    },
  },
};
