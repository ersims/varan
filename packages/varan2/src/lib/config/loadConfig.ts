import { VaranConfiguration } from '../../types/VaranConfiguration';
import { VaranConfigurationFactory } from '../../types/VaranConfigurationFactory';

// Exports

export const loadConfig = async (file: string): Promise<VaranConfiguration | VaranConfigurationFactory | null> =>
  (await import(file))?.default || null;
