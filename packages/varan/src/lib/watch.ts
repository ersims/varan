import { defaults, get } from 'lodash';
import path from 'path';
import detectPort from 'detect-port-alt';
import Listr, { ListrOptions } from 'listr';
import chalk from 'chalk';
import webpack from 'webpack';
import { ChildProcess } from 'child_process';
import waitOn from 'wait-on';
import WebpackDevServer from 'webpack-dev-server';
import emojis from './emojis';
import getConfigs, { ValidConfiguration } from './getConfigs';
import buildAndRunDevServer from './buildAndRunDevServer';
import buildServer from './buildServer';
import getCompilerStats, { CompilerStats } from './getCompilerStats';
import runServer from './runServer';
import createServerConfig from '../webpack/createServerConfig';
import createClientConfig from '../webpack/createClientConfig';

// Types
interface TaskListContext {
  client?: {
    compiler: webpack.Compiler;
    runner: WebpackDevServer;
    warnings: string[];
    errors: string[];
    stats: webpack.Stats;
  };
  server?: {
    watcher: webpack.Compiler.Watching;
    runner: ChildProcess;
    compiler: webpack.Compiler;
    warnings: string[];
    errors: string[];
    stats: webpack.Stats;
  };
  totals: CompilerStats;
}
export interface Options {
  configs: ValidConfiguration[];
  verbose: boolean;
  devServerProtocol: 'http' | 'https';
  devServerHost: string;
  devServerPort: number;
  env: 'development' | 'production';
  args: string[];
  appDir: string;
  openBrowser: boolean;
  waitForServer: boolean;
  inputFileSystem?: webpack.Compiler['inputFileSystem'];
  outputFileSystem?: webpack.Compiler['outputFileSystem'];
  [webpackKey: string]: any;
}
export interface VaranWatcher {
  close: () => Promise<any>;
  totals: CompilerStats;
  server: {
    close: () => Promise<any>;
    watcher: webpack.Compiler.Watching;
    compiler: webpack.Compiler;
    warnings: string[];
    runner: ChildProcess;
  } | null;
  client: {
    close: () => Promise<any>;
    runner: WebpackDevServer;
    compiler: webpack.Compiler;
    warnings: string[];
  } | null;
}

// Init
const getOpts = (options: Partial<Options>): Options =>
  defaults({}, options, {
    verbose: false,
    configs: [createServerConfig, createClientConfig],
    devServerProtocol: 'http',
    devServerHost: process.env.HOST || 'localhost',
    devServerPort: process.env.DEV_PORT ? parseInt(process.env.DEV_PORT, 10) : 3000,
    serverHost: process.env.HOST || 'localhost',
    serverPort: process.env.PORT ? parseInt(process.env.PORT, 10) : undefined,
    env: 'development',
    appDir: process.cwd(),
    args: process.argv.includes('--') ? process.argv.slice(process.argv.indexOf('--') + 1) : [],
    openBrowser: false,
    waitForServer: true,
  });

