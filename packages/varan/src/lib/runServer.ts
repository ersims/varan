import { defaults } from 'lodash';
import execa from 'execa';

// Types
export interface Options {
  entry: string;
  args: string[];
  waitForPromise: null | Promise<any>;
}
// Init
const getOpts = (options: Partial<Options> & { entry: Options['entry'] }): Options =>
  defaults({}, options, {
    args: [],
    waitForPromise: null,
  });

// Exports
export default async function runServer(options: Partial<Options> & { entry: Options['entry'] }) {
  const opts = getOpts(options);
  const launchArgs = opts.args;

  // Create builder promise
  return new Promise(async (resolve, reject) => {
    // Pass in arguments to child
    const debugArgs = [
      ...new Set(
        launchArgs
          .concat(process.env.NODE_DEBUG_OPTION || [])
          .filter(arg => arg.startsWith('--inspect') || arg.startsWith('--debug')),
      ),
    ];
    const debugPort = debugArgs.length > 0 ? process.debugPort + 1 : process.debugPort;
    const execArgs = launchArgs
      .filter(arg => !debugArgs.includes(arg))
      .concat(debugArgs.map(arg => arg.replace(process.debugPort.toString(), debugPort.toString())));
    try {
      if (opts.waitForPromise) await opts.waitForPromise;
      const server = execa('node', execArgs.concat(opts.entry));
      resolve({ server });
    } catch (err) {
      reject(err);
    }
  });
}
