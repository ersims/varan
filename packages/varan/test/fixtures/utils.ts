import path from 'path';
import MemoryFileSystem from 'memory-fs';

// Init
const hasFile = (fs: MemoryFileSystem, p: string) => fs.existsSync(p);
const getFile = (fs: MemoryFileSystem, p: string) =>
  hasFile(fs, p) && {
    ...fs.statSync(p),
    size: fs.meta(p).byteLength,
    name: path.basename(p),
  };
const getFiles = (fs: MemoryFileSystem, p: string): Array<{ name: string; size: number; isFile: () => boolean }> =>
  fs
    .readdirSync(p)
    .map(f => getFile(fs, path.resolve(p, f)))
    .filter(Boolean)
    .sort((a, b) => (a as any).name.localeCompare((b as any).name)) as Array<{
    name: string;
    size: number;
    isFile: () => boolean;
  }>;
const getMatch = (fs: MemoryFileSystem, p: string, regex: RegExp) =>
  getFiles(fs, p).filter(f => !!f && regex.test(f.name));
const resolver = (...args: string[]) => (...p: string[]) =>
  path.resolve(...args, (p && p.length > 0 && p.join(path.sep)) || '');

// Exports
export { hasFile, getFile, getFiles, getMatch, resolver };
