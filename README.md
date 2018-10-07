# Varan
A webpack starter-kit for server side rendered react applications.

Note that `varan` is in pre-alpha stage and breaking changes may occur.

Disclaimer: There will be breaking changes and outdated documentation during the pre-v1.0.0 cycles.

[![npm](https://img.shields.io/npm/v/varan.svg)](https://npmjs.org/package/varan)
[![CircleCI](https://img.shields.io/circleci/project/github/ersims/varan/master.svg)](https://circleci.com/gh/ersims/varan/tree/master)
[![Codecov branch](https://img.shields.io/codecov/c/github/ersims/varan/master.svg)](https://codecov.io/gh/ersims/varan/tree/master)
[![David](https://img.shields.io/david/ersims/varan/master.svg)](https://david-dm.org/ersims/varan/master)
[![Known Vulnerabilities](https://snyk.io/test/github/ersims/varan/master/badge.svg)](https://snyk.io/test/github/ersims/varan/master)
[![renovate-app badge](https://img.shields.io/badge/renovate-app-blue.svg)](https://renovateapp.com/)
[![license](https://img.shields.io/github/license/ersims/varan.svg)](https://github.com/ersims/varan/blob/master/LICENSE.md)

## Documentation

* [Installation](#installation)
  * [Global installation](#installation-global)
  * [Local installation (recommended)](#installation-local)
* [Usage](#usage)
  * [Development](#usage-development)
  * [Production](#usage-production)
* [Customization](#customization)
  * [Polyfill and browser support](#customization-polyfill)
  * [Browserslist](#customization-browserslist)
  * [Webpack](#customization-webpack)
* [Contributing](#contributing)
* [License](#license)

<a id="installation"></a>
## Installation

<a id="installation-global"></a>
### Global installation

It is possible to install `varan` globally and initiate new projects similar to [create-react-app](https://github.com/facebook/create-react-app).
This is very useful for creating new projects, but keep in mind that it is highly recommended to use a local project installation of `varan` after creating a new project.

1. Install `varan` globally

```bash
$ npm i -g varan
```

2. Create a new project

```bash
$ varan init my-varan-app
```

Optionally use the [advanced](https://github.com/ersims/varan-boilerplate/tree/master) project template/boilerplate by specifying `--advanced`:

```bash
$ varan init --advanced my-varan-app
```

<a id="installation-local"></a>
### Local installation for existing projects

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

    init [options] <name>
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
## Customization

Varan provides sane defaults and should be a good starting point for most projects. You can find the default [client](/webpack/client.js) and [server](/webpack/server.js) config files under `varan/webpack`. 

The most important option to set correctly is the entry points. Existing projects implementing varan might have to set a custom entry point for the client and/or the server using a [custom webpack config](#customization-webpack). 
The default entry points in varan are as follows:

| Type   | Entry file relative to project root |
|--------|-------------------------------------|
| Client | `src/client/index`                  |
| Server | `src/server/bin/web`                |

<a id="customization-polyfill"></a>
### Polyfills and browser support

Varan automatically adds basic polyfills for IE11 (to be removed at some point) and injects any other necessary polyfills using [@babel/preset-env](https://babeljs.io/docs/en/babel-preset-env.html) and [@babel/plugin-transform-runtime](https://babeljs.io/docs/en/babel-plugin-transform-runtime.html) based on your [browserslist](#browserslist).
Note that it is expected that you have `@babel/runtime` and either `core-js` or `@babel/runtime-corejs2` package as a production dependency to provide polyfills.

<a id="customization-browserslist"></a>
### Browserslist

Varan supports [browserslist](https://github.com/browserslist/browserslist) for polyfilling. Refer to [browserslist](https://github.com/browserslist/browserslist) for more information on how to use it. Varan supports both `.browserslistrc` files and the `browserslist` property in `package.json`.

<a id="customization-webpack"></a>
### Custom webpack config

Customizations are supported through specifying your own webpack config files for `varan build` and/or `varan watch`.
It is recommended to create your own `webpack` directory with your client and server files, and specifying these when using `varan build` and `varan watch`.

#### Example

Create the following directory structure in the root of your project
```bash
my-project
\--- webpack
     +--- client.js - client customizations
     \--- server.js - server customizations
```

Make sure the `client.js` and `server.js` files exports a function that returns the webpack configuration object.

`server.js` with no modifications:
```javascript
module.exports = require('varan/webpack/server');
```

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

Note that development mode only supports up to two config files, one with `target: 'browser'` and one with  `target: 'node'`
To use your new files in development mode, run:
```bash
varan watch ./webpack/client ./webpack/server
```

For production build you can specify a list of config files to build like so:
```bash
varan build ./webpack/client ./webpack/server
```

Remember to update your npm scripts to use the new config files as shown above.

<a id="contributing"></a>
## Contributing

This project follows [angular commit conventions](https://github.com/angular/angular/blob/master/CONTRIBUTING.md#commit).
### Release

Run `npm run release` to publish a new release and `npm run release --tag=next` to publish a pre-release.

<a id="license"></a>
## License

  [MIT](LICENSE.md)