// Exports
export default async function watch(options: Partial<Options>): Promise<VaranWatcher> {
  const opts = getOpts(options);

  // Load configs
  if (opts.configs.length > 2) {
    throw new Error('Too many config files provided. Maximum two config files are supported in `watch` mode.');
  }
  const configs = getConfigs(opts.configs, opts);
  const clientConfig = configs.find(c => !c.target || c.target === 'web');
  const serverConfig = configs.find(c => c.target === 'node');

  // Check if config is valid
  if (configs.length >= 2 && (!clientConfig || !serverConfig)) {
    throw new Error('One or more invalid config files provided. Maximum of one config file per target is supported.');
  }
  const taskOptions: ListrOptions & { showSubtasks: boolean } = {
    showSubtasks: true,
    renderer: opts.verbose ? 'default' : 'silent',
    nonTTYRenderer: opts.verbose ? 'verbose' : 'silent',
  };
  const tasks = new Listr(
    [
      {
        title: 'Prepare',
        task: async () => {
          // Prepare
          opts.devServerPort = await detectPort(opts.devServerPort, opts.devServerHost);
          opts.serverPort = await detectPort(
            (opts.serverPort && opts.serverPort !== opts.devServerPort && opts.serverPort) || opts.devServerPort + 1,
            opts.serverHost,
          );
          process.env.HOST = opts.serverHost;
          opts.serverHost = process.env.HOST;
          opts.devServerWSPort = await detectPort(opts.devServerPort + 10, opts.devServerHost);
          process.env.PORT = opts.serverPort.toString();
          process.env.BABEL_ENV = opts.env;
          return `${chalk.green(emojis.success)} Preparations completed successfully`;
        },
      },
      {
        title: 'Build',
        task: () =>
          new Listr(
            [
              {
                title: 'Build and start client development server',
                enabled: () => !!clientConfig,
                task: async ctx => {
                  opts.devServerProxy = !!serverConfig;
                  const devServerOpts = {
                    ...opts,
                    waitForPromise: new Promise((resolve, reject) => {
                      if (opts.waitForServer && !!serverConfig) {
                        waitOn(
                          {
                            resources: [`tcp:${opts.serverHost}:${opts.serverPort}`],
                          },
                          err => {
                            if (err) return reject(err);
                            return resolve();
                          },
                        );
                      } else resolve();
                    }),
                  };
                  ctx.client = await buildAndRunDevServer(
                    clientConfig,
                    opts.devServerHost,
                    opts.devServerPort,
                    devServerOpts,
                  );
                  return `${chalk.green(emojis.success)} Development server built successfully!`;
                },
              },
              {
                title: 'Build server',
                enabled: () => !!serverConfig,
                task: async ctx => {
                  const serverOpts = { ...opts };
                  ctx.server = await buildServer(serverConfig, serverOpts);
                  return `${chalk.green(emojis.success)} Server built successfully!`;
                },
              },
            ],
            {
              showSubtasks: true,
              concurrent: true,
              renderer: opts.silent ? 'silent' : 'default',
            } as ListrOptions,
          ),
      },
      {
        title: 'Calculate statistics',
        task: (ctx: TaskListContext) => {
          ctx.totals = getCompilerStats([ctx.server && ctx.server.stats, ctx.client && ctx.client.stats].filter(
            Boolean,
          ) as webpack.Stats[]);
          return `${chalk.green(emojis.success)} Build statistics calculated successfully`;
        },
      },
      {
        title: 'Start server',
        enabled: (ctx: TaskListContext) => !!ctx.server,
        task: async (ctx: TaskListContext) => {
          const rootPath = get(ctx, 'server.compiler.options.output.path', null);
          const entryFile = get(ctx, 'server.compiler.options.output.filename', null);
          if (rootPath && entryFile) {
            const serverOpts = { ...opts, entry: path.resolve(rootPath, entryFile) };
            const { server } = (await runServer(serverOpts)) as { server: ChildProcess };
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            ctx.server!.runner = server;
          }
          return `${chalk.green(emojis.success)} Server started successfully`;
        },
      },
    ],
    taskOptions,
  );

  /**
   * Watch project
   */
  // Set up the task queue
  const result: TaskListContext = await tasks.run();

  // Create watching helpers
  const clientWatcher = result.client
    ? {
        warnings: result.client.warnings,
        compiler: result.client.compiler,
        runner: result.client.runner,
        async close() {
          return Promise.all([
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            result.client && result.client.runner && new Promise(resolve => result!.client!.runner.close(resolve)),
          ].filter(Boolean) as Promise<any>[]) as Promise<any>;
        },
      }
    : null;
  const serverWatcher = result.server
    ? {
        warnings: result.server.warnings,
        compiler: result.server.compiler,
        runner: result.server.runner,
        watcher: result.server.watcher,
        async close() {
          return Promise.all([
            new Promise(resolve => result.server && result.server.watcher.close(resolve)),
            new Promise(resolve => {
              if (result.server) {
                result.server.runner.once('close', resolve);
                result.server.runner.kill();
              }
            }),
          ]) as Promise<any>;
        },
      }
    : null;
  const close = async () =>
    Promise.all([serverWatcher && serverWatcher.close(), clientWatcher && clientWatcher.close()].filter(Boolean));
  return { close, client: clientWatcher, server: serverWatcher, totals: result.totals };
}
