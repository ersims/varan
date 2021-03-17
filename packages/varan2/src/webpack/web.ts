import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import { WebpackConfigurationFunction } from '../types/WebpackConfigurationFunction';
import { resolveAppRelativePath } from '../lib/resolveAppRelativePath';
import { base } from './base';
import { WebpackVaranAssetsManifestPlugin } from '../lib/WebpackVaranAssetsManifestPlugin';

// Exports
export const web: WebpackConfigurationFunction = (env = {}, argv = {}) => {
  const isDev = false;
  // const isDev = !env.production;
  const baseConfig = base(env, argv);
  return {
    ...baseConfig,
    target: 'web',
    entry: resolveAppRelativePath('src/client/index'),
    output: {
      ...baseConfig.output,
      path: resolveAppRelativePath('dist/web'),
      filename: isDev ? 'static/js/dev-bundle.js' : 'static/js/[name].[contenthash:8].js',
    },
    plugins: [
      ...(baseConfig.plugins || []),
      !isDev &&
        new MiniCssExtractPlugin({
          filename: 'static/css/[name].[contenthash:8].css',
          chunkFilename: 'static/css/[name].[contenthash:8].chunk.css',
        }),
      !isDev &&
        new CssMinimizerPlugin({
          parallel: true,
          minimizerOptions: {
            preset: ['default', { discardComments: { removeAll: true } }],
          },
        }),
      new WebpackVaranAssetsManifestPlugin(),
    ].filter(Boolean),
  };
};
