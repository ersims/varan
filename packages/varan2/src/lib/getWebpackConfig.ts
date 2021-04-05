import webpack from 'webpack';
import { resolveAppRelativePath } from './resolveAppRelativePath';
import { WebpackArguments, WebpackEnvironment } from '../types/WebpackConfigurationFunction';

// Types
export type ValidConfiguration =
  | string
  | webpack.Configuration
  | ((env?: WebpackEnvironment, argv?: WebpackArguments) => webpack.Configuration);

// Exports
export const getWebpackConfig = async (
  configFileOrObjectOrFn: ValidConfiguration,
  env?: WebpackEnvironment,
  argv?: WebpackArguments,
): Promise<webpack.Configuration> => {
  // eslint-disable-next-line
  const rawConfig =
    typeof configFileOrObjectOrFn === 'string'
      ? (await import(resolveAppRelativePath(configFileOrObjectOrFn))).default
      : configFileOrObjectOrFn;
  return typeof rawConfig === 'function' ? rawConfig(env, argv) : rawConfig;
};
