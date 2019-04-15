# Varan basic example

This project is a [varan][varan-url] project. This is the simplified boilerplate. To use the more advanced boilerplate, initiate you project using `varan init -a my-awesome-project` or clone the [advanced boilerplate][varan-advanced-boilerplate-url] manually.

## Documentation

- [Getting Started](#getting-started)
- [Usage](#usage)
  - [Development](#usage-development)
  - [Production](#usage-production)
- [Customization](#customization)
- [License](#license)

<a id="getting-started"></a>

### Getting Started

The quickest way to get started is to use [Heroku][heroku-url].

1. Sign up for [Heroku][heroku-url] and create an app.
2. Follow the `Deploy using Heroku Git` steps in [Heroku][heroku-url] to deploy the app.

<a id="usage"></a>

### Usage

<a id="usage-development"></a>

#### Development

Start a development server with hot reloading

```bash
npm run watch
```

<a id="usage-production"></a>

#### Production

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

<a id="customization"></a>

### Customization

This project uses [varan][varan-url].
For more information on how to customize your build, development, browser support and more, see the [varan documentation][varan-url].

<a id="license"></a>

### License

[MIT](LICENSE.md)

[varan-url]: https://github.com/ersims/varan
[varan-advanced-boilerplate-url]: https://github.com/ersims/varan-boilerplate
[heroku-url]: https://dashboard.heroku.com
