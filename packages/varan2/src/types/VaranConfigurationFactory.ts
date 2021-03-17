import { VaranConfiguration } from './VaranConfiguration';
import { VaranCliOptions } from './VaranCliOptions';

// Types
interface VaranConfigurationFactoryOptions extends VaranCliOptions {}

// Exports
export type VaranConfigurationFactory = (
  options: VaranConfigurationFactoryOptions,
) => VaranConfiguration | Promise<VaranConfiguration>;
