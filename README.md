# Varan
A webpack starter-kit for server side rendered react applications.

Note that Varan is in very early pre-alpha stage and customizations are not yet supported.

Disclaimer: There will be breaking changes and outdated documentation during the pre-v1.0.0 cycles.

[![npm](https://img.shields.io/npm/v/varan.svg)](https://npmjs.org/package/varan)
[![Travis](https://img.shields.io/travis/ersims/varan/master.svg)](https://travis-ci.org/ersims/varan)
[![Codecov branch](https://img.shields.io/codecov/c/github/ersims/varan/master.svg)](https://codecov.io/gh/ersims/varan)
[![David](https://img.shields.io/david/ersims/varan.svg)]()
[![npm](https://img.shields.io/npm/l/varan.svg)](https://github.com/ersims/varan/blob/master/LICENSE.md)

## Install

1. Install `varan` in your project

```
$ npm i --save-dev varan
```

2. Create npm scripts to support your workflow. This is usually enough for most projects:
```
"build": "varan build",
"watch": "varan watch -- --inspect"
```

## Usage



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


### License

  [MIT](LICENSE.md)
