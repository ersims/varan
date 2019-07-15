/* eslint-disable no-console */
import createLogger from '../../../src/lib/createLogger';

// Tests
it('create a logging function', () => {
  // Mock logger
  console.log = jest.fn();

  // Run
  const log = createLogger();

  /**
   * Assertions
   */
  expect(typeof log.info).toBe('function');
  expect(typeof log.warn).toBe('function');
  expect(typeof log.error).toBe('function');
  expect(console.log).toHaveBeenCalledTimes(0);

  // Test log
  log.info('test string');
  expect(console.log).toHaveBeenCalledTimes(1);
  expect(console.log).toHaveBeenCalledWith('test string');
});
it('should not log if options.silent === true', () => {
  // Mock logger
  console.log = jest.fn();

  // Run
  const log = createLogger({ silent: true });
  log.info('test string');

  /**
   * Assertions
   */
  expect(console.log).toHaveBeenCalledTimes(0);
});
it('should log error even if options.silent === true', () => {
  // Mock logger
  console.log = jest.fn();

  // Run
  const log = createLogger({ silent: true });
  log.info('test string1');
  log.warn('test string2');
  log.error('test string3');

  /**
   * Assertions
   */
  expect(console.log).toHaveBeenCalledTimes(1);
  expect(console.log).toHaveBeenCalledWith('test string3');
});
