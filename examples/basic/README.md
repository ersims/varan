# Varan basic example

This example contains a basic `server` and `client` component.
For most projects this is an ideal starting point as it allows maximum portability and flexibility.

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
│   ├── assets
│   │   └── favicon.ico
│   ├── client // all client specific code - this runs in the browser (and during server side rendering)
│   │   └── index.jsx
│   └── server // all server code - this runs on the server and handles serving the client directory
│       └── bin
│           └── web.js
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

Deploy your application and start the production server.

```bash
$ npm start
```

<a id="customization"></a>

### Customization

This project uses [varan][varan-url].
For more information on how to customize your build, development, browser support and more, see the [varan documentation][varan-url].

<a id="license"></a>

### License

[MIT](LICENSE.md)

[varan-url]: https://github.com/ersims/varan
[create-varan-app-url]: https://github.com/ersims/varan
