import chalk from 'chalk';
import fileSize from 'filesize';
import { table } from 'table';
import { VaranAssetManifest } from '../types/VaranAssetManifest';

// Types
interface CreateManifestComparisonTableOptions {
  currentManifest: VaranAssetManifest | null;
  lastManifest: VaranAssetManifest | null;
  warnSize: number | null;
}

interface CurrentAssetInfo {
  name: string;
  current: {
    size: number;
    gzip: number | null;
    brotli: number | null;
  };
  last: {
    size: number;
    gzip: number | null;
    brotli: number | null;
  } | null;
}

interface DeletedAssetInfo {
  name: string;
  size: number;
  gzip: number | null;
  brotli: number | null;
}

/**
 * [assetname, asset size (change), gzip size (change), botli size (change)
 */
type AssetTableRow = [string, string, string, string];

// Init
const warn = (v: string) => chalk.yellow(v);
const bad = (v: string) => chalk.red(v);
const getPrintableFileSize = (
  current: number | null,
  { last, warnSize }: { last?: number | null; warnSize?: number | null },
) => {
  if (!current) return ' ';
  let size = warnSize && current > warnSize ? warn(fileSize(current)) : fileSize(current);
  const diff = last ? current - last : 0;
  if (Math.abs(diff) < 1) return size;
  size += ` ${diff > 0 ? bad(`+${fileSize(diff)}`) : chalk.green(`-${fileSize(diff)}`)}`;
  return size;
};
const getTotalsFromManifest = (manifest: VaranAssetManifest) =>
  Object.values(manifest).reduce(
    (acc, cur) => {
      acc.size += cur.size;
      if (cur.gzip) {
        acc.gzip += cur.gzip.size;
      }
      if (cur.brotli) {
        acc.brotli += cur.brotli.size;
      }
      return acc;
    },
    { size: 0, gzip: 0, brotli: 0 },
  );

// Exports
export const createManifestComparisonTable = ({
  warnSize,
  currentManifest,
  lastManifest,
}: CreateManifestComparisonTableOptions): string => {
  // All current assets
  const deletedAssets: Record<string, DeletedAssetInfo> = {};
  const assets = currentManifest
    ? Object.values(currentManifest).reduce<Record<string, CurrentAssetInfo>>((acc, { name, size, gzip, brotli }) => {
        acc[name] = {
          name,
          current: { size, gzip: gzip?.size || null, brotli: brotli?.size || null },
          last: null,
        };
        return acc;
      }, {})
    : {};

  // Check for previous manifest and add it where files matches - or add to deleted manifest
  if (lastManifest) {
    Object.values(lastManifest).forEach(({ name, size, gzip, brotli }) => {
      if (assets[name]) {
        assets[name].last = { size, gzip: gzip?.size || null, brotli: brotli?.size || null };
      } else {
        deletedAssets[name] = {
          name,
          size,
          gzip: gzip?.size || null,
          brotli: brotli?.size || null,
        };
      }
    });
  }

  // Create table rows
  const assetTableRows = Object.values(assets)
    .sort((a, b) => (b.current?.size || b.last!.size) - (a.current?.size || a.last!.size))
    .map<AssetTableRow>(({ name, current, last }) => [
      warnSize && current.size > warnSize ? warn(name) : name,
      getPrintableFileSize(current.size, { last: last?.size, warnSize }),
      getPrintableFileSize(current.gzip, { last: last?.gzip, warnSize }),
      getPrintableFileSize(current.brotli, { last: last?.brotli, warnSize }),
    ]);

  // Calculate sum rows
  const currentSums = currentManifest ? getTotalsFromManifest(currentManifest) : null;
  const lastSums = lastManifest ? getTotalsFromManifest(lastManifest) : null;

  const sumRow = currentSums
    ? [
        'SUM',
        getPrintableFileSize(currentSums.size, { last: lastSums?.size }),
        getPrintableFileSize(currentSums.gzip, { last: lastSums?.gzip }),
        getPrintableFileSize(currentSums.brotli, { last: lastSums?.brotli }),
      ].map((sum) => chalk.bold(sum))
    : null;

  // Create table rows
  const tableRows: AssetTableRow[] = [['Asset', 'Size', 'Gzip', 'Brotli'], ...assetTableRows, sumRow].filter(
    (row): row is AssetTableRow => !!row,
  );

  // Create table
  return table(tableRows, {
    drawHorizontalLine: (index, size) => index === 0 || index === 1 || index === size - 1 || index === size,
  });
};
