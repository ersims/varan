// Dependencies
import path from 'path';
import getConfigs from '../../../src/lib/getConfigs';
import mini from '../../fixtures/webpack/mini';
import miniFn from '../../fixtures/webpack/miniFn';

// Init
const resolve = (p: string) => path.resolve(__dirname, p);

// Tests
describe('lib', () => {
  describe('getConfigs', () => {
    it('should give meaningful error message if no configs were provided', () => {
      // @ts-ignore
      expect(() => getConfigs()).toThrow('Must specify at least one config');
      expect(() => getConfigs([])).toThrow('Must specify at least one config');
      // @ts-ignore
      expect(() => getConfigs([null, undefined, ''])).toThrow('Must specify at least one config');
    });
    it('should support a single config file returning an object', () => {
      const configPath = resolve('../../fixtures/webpack/mini');
      expect(getConfigs(configPath)).toEqual([mini]);
    });
    it('should support a single config file returning a function', () => {
      const configPath = resolve('../../fixtures/webpack/miniFn');
      expect(getConfigs(configPath)).toEqual([miniFn()]);
    });
    it('should support a single config object', () => {
      expect(getConfigs({ mode: 'production' })).toEqual([{ mode: 'production' }]);
    });
    it('should support a single config function', () => {
      expect(getConfigs(() => ({ mode: 'production' }))).toEqual([{ mode: 'production' }]);
    });
    it('should support multiple mixed configs', () => {
      const configPath = resolve('../../fixtures/webpack/mini');
      const configs = [
        configPath,
        () => ({ mode: 'development' as 'development' }),
        { mode: 'production' as 'production' },
      ];
      expect(getConfigs(configs)).toEqual([mini, { mode: 'development' }, { mode: 'production' }]);
    });
    it('should pass options to the config function', () => {
      const options = { optionKey: 'optionValue' };
      const configPath = resolve('../../fixtures/webpack/miniFn');
      const configs = [
        configPath,
        (opts: any) => ({ mode: 'development' as 'development', ...opts }),
        { mode: 'production' as 'production' },
      ];
      expect(getConfigs(configs, options)).toEqual([
        miniFn(options),
        { mode: 'development', optionKey: 'optionValue' },
        { mode: 'production' },
      ]);
    });
  });
});
