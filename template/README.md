# Varan basic example

This project is a [varan](https://github.com/ersims/varan) project. This is the simplified boilerplate. To use the more advanced boilerplate, initiate you project using `varan init -a my-awesome-project` or clone the [advanced boilerplate](https://github.com/ersims/varan-boilerplate/tree/master) manually.


## Usage

### Development

Start a development server with hot reloading

```bash
npm run watch
```

### Production

Build a production build

```bash
npm run build
```

Analyze the production build

```bash
npm run build:analyze
```

Start the production server

```bash
npm start
```

## Customize build

### Browser support

This project uses [browserslist](https://github.com/browserslist/browserslist). By default the browser support list is defined in the `package.json` file, but you can use a `.browserlistrc` file if you prefer.

### Webpack

You can create or bring your own webpack configuration files, though it is recommended to extend the default `varan` webpack configurations to take advantage of useful defaults and optimizations. See [varan documentation](https://github.com/ersims/varan) for more information.

### License

  [MIT](LICENSE.md)
