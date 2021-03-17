import webpack from 'webpack';
import { resolveAppRelativePath } from './resolveAppRelativePath';

// Types
export type ValidConfiguration<T = any> = string | webpack.Configuration | ((opts: T) => webpack.Configuration);

// Exports
export const getWebpackConfig = async <T>(
  configFileOrObjectOrFn: ValidConfiguration<T>,
  opts?: T,
): Promise<webpack.Configuration> => {
  // eslint-disable-next-line
  const rawConfig =
    typeof configFileOrObjectOrFn === 'string'
      ? (await import(resolveAppRelativePath(configFileOrObjectOrFn))).default
      : configFileOrObjectOrFn;
  return typeof rawConfig === 'function' ? rawConfig(opts) : rawConfig;
};
