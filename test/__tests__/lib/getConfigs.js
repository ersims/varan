// Dependencies
const path = require('path');
const getConfigs = require('../../../src/lib/getConfigs');

// Init
const resolve = p => path.resolve(__dirname, p);

// Tests
describe('lib', () => {
  describe('getConfigs', () => {
    it('should give meaningful error message if no configs were provided', () => {
      expect(() => getConfigs()).toThrow('Must specify at least one config');
      expect(() => getConfigs([])).toThrow('Must specify at least one config');
      expect(() => getConfigs([null, undefined, ''])).toThrow('Must specify at least one config');
    });
    it('should support a single config file returning an object', () => {
      const configPath = resolve('../../fixtures/webpack/mini');
      expect(getConfigs(configPath)).toEqual([require(configPath)]);
    });
    it('should support a single config file returning a function', () => {
      const configPath = resolve('../../fixtures/webpack/miniFn');
      expect(getConfigs(configPath)).toEqual([require(configPath)()]);
    });
    it('should support a single config object', () => {
      expect(getConfigs({ mode: 'production' })).toEqual([{ mode: 'production' }]);
    });
    it('should support a single config function', () => {
      expect(getConfigs(() => ({ mode: 'production' }))).toEqual([{ mode: 'production' }]);
    });
    it('should support multiple mixed configs', () => {
      const configPath = resolve('../../fixtures/webpack/mini');
      const configs = [configPath, () => ({ mode: 'development' }), { mode: 'production' }];
      expect(getConfigs(configs)).toEqual([require(configPath), { mode: 'development' }, { mode: 'production' }]);
    });
    it('should pass options to the config function', () => {
      const options = { optionKey: 'optionValue' };
      const configPath = resolve('../../fixtures/webpack/miniFn');
      const configs = [configPath, opts => ({ mode: 'development', ...opts }), { mode: 'production' }];
      expect(getConfigs(configs, options)).toEqual([
        require(configPath)(options),
        { mode: 'development', optionKey: 'optionValue' },
        { mode: 'production' },
      ]);
    });
  });
});
