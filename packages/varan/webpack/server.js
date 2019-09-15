const { createServerConfig } = require('../dist');

/**
 * Create a webpack configuration optimized for server (node) applications
 *
 * @param {{ appDir: string=, buildVars: object=, entry: string=, env: 'development' | 'test' | 'production'=, target: 'web' | 'node'=, name: string=, targetDir: string=, sourceDir: string=, clientSourceDir: string=, whitelistExternals: string[]= }=} options
 * @returns {webpack.Configuration}
 */
module.exports = createServerConfig;
