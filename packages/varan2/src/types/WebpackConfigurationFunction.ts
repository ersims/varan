import { Configuration } from 'webpack';

// Types
export type WebpackEnvironment = Record<string, unknown> & { production?: boolean };
export type WebpackArguments = Record<string, unknown> & Pick<Configuration, 'mode' | 'target'>;

// Exports
export type WebpackConfigurationFunction = (env: WebpackEnvironment, argv: WebpackArguments) => Configuration;
