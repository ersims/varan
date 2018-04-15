// Dependencies
const path = require('path');
const fs = require('fs');

// Exports
module.exports = (cwd = process.cwd()) => {
  const appDir = fs.realpathSync(cwd);
  const resolve = relativePath => path.resolve(appDir, relativePath);
  return {
    appDir,
    appSourceDir: resolve('src'),
    appTargetDir: resolve('dist'),
    client: {
      sourceDir: resolve('src/client'),
      entry: 'index.js',
      favicon: resolve('src/assets/favicon.ico'),
      targetDir: resolve('dist/client'),
    },
    server: {
      sourceDir: resolve('src/server'),
      entry: 'bin/web.js',
      targetDir: resolve('dist/server'),
    },
  };
};
