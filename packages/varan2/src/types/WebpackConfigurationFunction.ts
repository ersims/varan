import { Configuration } from 'webpack';

// Types
type WebpackEnvironment = Record<string, unknown> & { production?: boolean };
type WebpackArguments = Record<string, unknown> & Pick<Configuration, 'mode' | 'target'>;

// Exports
export type WebpackConfigurationFunction = (env: WebpackEnvironment, argv: WebpackArguments) => Configuration;
