// Dependencies
const path = require('path');
const fs = require('fs');
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
      const customPath = os.tmpdir();
      const paths = getPaths(customPath);
      expect(paths.appDir).toEqual(fs.realpathSync(customPath));
    });
  });
});
