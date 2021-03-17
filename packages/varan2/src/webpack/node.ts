import { resolve } from 'path';
import { WebpackConfigurationFunction } from '../types/WebpackConfigurationFunction';
import { resolveAppRelativePath } from '../lib/resolveAppRelativePath';
import { base } from './base';

// TODO: Serverthing
// eslint-disable-next-line
import nodeExternals from 'webpack-node-externals';

// Exports
export const node: WebpackConfigurationFunction = (env = {}, argv = {}) => {
  const baseConfig = base(env, { ...argv, target: 'node' });
  return {
    ...baseConfig,
    target: 'node',
    entry: resolveAppRelativePath('src/server/bin/web'),
    output: {
      ...baseConfig.output,
      path: resolveAppRelativePath('dist/node'),
    },
    // TODO: Serverthing
    externals: [
      nodeExternals({
        modulesDir: resolve(process.cwd(), 'node_modules'),
      }),
      nodeExternals({
        modulesDir: resolve(__dirname, '..', 'node_modules'),
      }),
    ],
  };
};
