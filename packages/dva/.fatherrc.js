export default {
  entry: ['src/index.tsx', 'src/dynamic.js'],
  cjs: 'rollup',
  esm: 'rollup',
  runtimeHelpers: true,
};
