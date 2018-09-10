// Exports
export default class BuildError extends Error {
  public errors: string[] = [];
  public warnings: string[] = [];
}
