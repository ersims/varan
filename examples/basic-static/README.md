# Varan basic example for static apps

This example contains a basic static application.
There are no server components in this example except for a development server for use during development.
For some projects this is a simple starting point — similar to [create-react-app][create-react-app-url]

## Documentation

- [Getting Started](#getting-started)
- [Usage](#usage)
  - [Development](#usage-development)
  - [Production](#usage-production)
- [Customization](#customization)
- [License](#license)

<a id="getting-started"></a>

### Getting started

Create the example project by installing it using [create-varan-app][create-varan-app-url] like so:

```bash
$ npx create-varan-app --example=basic my-project
```

Here is an excerpt of the project directory structure with the most important directories.

```bash
.
├── dist // (auto generated when running npm run build)
├── src // source code
|   ├── index.html
│   └── index.jsx
└── test
    └── __tests__
```

<a id="usage"></a>

### Usage

<a id="usage-development"></a>

#### Development

Start a development server with hot reloading.

```bash
$ npm run start:watch
```

<a id="usage-production"></a>

#### Production

Build a production build.

```bash
$ npm run build
```

Analyze the production build.

```bash
$ npm run build:analyze
```

Deploy your application to somewhere that can host a static application e.g. Heroku, Amazon S3, Azure App Service etc.

<a id="customization"></a>

### Customization

This project uses [varan][varan-url].
For more information on how to customize your build, development, browser support and more, see the [varan documentation][varan-url].

<a id="license"></a>

### License

[MIT](LICENSE.md)

[varan-url]: https://github.com/ersims/varan
[create-varan-app-url]: https://github.com/ersims/varan
[create-react-app-url]: https://create-react-app.dev/
