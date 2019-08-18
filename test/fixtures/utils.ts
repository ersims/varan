import fs from 'fs';
import path from 'path';

// Exports
export const listFiles = (p: string): Array<ReturnType<typeof fs.statSync> & { name: string }> =>
  fs
    .readdirSync(p)
    .sort((a, b) => a.localeCompare(b))
    .map(f => Object.assign(fs.statSync(path.resolve(p, f)), { name: f }));
