const createCommonConfig = require('../dist/webpack/createCommonConfig');

/**
 * Create a webpack configuration optimized for client (browser) applications
 *
 * @param {{ appDir: string=, env: 'development' | 'test' | 'production'=, target: 'web' | 'node'=}=} options
 * @returns {webpack.Configuration}
 */
module.exports = createCommonConfig;
