const { createClientConfig } = require('../dist');

/**
 * Create a webpack configuration optimized for client (browser) applications
 *
 * @param {{ analyze: boolean=, appDir: string=, buildVars: object=, entry: string=, env: 'development' | 'test' | 'production'=, target: 'web' | 'node'=, name: string=, pwaManifest: object=, targetDir: string=, sourceDir: string=, devServerPort: number=, serverPort: number= }=} options
 * @returns {webpack.Configuration}
 */
module.exports = createClientConfig;
