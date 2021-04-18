import { Configuration } from 'webpack';

// Exports
export type WebpackArguments = Record<string, unknown> & Pick<Configuration, 'mode' | 'target'>;
