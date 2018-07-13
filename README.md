# Varan
A webpack starter-kit for server side rendered react applications.

Note that `varan` is in very early pre-alpha stage and breaking changes may occur.

Disclaimer: There will be breaking changes and outdated documentation during the pre-v1.0.0 cycles.

[![npm](https://img.shields.io/npm/v/varan.svg)](https://npmjs.org/package/varan)
[![CircleCI](https://img.shields.io/circleci/project/github/ersims/varan.svg)](https://circleci.com/gh/ersims/varan)
[![Codecov branch](https://img.shields.io/codecov/c/github/ersims/varan/master.svg)](https://codecov.io/gh/ersims/varan)
[![Known Vulnerabilities](https://snyk.io/test/github/ersims/varan/badge.svg)](https://snyk.io/test/github/ersims/varan)
[![David](https://img.shields.io/david/ersims/varan.svg)](https://github.com/ersims/varan)
[![renovate-app badge](https://img.shields.io/badge/renovate-app-blue.svg)](https://renovateapp.com/)
[![license](https://img.shields.io/github/license/ersims/varan.svg)](https://github.com/ersims/varan/blob/master/LICENSE.md)

## Install

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

### Local installation

1. Install `varan` in your project

```bash
$ npm i --save-dev varan
```

2. Create npm scripts to support your workflow. This is usually enough for most projects:

```bash
"build": "varan build",
"watch": "varan watch -- --inspect"
```

## Usage

```bash
$ varan

  Usage:  <command> [options]

  Options:

    -V, --version          output the version number
    -h, --help             output usage information

  Commands:

    init [options] <name>
    build [files...]
    watch [options]
```

### Development
Start the development server with hot reloading in browser and on server by running
```bash
npm run watch
```

### Production
To create a minified and bundled production build, run
```bash
npm run build
```
## Custom webpack config

Customizations are supported through specifying your own webpack config files for `varan build` and/or `varan watch`.
It is recommended to create your own `webpack` directory with your client and server files, and specifying these when using `varan build` and `varan watch`.

### Example

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


To use your new files in development mode, run:
```bash
varan watch --client ./webpack/client --server ./webpack/server
```

For production build you can just specify a list of config files to build like so:
```bash
varan build ./webpack/client ./webpack/server
```

Remember to update your npm scripts to use the new config files.

## Contributing

### Release

Run `npm run release` to publish a new release and `npm run release --tag=next` to publish a pre-release.

## License

  [MIT](LICENSE.md)
