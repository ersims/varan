import chalk from 'chalk';
import ora from 'ora';

// Exports
export const watcherRecompileSpinner = (text: string) =>
  ora({
    spinner: 'hearts',
    text: chalk.bold(text),
    discardStdin: false,
  });
