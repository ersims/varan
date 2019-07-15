import { StatsWriterManifest } from 'webpack-stats-plugin';
import path from 'path';
import fs from 'fs-extra';

// Types
export interface BuildStats {
  assets: {
    [assetName: string]: {
      name: string;
      chunks: BuildStats['chunks'];
      size: number;
      gzip?: number;
      brotli?: number;
      [fileType: string]: number | undefined | string | BuildStats['chunks'];
    };
  };
  chunks: {
    [chunkName: string]: {
      name: string;
      assets: BuildStats['assets'];
      readonly size: number;
      readonly gzip?: number;
      readonly brotli?: number;
    };
  };
}

// Init
const additionalExtensions = {
  gzip: '.gz',
  brotli: '.br',
};
const ignoredExtensions = ['.map'];

// Exports
export default async function getBuildStatsFromManifest(
  searchPath: string,
  manifest: StatsWriterManifest,
): Promise<BuildStats | null> {
  try {
    // Locate all files
    const statistics = (manifest.assets || [])
      .filter(asset => !ignoredExtensions.includes(path.extname(asset.name)))
      .reduce<BuildStats>(
        (acc, asset) => {
          acc.assets[asset.name] = {
            name: asset.name,
            size: asset.size,
            chunks: {},
          };
          asset.chunkNames.forEach(chunkName => {
            if (!acc.chunks[chunkName]) {
              acc.chunks[chunkName] = {
                name: chunkName,
                assets: {},
                get size() {
                  return Object.values(this.assets).reduce((sum, curAsset) => {
                    return curAsset.size ? sum + curAsset.size : sum;
                  }, 0);
                },
                get gzip() {
                  return Object.values(this.assets).reduce((sum: number | undefined, curAsset) => {
                    return curAsset.gzip ? (sum || 0) + curAsset.gzip : sum;
                  }, undefined);
                },
                get brotli() {
                  return Object.values(this.assets).reduce((sum: number | undefined, curAsset) => {
                    return curAsset.brotli ? (sum || 0) + curAsset.brotli : sum;
                  }, undefined);
                },
              };
            }
            acc.chunks[chunkName].assets[asset.name] = acc.assets[asset.name];
            acc.assets[asset.name].chunks[chunkName] = acc.chunks[chunkName];
          });
          return acc;
        },
        { chunks: {}, assets: {} },
      );

    // Enrich files with compressed version details
    const files = Object.values(statistics.assets);
    const extensions = Object.entries(additionalExtensions);

    // TODO: Consider rewriting to optimize for parallel lookup
    for (const file of files) {
      for (const [extName, extValue] of extensions) {
        try {
          // eslint-disable-next-line no-await-in-loop
          const extFile = await fs.stat(path.resolve(searchPath, file.name + extValue));
          file[extName] = extFile.size;
        } catch (err) {
          // Empty
        }
      }
    }

    // Rewrite to correct format
    return statistics;
  } catch (err) {
    return null;
  }
}
