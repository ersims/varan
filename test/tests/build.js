// Dependencies
const path = require('path');
const MockProject = require('../fixtures/MockProject');
const { build } = require('../../index');

// Init
const slowTimeout = 20000;

// Tests
describe('build', () => {
  it('should reject a broken build and give give meaningful error message', async (done) => {
    jest.setTimeout(slowTimeout);
    const mockProject = new MockProject('build-with-error', 'with-error');

    // Mock logger
    console.error = jest.fn();

    /**
     * Assertions
     */
    await expect(build({
      cwd: mockProject.targetDir,
      configs: [
        '../fixtures/webpack/customClientExtends.js'
      ].map(p => path.resolve(__dirname, p)),
    })).rejects.toThrow('Build failed');

    // Check logging
    expect(console.error).toHaveBeenCalled();
    expect(console.error.mock.calls[0][0][0]).toEqual(
      expect.arrayContaining([
        expect.stringContaining('(index.js) ./src/client/index.js'),
        expect.stringContaining('Module build failed: SyntaxError'),
      ])
    );

    // Done
    done();
  });
  it('should display webpack warnings', async (done) => {
    jest.setTimeout(slowTimeout);
    const mockProject = new MockProject('build-with-warning', 'with-warning');

    // Mock logger
    console.warn = jest.fn();

    /**
     * Assertions
     */
    await build({
      cwd: mockProject.targetDir,
      configs: [
        '../fixtures/webpack/customClientExtends.js'
      ].map(p => path.resolve(__dirname, p)),
      warnBundleSize: 1,
    });

    // Check logging
    const output = console.warn.mock.calls[0][0][0];
    expect(console.warn).toHaveBeenCalled();
    expect(output).toEqual(expect.stringContaining('(index.js) ./src/client/index.js'));
    expect(output).toEqual(expect.stringContaining('Critical dependency: the request of a dependency is an expression'));

    // Done
    done();
  });
});
