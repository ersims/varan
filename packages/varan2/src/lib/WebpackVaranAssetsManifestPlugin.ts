import webpack, { Compilation, Compiler } from 'webpack';
import { VaranAssetManifest } from '../types/VaranAssetManifest';

// Exports
export class WebpackVaranAssetsManifestPlugin {
  // eslint-disable-next-line class-methods-use-this
  apply(compiler: Compiler) {
    const hookOptions = {
      name: 'WebpackVaranAssetsManifestPlugin',
      stage: Infinity,
    };

    // Create manifest
    const manifest: VaranAssetManifest = {
      'asd.js': {
        sri: 'asd',
        name: 'asd.123456.js',
        size: Date.now() / 1000000,
        gzip: null,
        brotli: null,
      },
      'asd2.js': {
        sri: 'asd2',
        name: 'asd2.ffccdd.js',
        size: Date.now() / 900000,
        gzip: null,
        brotli: null,
      },
    };
    // const output = JSON.stringify(manifest, null, 2);
    const output = Buffer.from(JSON.stringify(manifest, null, 2));

    // Add hook
    compiler.hooks.thisCompilation.tap(hookOptions, (compilation: Compilation) => {
      compilation.hooks.processAssets.tap(hookOptions, () => {
        compilation.emitAsset('varan.manifest.json', new webpack.sources.RawSource(output));
      });
    });
  }
}
