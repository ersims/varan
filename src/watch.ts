// Dependencies
import { defaults, get } from 'lodash';
import path from 'path';
import detectPort from 'detect-port-alt';
import createLogger from './lib/createLogger';
import getConfigs, { ValidConfiguration } from './lib/getConfigs';
import Listr, { ListrOptions } from 'listr';
import ora from 'ora';
import chalk from 'chalk';
import webpack from 'webpack';
import { format } from 'url';
import WebpackServe from 'webpack-serve';
import { ChildProcess } from 'child_process';
import waitOn from 'wait-on';
import emojis from './lib/emojis';
import buildAndRunDevServer from './lib/buildAndRunDevServer';
import buildServer from './lib/buildServer';
import getCompilerStats, { CompilerStats } from './lib/getCompilerStats';
import runServer from './lib/runServer';

// tslint:disable-next-line no-var-requires
const pkg = require('../package.json');

// Types
interface TaskListContext {
  client?: {
    compiler: webpack.Compiler;
    runner: WebpackServe.Result;
    app: { stop: () => Promise<void> } | null;
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
  devServerProtocol: 'http' | 'https';
  devServerHost: string;
  devServerPort: number;
  silent: boolean;
  env: 'development' | 'production';
  args: string[];
  appDir: string;
  openBrowser: boolean;
  waitForServer: boolean;
  inputFileSystem?: webpack.Compiler['inputFileSystem'];
  outputFileSystem?: webpack.Compiler['outputFileSystem'];
  [webpackKey: string]: any;
}

// Init
const getOpts = (options: Partial<Options>): Options =>
  defaults({}, options, {
    configs: [path.resolve(__dirname, '../webpack/server'), path.resolve(__dirname, '../webpack/client')],
    devServerProtocol: 'http',
    devServerHost: process.env.HOST || 'localhost',
    devServerPort: process.env.DEV_PORT ? parseInt(process.env.DEV_PORT, 10) : 3000,
    serverHost: process.env.HOST || 'localhost',
    serverPort: process.env.PORT ? parseInt(process.env.PORT, 10) : undefined,
    silent: false,
    env: 'development',
    appDir: process.cwd(),
    args: process.argv.includes('--') ? process.argv.slice(process.argv.indexOf('--') + 1) : [],
    openBrowser: false,
    waitForServer: true,
  });

// Exports
export default async function watch(options: Partial<Options>) {
  const opts = getOpts(options);
  const log = createLogger(opts);

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
          opts.serverHost = process.env.HOST = opts.serverHost;
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
                  const devServerOpts = Object.assign({}, opts, {
                    waitForPromise: new Promise((resolve, reject) => {
                      if (opts.waitForServer && !!serverConfig) {
                        waitOn(
                          {
                            resources: [`tcp:${opts.serverHost}:${opts.serverPort}`],
                          },
                          err => {
                            if (err) return reject(err);
                            resolve();
                          },
                        );
                      } else resolve();
                    }),
                  });
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
                  const serverOpts = Object.assign({}, opts);
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
            const serverOpts = Object.assign({}, opts, { entry: path.resolve(rootPath, entryFile) });
            const { server } = (await runServer(serverOpts)) as { server: ChildProcess };
            ctx.server!.runner = server;
          }
          return `${chalk.green(emojis.success)} Server started successfully`;
        },
      },
    ],
    {
      showSubtasks: true,
      renderer: opts.silent ? 'silent' : 'default',
    } as ListrOptions,
  );

  /**
   * Watch project
   */
  log.info();
  log.info(
    `  Watching project with ${chalk.cyan(configs.length.toString())} configs in ${chalk.cyan(
      opts.env,
    )} mode using ${chalk.cyan(pkg.name)} ${chalk.green(emojis.robot)}`,
  );
  log.info();

  // Set up the task queue
  const result: TaskListContext = await tasks.run();
  const hasWarnings =
    (result.client && result.client.warnings.length > 0) || (result.server && result.server.warnings.length > 0);

  // Fetch statistics
  log.info();
  log.info(
    `  ${chalk.green(emojis.rocket)} Success! ${
      hasWarnings ? `${chalk.yellow('With warnings. See below for more information!')} ` : ''
    }${chalk.green(emojis.rocket)}`,
  );
  log.info(
    `  Compiled ${chalk.cyan(result.totals.numberOfConfigs.toString())} configs in ${chalk.cyan(
      `${result.totals.timings.duration}ms`,
    )}`,
  );
  if (result.server)
    log.info(`  Server compiled in ${chalk.cyan(`${result.totals.timings.perCompiler[0].duration}ms`)}`);
  if (result.client)
    log.info(
      `  Client compiled in ${chalk.cyan(`${result.totals.timings.perCompiler[result.server ? 1 : 0].duration}ms`)}`,
    );
  log.info();
  log.info();

  // Integrate with server
  if (result.server) {
    const serverCompileSpinner = ora({
      spinner: 'circleHalves',
      text: chalk.bold('Server recompiling'),
    });

    // Begin recompile
    result.server.compiler.hooks.invalid.tap(pkg.name, () => {
      serverCompileSpinner.start();
    });
    result.server.compiler.hooks.done.tap(pkg.name, stats => {
      const compileStats = getCompilerStats(stats);
      serverCompileSpinner.succeed(
        chalk.bold(`Server recompiled in ${chalk.cyan(`${compileStats.timings.duration}ms`)}`),
      );
    });

    // Pass logging through
    result.server.runner.stdout.on(
      'data',
      data => !data.toString().startsWith('[HMR]') && console.log(data.toString()), // tslint:disable-line no-console
    );
    result.server.runner.stderr.on('data', data => console.error(data.toString())); // tslint:disable-line no-console
  }

  // Integrate with client
  if (result.client) {
    const clientCompileSpinner = ora({
      spinner: 'hearts',
      text: chalk.bold('Client recompiling'),
    });

    // Begin recompile
    result.client.compiler.hooks.invalid.tap(pkg.name, () => {
      clientCompileSpinner.start();
    });
    result.client.compiler.hooks.done.tap(pkg.name, stats => {
      const compileStats = getCompilerStats(stats);
      clientCompileSpinner.succeed(
        chalk.bold(`Client recompiled in ${chalk.cyan(`${compileStats.timings.duration}ms`)}`),
      );
    });

    const urlToClient = get(
      result,
      'client.compiler.options.output.publicPath',
      format({
        protocol: opts.devServerProtocol,
        hostname: ['0.0.0.0', '::'].includes(opts.devServerHost) ? 'localhost' : opts.devServerHost,
        port: opts.devServerPort,
        pathname: '/',
      }),
    );
    log.info(`  Development server is now ready and you can view your project in the browser`);
    log.info();
    log.info(
      `      ${chalk.cyan(emojis.pointRight)}  ${chalk.bold(chalk.cyan(urlToClient))}  ${chalk.cyan(emojis.pointLeft)}`,
    );
    log.info();
  }

  return {
    async close() {
      return Promise.all([this.server && this.server.close(), this.client && this.client.close()] as Promise<any>[]);
    },
    server: result.server
      ? {
          runner: result.server.runner,
          watcher: result.server.watcher,
          async close() {
            return Promise.all([
              new Promise(resolve => result.server!.watcher.close(resolve)),
              result.server!.runner.kill(),
            ]);
          },
        }
      : null,
    client: result.client
      ? {
          runner: result.client.runner,
          async close() {
            return Promise.all([result.client!.app && result.client!.app!.stop()].filter(Boolean) as Promise<any>[]);
          },
        }
      : null,
  };
}
