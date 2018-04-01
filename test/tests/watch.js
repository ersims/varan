// Dependencies
const path = require('path');
const MockProject = require('../fixtures/MockProject');
const { watch } = require('../../index');

// Init
const slowTimeout = 20000;

// Tests
describe('watch', () => {
  it('should give meaningful error message if no config files were provided', () => {
    return expect(watch({ clientConfigFile: null, serverConfigFile: null })).rejects.toThrow('Must specify at least one config');
  });
});
