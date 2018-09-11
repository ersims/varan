// Type definitions for webpack-stats-plugin 0.2.1
// TypeScript Version: 3.0.3

declare module 'webpack-stats-plugin' {
  import webpack from 'webpack';
  export interface StatsWriterManifest {
    assetsByChunkName?: {
      [chunkName: string]: string | string[];
    };
    assets?: ReadonlyArray<{
      name: string;
      size: number;
      chunks: number[];
      chunkNames: string[];
    }>;
  }
  export class StatsWriterPlugin extends webpack.Plugin {
    public opts: {
      filename: string;
    };
  }
}
