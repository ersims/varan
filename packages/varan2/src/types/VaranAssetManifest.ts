// Exports
export interface VaranAssetManifest {
  [source: string]: {
    sri: string | null;
    name: string;
    size: number;
    gzip: { name: string; size: number } | null;
    brotli: { name: string; size: number } | null;
  };
}
