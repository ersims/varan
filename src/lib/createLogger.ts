// tslint:disable no-console

// Types
interface Options {
  silent: boolean;
}

// Exports
export default function createLogger(options: Partial<Options> = {}) {
  return {
    info: options.silent ? (...args: string[]) => {} : console.log,
    warn: options.silent ? (...args: string[]) => {} : console.log,
    error: console.log,
  };
}
