// Dependencies
const logger = require('../../../src/lib/logger');

// Tests
describe('lib', () => {
  describe('logger', () => {
    it('create a logging function', () => {
      // Mock logger
      console.log = jest.fn();

      // Run
      const log = logger();

      /**
       * Assertions
       */
      expect(typeof log).toBe('function');
      expect(console.log).toHaveBeenCalledTimes(0);

      // Test log
      log('test string');
      expect(console.log).toHaveBeenCalledTimes(1);
      expect(console.log.mock.calls[0][0]).toEqual('test string');
    });
    it('should not log if options.silent === true', () => {
      // Mock logger
      console.log = jest.fn();

      // Run
      const log = logger({ silent: true });
      log('test string');

      /**
       * Assertions
       */
      expect(console.log).toHaveBeenCalledTimes(0);
    });
  });
});
