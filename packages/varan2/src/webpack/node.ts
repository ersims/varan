import { HotModuleReplacementPlugin, SourceMapDevToolPlugin, WebpackPluginInstance } from 'webpack';
import { resolve } from 'path';
import nodeExternals from 'webpack-node-externals';
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import { WebpackConfigurationFunction } from '../types/WebpackConfigurationFunction';
import { resolveAppRelativePath } from '../lib/resolveAppRelativePath';
import { base } from './base';
import { WebpackVaranAssetsManifestPlugin } from '../lib/WebpackVaranAssetsManifestPlugin';

// Init
const target = 'node';

// Exports
export const node: WebpackConfigurationFunction = (env = {}, argv = {}) => {
  const isDev = argv?.mode === 'development';
  const baseConfig = base(env, { ...argv, target });
  return {
    ...baseConfig,
    target,
    entry: resolveAppRelativePath('src/server/index'),
    output: {
      ...baseConfig.output,
      path: resolveAppRelativePath('dist/node'),
    },
    externals: [
      nodeExternals({
        modulesDir: resolve(process.cwd(), 'node_modules'),
      }),
      nodeExternals({
        modulesDir: resolve(__dirname, '..', 'node_modules'),
      }),
    ],
    plugins: [
      ...(baseConfig.plugins || []),
      // Required for ReactRefresh to work (when not using webpack-dev-server)
      isDev && new HotModuleReplacementPlugin(),
      isDev && new ReactRefreshWebpackPlugin(),
      new SourceMapDevToolPlugin(),
      // new WebpackVaranAssetsManifestPlugin({ filename: 'varan.manifest.json' }),
    ].filter(Boolean) as WebpackPluginInstance[],
  };
};
