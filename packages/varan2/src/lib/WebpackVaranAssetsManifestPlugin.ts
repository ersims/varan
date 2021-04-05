import webpack, { Compilation, Compiler } from 'webpack';
import path from 'path';
import { createHash } from 'crypto';
import { VaranAssetManifest } from '../types/VaranAssetManifest';

// Init
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
export class WebpackVaranAssetsManifestPlugin {
  protected readonly options = {
    integrityHashes: ['SHA512'],
  };
  apply(compiler: Compiler) {
    const hookOptions = {
      name: 'WebpackVaranAssetsManifestPlugin',
      stage: Infinity,
    };

    // Add hook
    compiler.hooks.thisCompilation.tap(hookOptions, (compilation: Compilation) => {
      compilation.hooks.processAssets.tap(hookOptions, () => {
        const manifest = this.createManifest(compilation);
        if (manifest) {
          const output = Buffer.from(JSON.stringify(manifest, null, 2));
          compilation.emitAsset('varan.manifest.json', new webpack.sources.RawSource(output));
        }
      });
    });
  }
  // eslint-disable-next-line class-methods-use-this
  createManifest(compilation: Compilation): VaranAssetManifest | null {
    const ignoreExtension = ['.br', '.gz', '.license', '.map'];
    // Fetch new stats as previous stats is not sufficient
    const stats = compilation.getStats().toJson({
      all: false,
      assets: true,
      cachedAssets: true,
    });

    // Add missing assets
    if (stats.assets) {
      return (
        stats.assets
          .filter((asset) => {
            // Ignore HMR files
            if (!/^(?!.*(\.hot-update\.)).*/.test(asset.name)) return false;

            // Ignore based on file extension
            return !ignoreExtension.includes(path.extname(asset.name).toLocaleLowerCase());
          })
          // Add to manifest
          .reduce<VaranAssetManifest>((manifest, asset) => {
            const gzipName = `${asset.name}.gz`;
            const brotliName = `${asset.name}.br`;
            // eslint-disable-next-line no-param-reassign
            manifest[asset.name] = {
              name: asset.name,
              size: asset.size,
              gzip: compilation.assets[gzipName]
                ? {
                    name: gzipName,
                    size: compilation.assets[gzipName].size(),
                  }
                : null,
              brotli: compilation.assets[brotliName]
                ? {
                    name: brotliName,
                    size: compilation.assets[brotliName].size(),
                  }
                : null,
              integrity: getSRI(
                this.options.integrityHashes || [],
                compilation.assets[asset.name].source().toString('utf-8'),
              ),
            };
            return manifest;
          }, {})
      );
    }
    return null;
  }
}
