import { DefinePlugin } from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { resolve, relative } from 'path';
import { WebpackMultiConfigurationFunction } from '../types/WebpackMultiConfigurationFunction';
import { web } from './web';
import { node } from './node';
import { WebpackVaranAssetsManifestPlugin } from '../lib/WebpackVaranAssetsManifestPlugin';

// Exports
export const ssr: WebpackMultiConfigurationFunction = (env = {}, argv = {}) => {
  const clientConfig = web(env, argv);
  const serverConfig = node(env, argv);
  const serverPort = (clientConfig.devServer?.port || 3000) + 1;
  const clientPath = clientConfig.output!.path!;
  const clientAssetsManifestPath = resolve(
    clientPath,
    (clientConfig.plugins || []).find(
      (plugin): plugin is WebpackVaranAssetsManifestPlugin => plugin instanceof WebpackVaranAssetsManifestPlugin,
    )!.options.filename,
  );
  const serverPath = serverConfig.output!.path!;
  return [
    {
      ...clientConfig,
      devServer: {
        ...clientConfig.devServer,
        proxy: {
          '/': {
            target: `http://localhost:${serverPort}/`,
            changeOrigin: true,
            logLevel: 'warn',
          },
        },
      },
      // Disabled as we expect SSR to generate the index file
      plugins: (clientConfig.plugins || []).filter((plugin) => !(plugin instanceof HtmlWebpackPlugin)),
    },
    {
      ...serverConfig,
      plugins: [
        ...(serverConfig.plugins || []),
        new DefinePlugin({
          'process.env.VARAN_CLIENT_ROOT': JSON.stringify(relative(serverPath, clientPath)),
          'process.env.VARAN_CLIENT_ASSETS_MANIFEST': JSON.stringify(relative(serverPath, clientAssetsManifestPath)),
        }),
      ],
    },
  ];
};
