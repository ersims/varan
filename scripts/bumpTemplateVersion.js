#!/usr/bin/env node

// Dependencies
const fs = require('fs');
const path = require('path');
const execa = require('execa');
const pkg = require('../package.json');

// Init
process.on('unhandledRejection', (err) => { throw err; });

try {
  const pkgFile = path.resolve(__dirname, '..', 'template', 'package.json');
  const templatePkg = require(pkgFile);
  if (templatePkg.dependencies[pkg.name]) templatePkg.dependencies[pkg.name] = `^${pkg.version}`;
  if (templatePkg.devDependencies[pkg.name]) templatePkg.devDependencies[pkg.name] = `^${pkg.version}`;

  // Update file contents
  fs.writeFileSync(pkgFile, JSON.stringify(templatePkg, null, 2), 'UTF-8');

  // Add changed file to git
  const procGit = execa.sync('git', ['add', pkgFile], {
    stdio: 'inherit',
  });
  if (procGit.status !== 0) {
    console.error(`Failed to git add template/package.json`);
    process.exit(1);
  }
} catch (err) {
  console.error(`Failed to update template dependency version`);
  process.exit(1);
}
