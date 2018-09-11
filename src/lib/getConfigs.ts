// Dependencies
import webpack from 'webpack';

// Types
export type ValidConfiguration<T = any> = string | webpack.Configuration | ((opts: T) => webpack.Configuration);
export type ValidConfigurations<T = any> = ValidConfiguration<T> | Array<ValidConfiguration<T>>;

// Exports
export default function getConfigs<T>(configFilesOrObjectsOrFns: ValidConfigurations<T>, opts?: T) {
  const configs = (Array.isArray(configFilesOrObjectsOrFns)
    ? configFilesOrObjectsOrFns
    : [configFilesOrObjectsOrFns]
  ).filter(Boolean);

  // Check for required files
  if (configs.length === 0) throw new Error('Must specify at least one config');

  // Load config files
  return configs.map(config => {
    const rawConfig = typeof config === 'string' ? require(config) : config;
    return typeof rawConfig === 'function' ? rawConfig(opts) : rawConfig;
  });
}
