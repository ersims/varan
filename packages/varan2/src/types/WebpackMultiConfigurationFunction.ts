import { Configuration } from 'webpack';
import { WebpackEnvironment } from './WebpackEnvironment';
import { WebpackArguments } from './WebpackArguments';

// Exports
export type WebpackMultiConfigurationFunction = (env: WebpackEnvironment, argv: WebpackArguments) => Configuration[];
