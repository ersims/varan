# Varan
A webpack starter-kit for server side rendered react applications.

Note that Varan is in very early pre-alpha stage and customizations are not yet supported.

Disclaimer: There will be breaking changes and outdated documentation during the pre-v1.0.0 cycles.

[![npm](https://img.shields.io/npm/v/varan.svg)](https://npmjs.org/package/varan)
[![David](https://img.shields.io/david/ersims/varan.svg)]()
[![npm](https://img.shields.io/npm/l/varan.svg)](https://github.com/ersims/varan/blob/master/LICENSE.md)

## Usage
Either clone an example project from the examples directory and run `npm i` or;

1. Install Varan to your project. Note that it is possible to install globally using the -g flag, but it is recommended to install it on a per-project level
```
npm i --save-dev varan
```

2. Add the following in the `"scripts"` section in your project's `package.json`
```
"build": "varan build",
"watch": "varan watch -- --inspect"
```

Any options passed after `--` is sent directly to nodemon - this makes it easy to add debugging options to the server in `watch` mode.

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
