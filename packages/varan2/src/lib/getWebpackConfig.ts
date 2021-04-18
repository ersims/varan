import { Configuration } from 'webpack';
import { resolveAppRelativePath } from './resolveAppRelativePath';
import { WebpackConfigurationFunction } from '../types/WebpackConfigurationFunction';
import { WebpackMultiConfigurationFunction } from '../types/WebpackMultiConfigurationFunction';
import { WebpackEnvironment } from '../types/WebpackEnvironment';
import { WebpackArguments } from '../types/WebpackArguments';

// Types
export type ValidConfiguration =
  | string
  | Configuration
  | WebpackConfigurationFunction
  | WebpackMultiConfigurationFunction;

// Exports
export const getWebpackConfig = async (
  configFileOrObjectOrFn: ValidConfiguration,
  env?: WebpackEnvironment,
  argv?: WebpackArguments,
): Promise<Configuration | Configuration[]> => {
  // eslint-disable-next-line
  const rawConfig =
    typeof configFileOrObjectOrFn === 'string'
      ? (await import(resolveAppRelativePath(configFileOrObjectOrFn))).default
      : configFileOrObjectOrFn;
  return typeof rawConfig === 'function' ? rawConfig(env, argv) : rawConfig;
};
