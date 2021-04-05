# Varan

A webpack starter-kit for production ready webpack applications. Includes full support for server side rendered React applications out of the box.

Disclaimer: There will be breaking changes and outdated documentation during the pre-v1.0.0 cycles.

[![npm][npm-image]][npm-url]
[![CircleCI][circleci-image]][circleci-url]
[![Codecov branch][codecov-image]][codecov-url]
[![David][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![license][license-image]][license-url]

![varan terminal example](assets/varan.gif?raw=true 'varan terminal example')

## Documentation

- [Installation](#installation)
  - [Alternative 1: New Project](#installation-new-project)
  - [Alternative 2: Existing Project](#installation-existing-project)
- [Usage](#usage)
  - [Development](#usage-development)
  - [Production](#usage-production)
- [Customization and Setup](#customization)
  - [Hot Reloading](#customization-hotreload)
  - [CSS and SASS](#customization-css-and-sass)
  - [Images](#customization-images)
  - [Performance](#customization-performance)
    - [Fibers](#customization-performance-fibers)
  - [Polyfill and Browser Support](#customization-polyfill)
  - [Browserslist](#customization-browserslist)
  - [Customizing Webpack](#customization-webpack)
    - [Build-time Variables](#customization-build-variables)
    - [Progressive Web Apps](#customization-webpack-pwa)
    - [Static client side apps (create-react-app)](#customization-webpack-static)
  - [Use Your Own Webpack Configuration](#customization-use-own-webpack)
- [Troubleshooting](#troubleshooting)
  - [`varan watch` gives 404](#troubleshooting-watch-404)
  - [Syntax errors in dependencies](#troubleshooting-syntax-errors-dependencies)
- [API](#api)
  - [build([options])](#api-build)
  - [Default webpack configs](#api-default-webpack-configs)
- [License](#license)

<a id="installation"></a>

## Installation

<a id="installation-new-project"></a>

### Alternative 1: New project

The best way of creating a new varan project is to use the [create-varan-app][create-varan-app-url] script.
This will automatically set up a project using varan with all the bells and whistles.
It is very good starting point for modern web apps.

1. Create a new varan project

```bash
$ npx create-varan-app my-project
```

2. Profit. Do your magic.

<a id="installation-existing-project"></a>

### Alternative 2: Existing projects

1. Install `varan` in your project

```bash
$ npm i --save-dev varan
```

2. Add npm scripts in your `package.json` to support your workflow. This is usually enough for most projects:

```bash
  "scripts": {
    "build": "varan build",
    "build:analyze": "varan build --analyze",
    "start:watch": "varan watch -- --inspect"
  }
```

3. Optionally customize the webpack config to support your specific project.

At a minimum, make sure your entry files are explicitly defined in your own custom config, or matches the defaults of varan. See [customization](#customization) for more information.

<a id="usage"></a>

## Usage

```bash
$ varan

  Usage:  <command> [options]

  Options:

    -V, --version               output the version number
    -h, --help                  output usage information

  Commands:

    build [options] [files...]
    watch [options]

```

<a id="usage-development"></a>

### Development (using local installation and npm scripts)

Start the development server with hot reloading by running

```bash
npm run start:watch
```

<a id="usage-production"></a>

### Production (using local installation and npm scripts)

To create a minified and bundled production build, run

```bash
npm run build
```

To analyze the production build, run

```bash
npm run build:analyze
```

<a id="customization"></a>

## Customization and Setup

Varan provides sane defaults and should be a good starting point for most projects. You can find the default [client](/webpack/client.js) and [server](/webpack/server.js) config files under `varan/webpack`.

The most important option to set correctly is the entry points. Existing projects implementing varan might have to set a custom entry point for the client and/or the server using a [custom webpack config](#customization-webpack).
The default entry points in varan are as follows:

| Type   | Entry file relative to project root |
| ------ | ----------------------------------- |
| Client | `src/client/index`                  |
| Server | `src/server/bin/web`                |

<a id="customization-hotreload"></a>

### Hot Reloading

You can use [react-hot-loader](https://github.com/gaearon/react-hot-loader) to get hot reloading (of react components) in your project.
If you also use hooks you can install `@hot-loader/react-dom` and follow the [customizing webpack](#customization-webpack) chapter to add it to your webpack config.
No need to customize your webpack config.

Remember to follow all the steps as described in the link above and create a `.babelrc.js` file in your project with the `react-hot-loader/babel` babel plugin.

Example `.babelrc.js` file

```javascript
module.exports = {
  presets: ['varan'],
  plugins: ['react-hot-loader/babel'],
};
```

<a id="customization-css-and-sass"></a>

### CSS and SASS

Varan comes with full CSS and SASS support out of the box so you don't need to do anything, even if you want to use CSS/SASS modules.
By default class names are only hashed for CSS and SASS modules (e.g. `*.module.css` and `*.module.sass`).
If you are using modules you need to import them directly in your components like this:

```typescript jsx
import classes from './Header.module.scss';

export const Header = () => (
  <header className={classes.header}>
    <h1>A heading</h1>
  </header>
);
```

<a id="customization-images"></a>

### Images

Varan comes with support for automatically resizing images (only for `jpeg` and `png`).
This enables automatic generation of srcSets that you can spread on your `img` tags or simple url references to smaller images.

CSS/SASS basic example:

```css
@media (max-width: 499px) {
  background: url('../my-image.png?size=500');
}
@media (min-width: 500px) {
  background: url('../my-image.png?size=1000');
}
@media (min-width: 1000px) {
  background: url('../my-image.png?size=1920');
}
```

Images handled by the automatic resizer should work without issues for most use cases.
If it does not, it is often caused by a webpack loader not expecting the output format of the resizer.
Varan has an escape hatch built-in for these scenarios, or if you prefer to have a single resized output image.
You can append a query parameter `srcOnly` to indicate that you want a single resized image reference — a string.
This is for instance used for the app manifest as it does not support multiple image references.

App manifest example

```json
{
  (...)
  "icons": [
    {
      "src": "./images/icons/icon-512x512.png?size=72&srcOnly",
      "sizes": "72x72",
      "type": "image/png"
    },
    {
      "src": "./images/icons/icon-512x512.png?size=96&srcOnly",
      "sizes": "96x96",
      "type": "image/png"
    },
    {
      "src": "./images/icons/icon-512x512.png?size=128&srcOnly",
      "sizes": "128x128",
      "type": "image/png"
    },
  ]
}
```

<a id="customization-performance"></a>

### Performance

There are many things you can do to optimize build and runtime performance.
Here are some recommendations.

<a id="customization-performance-fibers"></a>

#### Fibers

Consider adding [fibers](https://www.npmjs.com/package/fibers) to your project as a development dependency.
This may significantly improve build performance for sass heavy projects.

**Note:** you have to select the right version of [fibers](https://www.npmjs.com/package/fibers) depending on your node version!

<a id="customization-polyfill"></a>

### Polyfills and Browser Support

Varan automatically adds basic polyfills for IE11 (to be removed at some point) and injects any other necessary polyfills using [@babel/preset-env](https://babeljs.io/docs/en/babel-preset-env.html) and [@babel/plugin-transform-runtime](https://babeljs.io/docs/en/babel-plugin-transform-runtime.html) based on your [browserslist](#browserslist).
Note that it is expected that you have `@babel/runtime` and, `core-js@3` or `core-js-pure@3` package as a production dependency to provide polyfills.

<a id="customization-browserslist"></a>

### Browserslist

Varan supports [browserslist](https://github.com/browserslist/browserslist) for polyfilling. Refer to [browserslist](https://github.com/browserslist/browserslist) for more information on how to use it. Varan supports both `.browserslistrc` files and the `browserslist` property in `package.json`.

<a id="customization-webpack"></a>

### Customizing Webpack

When you create your own webpack configuration it is highly recommended to extend the existing config and only make the necessary changes to fit your use case.
The built in configs contain many useful defaults and are kept up to date as best practices and plugins change.

The built in configs are available at `varan/webpack/client` and `varan/webpack/server` for the client and server config respectively.
The configs exports a function where you can set some options without having to revert to overriding the exported webpack config object.

For available options see [default webpack configs](#api-default-webpack-configs).

<a id="customization-build-variables"></a>

#### Build-time Variables

By default, all environment variables starting with `APP_BUILD_VAR_` or `REACT_APP_` (for compatibility reasons) are exchanged in place during build time.
This also includes the `process.env.NODE_ENV` environment variable.
Only use this for non-sensitive variables for use in the front-end.

**Note: Be careful with what you put in those environment variables as any (even sensitive) information can be exposed to all users!**

If you are using the default webpack configs, then you can also pass in an object to the `buildVars` property (see [API](#api) for more information) with variables to replace at build time.

This is useful if you want to have different builds depending on some build parameters, e.g. different backend API urls depending on your environment.

<a id="customization-webpack-pwa"></a>

#### Progressive Web Apps

There are several methods for creating your asset manifest.
Varan has [app-manifest-loader](https://github.com/sebastian-software/app-manifest-loader) built in and will automatically create manifests from `*.webmanifest` and `browserconfig.xml` files.
You can also use other alternatives such as [webpack-pwa-manifest](https://github.com/arthurbergmz/webpack-pwa-manifest) if you [customize your configuration](#customization-extending-config).

Here is a simple example on how to create your own application manifest, but please, refer to [app-manifest-loader](https://github.com/sebastian-software/app-manifest-loader) for more information

```typescript jsx
import Helmet from 'react-helmet-async';

// Import your handcrafted manifests
import manifest from './manifest.webmanifest';
import browserconfig from './browserconfig.xml';

// Exports
export const App = () => (
  <>
    <Helmet>
      <link rel="manifest" href={manifest} />
      <meta name="msapplication-config" content={browserconfig} />
    </Helmet>
    <div className="App">
      <p>My First PWA App!</p>
    </div>
  </>
);
```

<a id="customization-webpack-static"></a>

#### Static client only applications (e.g. create-react-app)

| Example project                                                                     |
| ----------------------------------------------------------------------------------- |
| [static-example](https://github.com/ersims/varan/tree/master/examples/basic-static) |

Create the following directory structure in the root of your project

```bash
my-project
\--- webpack
     +--- client.js - client customizations
```

Make sure the `client.js` file exports a function that returns the webpack configuration object.
Install [html-webpack-plugin](https://github.com/jantimon/html-webpack-plugin) and [webpack-merge](https://github.com/survivejs/webpack-merge) in your project by running `npm i --save-dev html-webpack-plugin webpack-merge`.

Add `html-webpack-plugin` to your `client.js` configuration as seen below:

```javascript
const HtmlWebpackPlugin = require('html-webpack-plugin');
const merge = require('webpack-merge');
const path = require('path');
const client = require('varan/webpack/client');

module.exports = (options) =>
  merge(client(options), {
    plugins: [
      new HtmlWebpackPlugin({
        inject: true,
        favicon: options.favicon,
        // Optionally provide a custom index.html template
        // template: path.resolve(__dirname, '..', 'src', 'client', 'index.html'),
        minify: {
          removeComments: true,
          collapseWhitespace: true,
          removeRedundantAttributes: true,
          useShortDoctype: true,
          removeEmptyAttributes: true,
          removeStyleLinkTypeAttributes: true,
          keepClosingSlash: true,
          minifyJS: true,
          minifyCSS: true,
          minifyURLs: true,
        },
      }),
    ],
  });
```

<a id="customization-use-own-webpack"></a>

### Use Your Own Webpack Configuration

Customizations are supported through specifying your own webpack config files for `varan build` and/or `varan watch`.
It is recommended to create your own `webpack` directory with your custom client and server files, and specifying these when using `varan build` and `varan watch`.
Whenever possible, extend the default webpack configs provided in `varan/webpack/client` and `varan/webpack/server` respectively instead of creating your own from scratch.
See [extending webpack config](#customization-extending-config) for more information on how to extend the config.

Note that development mode (`varan watch`) only supports up to two config files, one with `target: 'browser'` and one with `target: 'node'`, while production mode (`varan build`) supports any number of configs.

To use your new local configs in development mode you can provide the path to your config files directly.
If you only want to override client or server you can use `varan/webpack/server` or `varan/webpack/client` respectively to use the default config for the non-overridden config.

To override only the client config for development mode, run:

```bash
varan watch ./webpack/client varan/webpack/server
```

For production build you can specify a list of config files to build like so:

```bash
varan build ./webpack/client ./webpack/server
```

Remember to update your npm scripts to use the new config files as shown above.

<a id="troubleshooting"></a>

### Troubleshooting

Sometimes stuff go wrong and with the complexity that Webpack brings it may be difficult to find a root cause and solution.
Here are some common issues you might encounter and some suggestions on how to fix them.
If you encounter other issues not mentioned here, please leave an issue and a simple reproduction repository (and a fix if you have it) and we can add it here for the benefit of others.

<a id="troubleshooting-watch-404"></a>

#### `varan watch` gives 404

Sometimes it might seem that `varan watch` is working fine - no issues encountered - but your browser gives you 404.
Try running `varan build` as some errors might be swallowed by the watcher, but will surface when building.
This should give you a better indication of the actual issue and allow you to solve it.

<a id="troubleshooting-syntax-errors-dependencies"></a>

#### Syntax errors in dependencies

Sometimes you may encounter dependencies that require special care or a custom webpack config.
This is usually because the dependency is built for a different environment than you have, either it is browser vs Node.js or different version of Node.js.

Typically you will see something similar when running your application:

```bash
💬 SERVER: [REDACTED]/node_modules/@aws-amplify/ui/dist/style.css:13
:root {
^

SyntaxError: Unexpected token :
    at new Script (vm.js:79:7)
    at createScript (vm.js:251:10)
    at Object.runInThisContext (vm.js:303:10)
    at Module._compile (internal/modules/cjs/loader.js:657:28)
    at Object.Module._extensions..js (internal/modules/cjs/loader.js:700:10)
    at Module.load (internal/modules/cjs/loader.js:599:32)
    at tryModuleLoad (internal/modules/cjs/loader.js:538:12)
    at Function.Module._load (internal/modules/cjs/loader.js:530:3)
    at Module.require (internal/modules/cjs/loader.js:637:17)
    at require (internal/modules/cjs/helpers.js:20:18)
```

In this case it is because `aws-amplify` and `aws-amplify-react` is installed and depends on `@aws-amplify/ui` which requires a `.css` file.
This works fine in the front-end because all code, including `node_modules`, is bundled and run through webpack.
The back-end Node.js server does not run `node_modules` through webpack and hence does not know how to parse `.css` files.
The result is that it crashes immediately when started.

This specific issue can be solved in two ways;

1. Bundle the specific dependency that causes issues. This is the recommended approach.
2. Bundle all `node_modules` - even on the server. Note that this may have severe performance implications.

In both cases you will need to create your own webpack configuration and override the relevant options.
See [customizing webpack](#customization-webpack) for more information on using your own webpack config.

This is an example of a custom webpack config for solving the specific issue described above according to the recommended option 1):

```javascript
const server = require('varan/webpack/server');

module.exports = (options) => server({ ...options, whitelistExternals: ['aws-amplify-react'] });
```

<a id="api"></a>

## API

<a id="api-build"></a>

### `build([options])`

Create a production build using any number of webpack configurations.

```javascript
import { build } from 'varan';
```

- `options` (object): Object with options
  - `appDir` (string): The working directory to use. Default: `process.cwd()`
  - `configs` ((string|function|object)[]): An array of valid webpack configurations. Either paths to a file, functions or actual webpack config object are supported, or a mix. All functions provided here will also receive these options. Default: `['varan/webpack/client', 'varan/webpack/server']`
  - `verbose` (boolean): Verbose logging? Default: `false`
  - `env` (string): Build environment to use. Either `development` or `production`. Default: `process.env.NODE_ENV`
  - `warnAssetSize` (number): Warn when an asset exceeds this size in bytes. Default: `512 * 1024` (512kb)
  - `warnChunkSize` (number): Warn when a chunk exceeds this size in bytes. Default: `1024 * 1024` (1mb)

<a id="api-default-webpack-configs"></a>

### Default webpack configs

Varan provides a default webpack config for client applications and server applications.
These are exported as functions that take some options (see below) and returns a valid webpack configuration object.

#### `varan/webpack/client`

`client([options])`

- `options` (object): Object with options
  - `analyze` (boolean): Analyze the bundle? Opens a browser window with a breakdown on bundle sizes. Default: false
  - `appDir` (string): The working directory to use. Default: `process.cwd()`
  - `buildVars` (object): A key => value object with global variables to substitute during build time. Default: `{}`
  - `entry` (string): The bundle entry file relative to the `sourceDir`. Default: `index`
  - `env` (string): Current environment as in `NODE_ENV`. Should be `development` or `production`. Default: `process.env.NODE_ENV`
  - `name` (string): The name of the application. Default: name of entry file
  - `targetDir` (string): The directory to output the build relative to the working directory. Default: `dist/client`
  - `sourceDir` (string): The directory of the source files relative to the working directory. Default: `src/client`
  - `devServerPort` (number): The port number to use for the development server used when running `varan watch`. Default `3000`

#### `varan/webpack/server`

`server([options])`

- `options` (object): Object with options
  - `appDir` (string): The working directory to use. Default: `process.cwd()`
  - `buildVars` (object): A key => value object with global variables to substitute during build time. Default: `{}`
  - `entry` (string): The bundle entry file relative to the `sourceDir`. Default: `index`
  - `env` (string): Current environment as in `NODE_ENV`. Should be `development` or `production`. Default: `process.env.NODE_ENV`
  - `name` (string): The name of the application. Default: name of entry file
  - `targetDir` (string): The directory to output the build relative to the working directory. Default: `dist/server`
  - `sourceDir` (string): The directory of the source files relative to the working directory. Default: `src/server`
  - `clientTargetDir` (string): The directory of the client build files relative to the working directory. Default: `dist/client`
  - `whitelistExternals` (string[]): List of `node_modules` to include in the server bundle. Use this if you are using modules that requires to be processed through webpack (e.g. if you get syntax errors because of non-javascript files or because your node version does not support the required featureset) . Default: `[]`

<a id="license"></a>

## TODO

- [ ] Enable support for `fibers` (see https://github.com/webpack-contrib/sass-loader)
- [x] Fast refresh
- [x] Complete build stats
- [ ] Compare previous build stats
- [ ] No server side assets?
- [ ] BP index.html for client only apps
- [ ] Server side SSR?
- [ ] 2-page demo site in boilerplate
- [ ] aws-cdk example
- [ ] make everything the same version
- [ ] service-worker
- [ ] dev/prod mode in configs?
- [ ] fix api for custom configs
- [ ] complete asset manifest
- [ ] good image resizing
- [ ] default build outputs should be build/<target>/(public|dist|build) (to enable outputs that are not public, e.g. manifests and source maps)
- [ ] add varan build env vars for locating stuff
- [ ] handle initial build fail for web and node
- [ ] autorestart on rebuild if no devserver (e.g. node)?
- [ ] fix source maps (duplicates, separated etc)
- [ ] add react-dev-utils scripts/middlewares (e.g. noopserviceworker)
- [ ] custom web-static and web-ssr webpack config

## License

[MIT][license-url]

[npm-url]: https://npmjs.org/package/varan
[npm-image]: https://img.shields.io/npm/v/varan.svg
[circleci-url]: https://circleci.com/gh/ersims/varan/tree/master
[circleci-image]: https://img.shields.io/circleci/project/github/ersims/varan/master.svg
[codecov-url]: https://codecov.io/gh/ersims/varan/tree/master/packages/varan
[codecov-image]: https://img.shields.io/codecov/c/github/ersims/varan/master.svg
[david-url]: https://david-dm.org/ersims/varan/master?path=packages/varan
[david-image]: https://img.shields.io/david/ersims/varan.svg?path=packages/varan
[snyk-url]: https://snyk.io/test/github/ersims/varan/master?targetFile=packages/varan/package.json
[snyk-image]: https://snyk.io/test/github/ersims/varan/master/badge.svg?targetFile=packages/varan/package.json
[create-varan-app-url]: https://npmjs.org/package/create-varan-app
[varan-url]: https://github.com/ersims/varan/tree/master/packages/varan
[license-url]: LICENSE.md
[license-image]: https://img.shields.io/github/license/ersims/varan.svg
