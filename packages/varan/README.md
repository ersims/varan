# Varan

A webpack starter-kit for production ready webpack applications. Includes full support for server side rendered React applications out of the box.

Disclaimer: There will be breaking changes and outdated documentation during the pre-v1.0.0 cycles.

[![npm][npm-image]][npm-url]
[![CircleCI][circleci-image]][circleci-url]
[![Codecov branch][codecov-image]][codecov-url]
[![David][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![renovate-app badge][renovate-image]][renovate-url]
[![Conventional Commits][conventional-commits-image]][conventional-commits-url]
[![lerna][lerna-image]][lerna-url]
[![license][license-image]][license-url]

## Documentation

- [Installation](#installation)
  - [Alternative 1: New Project](#installation-new-project)
  - [Alternative 2: Existing Project](#installation-existing-project)
- [Usage](#usage)
  - [Development](#usage-development)
  - [Production](#usage-production)
- [Customization and Setup](#customization)
  - [Performance](#customization-performance)
    - [Fibers](#customization-performance-fibers)
  - [Polyfill and browser support](#customization-polyfill)
  - [Browserslist](#customization-browserslist)
  - [Webpack](#customization-webpack)
    - [Progressive web apps](#customization-webpack-pwa)
    - [Static client side apps (create-react-app)](#customization-webpack-static)
- [Contributing](#contributing)
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
    "watch": "varan watch -- --inspect"
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
npm run watch
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

### Polyfills and browser support

Varan automatically adds basic polyfills for IE11 (to be removed at some point) and injects any other necessary polyfills using [@babel/preset-env](https://babeljs.io/docs/en/babel-preset-env.html) and [@babel/plugin-transform-runtime](https://babeljs.io/docs/en/babel-plugin-transform-runtime.html) based on your [browserslist](#browserslist).
Note that it is expected that you have `@babel/runtime` and, `core-js@3` or `core-js-pure@3` package as a production dependency to provide polyfills.

<a id="customization-browserslist"></a>

### Browserslist

Varan supports [browserslist](https://github.com/browserslist/browserslist) for polyfilling. Refer to [browserslist](https://github.com/browserslist/browserslist) for more information on how to use it. Varan supports both `.browserslistrc` files and the `browserslist` property in `package.json`.

<a id="customization-webpack"></a>

### Custom webpack config

Customizations are supported through specifying your own webpack config files for `varan build` and/or `varan watch`.
It is recommended to create your own `webpack` directory with your custom client and server files, and specifying these when using `varan build` and `varan watch`.

Note that development mode only supports up to two config files, one with `target: 'browser'` and one with `target: 'node'`, while production mode supports any number of configs.

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

<a id="customization-webpack-pwa"></a>

#### Progressive Web Apps

Create the following directory structure in the root of your project

```bash
my-project
\--- webpack
     +--- client.js - client customizations
```

Make sure the `client.js` file exports a function that returns the webpack configuration object.

`client.js` with a Progressive Web App manifest while still using the default config in `varan`:

```javascript
// Dependencies
const path = require('path');
const client = require('varan/webpack/client');
const pwaManifest = {
  name: 'Varan Progressive Web App!!!',
  short_name: 'VaranPWA',
  description: 'My awesome Progressive Web App using Varan!',
  background_color: '#ffffff',
  theme_color: '#ffffff',
  icons: [
    {
      src: path.resolve(__dirname, '../src/assets/favicon.ico'),
      sizes: [96, 192, 512],
    },
  ],
};

// Exports
module.exports = options => client({ ...options, pwaManifest });
```

<a id="customization-webpack-static"></a>

#### Static client only applications (e.g. create-react-app)

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

module.exports = options =>
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

<a id="dependency-errors"></a>

### Syntax errors in dependencies

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

module.exports = options => server({ ...options, whitelistExternals: ['aws-amplify-react'] });
```

<a id="contributing"></a>

## Contributing

This project follows [angular commit conventions](https://github.com/angular/angular/blob/master/CONTRIBUTING.md#commit).

### Release

Run `npm run release` to publish a new release and `npm run release --tag=next` to publish a pre-release.

<a id="license"></a>

## License

[MIT](LICENSE.md)

[npm-url]: https://npmjs.org/package/varan
[npm-image]: https://img.shields.io/npm/v/varan.svg
[circleci-url]: https://circleci.com/gh/ersims/varan/tree/master
[circleci-image]: https://img.shields.io/circleci/project/github/ersims/varan/master.svg
[codecov-url]: https://codecov.io/gh/ersims/varan/tree/master
[codecov-image]: https://img.shields.io/codecov/c/github/ersims/varan/master.svg
[david-url]: https://david-dm.org/ersims/varan/master
[david-image]: https://img.shields.io/david/ersims/varan.svg
[snyk-url]: https://snyk.io/test/github/ersims/varan/master
[snyk-image]: https://snyk.io/test/github/ersims/varan/master/badge.svg
[renovate-url]: https://renovateapp.com/
[renovate-image]: https://img.shields.io/badge/renovate-app-blue.svg
[conventional-commits-image]: https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg
[conventional-commits-url]: https://conventionalcommits.org/
[lerna-image]: https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg
[lerna-url]: https://lerna.js.org
[create-varan-app-url]: https://npmjs.org/package/create-varan-app
[license-url]: https://github.com/ersims/varan/blob/master/LICENSE.md
[license-image]: https://img.shields.io/github/license/ersims/varan.svg
