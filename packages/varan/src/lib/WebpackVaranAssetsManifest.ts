import { Compiler, compilation } from 'webpack';
import path from 'path';
import { createHash } from 'crypto';
import WebpackAssetsManifest from 'webpack-assets-manifest';
import { RawSource } from 'webpack-sources';

// Helpers
function getSRI(hashes: readonly string[], content: string) {
  return hashes
    .map((hash) => {
      const integrity = createHash(hash).update(content, 'utf8').digest('base64');
      return `${hash}-${integrity}`;
    })
    .join(' ')
    .trim();
}

// Exports
export default class WebpackVaranAssetsManifest extends WebpackAssetsManifest {
  /**
   * Module augmentation
   */
  public assetNames!: Map<string, string>;
  public options!: WebpackAssetsManifest.Options;
  public currentAsset!: any | null;
  public getManifestPath!: (compilerCompilation: compilation.Compilation, filename: string) => string;
  public inDevServer!: () => boolean;

  /**
   * Overrides
   */
  public apply(compiler: Compiler) {
    // Add hook for missing assets
    compiler.hooks.emit.tapAsync(
      {
        context: false,
        name: 'WebpackVaranAssetsManifest',
        stage: Infinity,
      } as any,
      this.varanExtendedEmit.bind(this),
    );

    return super.apply(compiler);
  }
  public varanExtendedEmit(compilerCompilation: compilation.Compilation, callback: Function) {
    const ignoreExtension = ['.br', '.gz', '.license', '.map'];
    // Fetch new stats as previous stats is not sufficient
    const stats = compilerCompilation.getStats().toJson({
      all: false,
      assets: true,
      cachedAssets: true,
    });

    // Add missing assets
    if (stats.assets) {
      stats.assets
        .filter((asset) => {
          // Ignore self
          if (asset.name === this.options.output) return false;

          // Ignore HMR files
          if (!/^(?!.*(\.hot-update\.)).*/.test(asset.name)) return false;

          // Ignore already processed files
          if (this.assetNames.has(asset.name)) return false;

          // Ignore based on file extension
          return !ignoreExtension.includes(path.extname(asset.name).toLocaleLowerCase());
        })
        // Add to manifest
        .forEach((asset) => {
          this.currentAsset = compilerCompilation.assets[asset.name];

          // `integrity` may have already been set by another plugin, like `webpack-subresource-integrity`.
          // Only generate the SRI hash if `integrity` is not found.
          if (
            this.options.integrity &&
            this.currentAsset &&
            this.options.integrityPropertyName &&
            !this.currentAsset[this.options.integrityPropertyName]
          ) {
            this.currentAsset[this.options.integrityPropertyName] = getSRI(
              this.options.integrityHashes || [],
              this.currentAsset.source(),
            );
          }
          this.set(asset.name, asset.name);
          this.currentAsset = null;
        });
    }
    const output = this.getManifestPath(
      compilerCompilation,
      this.inDevServer()
        ? path.basename(this.getOutputPath())
        : path.relative(compilerCompilation.compiler.outputPath, this.getOutputPath()),
    );

    // eslint-disable-next-line no-param-reassign
    compilerCompilation.assets[output] = new RawSource(this.toString());
    callback();
  }
}
