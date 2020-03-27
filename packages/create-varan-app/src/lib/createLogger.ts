/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */

// Types
interface Options {
  silent: boolean;
}

// Exports
export default function createLogger(options: Partial<Options> = {}) {
  const logFn = console.log;
  return {
    info: options.silent
      ? (...args: string[]) => {
          // Empty
        }
      : logFn,
    warn: options.silent
      ? (...args: string[]) => {
          // Empty
        }
      : logFn,
    error: logFn,
  };
}
