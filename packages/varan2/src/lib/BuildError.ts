import { StatsCompilation } from 'webpack';

// Exports
export default class BuildError extends Error {
  public errors: StatsCompilation['errors'];
  public warnings: StatsCompilation['warnings'];
}
