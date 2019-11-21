import loaderUtils from 'loader-utils';
import webpack from 'webpack';

// Exports
export default (function VaranResponsiveLoaderSourceOnlyLoader(content: string) {
  const query = this.resourceQuery ? loaderUtils.parseQuery(this.resourceQuery) : {};

  // Enable?
  if (query.srcOnly) {
    const matches = content.match(/,src:(.+?"),/g);
    if (matches && matches.length > 0) {
      const src = matches[0].substr(5, matches[0].length - 6);
      return `module.exports = ${src};`;
    }
  }

  return content;
} as webpack.loader.Loader);
