// Dependencies
const shell = require('shelljs');
const path = require('path');

// Init
shell.config.silent = true;
const examplesDir = path.resolve(__dirname, '../../examples');
const rootDir = path.resolve(__dirname, '../../.tmp_test_artifacts', Date.now().toString());
const getTargetDir = (fixture, id) => path.resolve(rootDir, `${id}_${fixture}`);

// Exports
module.exports = class MockProject {
  static cleanup() {
    shell.rm('-rf', rootDir);
  }
  constructor(id, fixture) {
    this.id = id;
    this.fixture = fixture;
    this.rootDir = rootDir;
    this.sourceDir = path.resolve(examplesDir, this.fixture);
    this.targetDir = getTargetDir(this.fixture, this.id);
    this.shell = shell;
    shell.mkdir('-p', this.rootDir);
    shell.cp('-R', this.sourceDir, this.targetDir);
    shell.ln('-s', path.resolve(this.sourceDir, '../../../node_modules'), path.resolve(this.targetDir, 'node_modules'));
    shell.cd(this.targetDir);
  }
  teardown() {
    shell.rm('-rf', this.targetDir);
  }
};
