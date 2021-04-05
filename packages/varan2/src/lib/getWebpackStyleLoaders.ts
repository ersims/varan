import postCssPresetEnv from 'postcss-preset-env';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

// Exports
export const getWebpackStyleLoaders = (
  { isDev, isNode }: { isDev: boolean; isNode: boolean },
  cssOptions: { [key: string]: any },
  preProcessor?: { [key: string]: any },
  // TODO: Type returntype correctly
): any[] => {
  return [
    !isNode && (isDev ? { loader: require.resolve('style-loader') } : { loader: MiniCssExtractPlugin.loader }),
    {
      loader: require.resolve('css-loader'),
      options: {
        importLoaders: preProcessor ? 3 : 1,
        sourceMap: isDev,
        ...cssOptions,
      },
    },
    {
      loader: require.resolve('postcss-loader'),
      options: {
        postcssOptions: {
          ident: 'postcss',
          plugins: [postCssPresetEnv()],
          sourceMap: isDev,
        },
      },
    },
    !!preProcessor && {
      loader: require.resolve('resolve-url-loader'),
    },
    preProcessor,
  ].filter(Boolean);
};
