// Dependencies
const path = require('path');
const os = require('os');
const getPaths = require('../../../src/lib/getPaths');

// Tests
describe('lib', () => {
  describe('getPaths', () => {
    it('should use process.cwd() as default', () => {
      const paths = getPaths();
      expect(paths.appDir).toEqual(path.resolve(process.cwd()));
    });
    it('should support custom root path', () => {
      const paths = getPaths(os.tmpdir());
      expect(paths.appDir).toEqual(path.resolve(os.tmpdir()));
    });
  });
});
