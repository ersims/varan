import execa, { ExecaChildProcess } from 'execa';
import chalk from 'chalk';
import debounce from 'lodash.debounce';
import { relative } from 'path';
import { emojis } from './emojis';
import { resolveAppRelativePath } from './resolveAppRelativePath';

// Types
export type ServerChildProcessManager = {
  isRestarting: boolean;
  logsEnabled: boolean;
  enableLogs: () => void;
  restart: () => Promise<void>;
  childProcess: ExecaChildProcess;
};

// Exports
export const runServer = (
  script: string,
  nodeOptions?: execa.NodeOptions['nodeOptions'],
): ServerChildProcessManager => {
  const start = () => {
    try {
      return execa.node(script, [], { nodeOptions });
    } catch (err) {
      console.error(err);
      throw err;
    }
  };
  const restart = debounce(async (server: ServerChildProcessManager) => {
    try {
      if (!server.isRestarting) {
        // eslint-disable-next-line no-param-reassign
        server.isRestarting = true;
        // Shutdown first
        await new Promise((resolve) => {
          server.childProcess.kill('SIGTERM', { forceKillAfterTimeout: 5000 });
          server.childProcess.on('close', resolve);
        });

        // Start child process again
        // eslint-disable-next-line no-param-reassign
        server.childProcess = start();
        if (server.logsEnabled) {
          // eslint-disable-next-line no-param-reassign
          server.logsEnabled = false;
          server.enableLogs();
        }
        // eslint-disable-next-line no-param-reassign
        server.isRestarting = false;
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  }, 100);
  const messageFormatter = (msg: string) =>
    `${chalk.cyan(`${relative(resolveAppRelativePath('.'), script)} ${emojis.speechBalloon}:`)} ${msg}`;

  // Attach function to enable logs
  const server: ServerChildProcessManager = {
    isRestarting: false,
    logsEnabled: false,
    enableLogs() {
      if (!this.logsEnabled) {
        // Pass logging through
        if (this.childProcess.stdout) {
          this.childProcess.stdout.on('data', (data) => console.log(messageFormatter(data.toString())));
        }
        if (this.childProcess.stderr) {
          this.childProcess.stderr.on('data', (data) => console.error(messageFormatter(data.toString())));
        }
        this.logsEnabled = true;
      }
    },
    async restart() {
      return restart(this);
    },
    childProcess: start(),
  };
  return server;
};
