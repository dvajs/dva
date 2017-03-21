
module.exports = function(webpackConfig) {
  webpackConfig.babel.plugins.push('transform-runtime');
  return webpackConfig;
};
