#!/usr/bin/env node

// Dependencies
const fs = require('fs');
const path = require('path');
const pkg = require('../package.json');

// Init
process.on('unhandledRejection', err => {
  throw err;
});

try {
  const pkgFile = path.resolve(__dirname, '..', 'template', 'package.json');
  // eslint-disable-next-line import/no-dynamic-require
  const templatePkg = require(pkgFile);
  if (templatePkg.dependencies[pkg.name]) templatePkg.dependencies[pkg.name] = `^${pkg.version}`;
  if (templatePkg.devDependencies[pkg.name]) templatePkg.devDependencies[pkg.name] = `^${pkg.version}`;

  // Update file contents
  fs.writeFileSync(pkgFile, JSON.stringify(templatePkg, null, 2), 'UTF-8');
} catch (err) {
  // eslint-disable-next-line no-console
  console.error(`Failed to update template dependency version`);
  process.exit(1);
}
