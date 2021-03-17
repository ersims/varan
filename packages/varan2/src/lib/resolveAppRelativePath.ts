import { resolve } from 'path';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { name } = require('../../package.json');

// Init
const varanLocalPath = `${name}/`;

// Export
export const resolveAppRelativePath = (appPath: string, appDir: string = process.cwd()): string =>
  appPath.startsWith(varanLocalPath)
    ? resolve(__dirname, '..', '..', appPath.substr(varanLocalPath.length))
    : resolve(appDir, appPath);
