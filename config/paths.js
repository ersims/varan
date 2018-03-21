// Dependencies
const path = require('path');
const fs = require('fs');

// Init
const appDirectory = fs.realpathSync(process.cwd());
const resolve = relativePath => path.resolve(appDirectory, relativePath);

// Exports
module.exports = {
  appDirectory,
  sourceDirectory: resolve('src'),
  targetDirectory: resolve('dist'),
  client: {
    sourceDir: resolve('src/client'),
    entries: {
      app: 'index.js',
    },
    targetDir: resolve('dist/client'),
  },
  server: {
    sourceDir: resolve('src/server'),
    entries: {
      app: 'bin/app.js',
    },
    targetDir: resolve('dist/server'),
  },
  templates: {
    sourceDir: resolve('src/templates'),
    entries: {
      app: 'index.hbs',
    },
    targetDir: resolve('dist/templates'),
  },
};
