# Varan

A webpack starter-kit for production ready webpack applications. Includes full support for server side rendered React applications out of the box.

Disclaimer: There will be breaking changes and outdated documentation for packages pre-v1.0.0.

[![CircleCI][circleci-image]][circleci-url]
[![Codecov branch][codecov-image]][codecov-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![renovate-app badge][renovate-image]][renovate-url]
[![Conventional Commits][conventional-commits-image]][conventional-commits-url]
[![lerna][lerna-image]][lerna-url]
[![license][license-image]][license-url]

## Contributing

All contributions are highly appreciated whether it is issues, documentation, tests, code or just questions.
For more information on how to start contributing see [CONTRIBUTING.md](CONTRIBUTING.md).

## Content

- [Getting Started](#getting-started)
- [Packages](#packages)
- [License](#license)

<a id="getting-started"></a>

## Getting Started

Create a new varan project by running the following command.

```bash
$ npx create-varan-app my-project
```

You can find further documentation in the respective package README.md file below.
You likely want to check out [varan](packages/varan/README.md) documentation.

<a id="packages"></a>

## Packages

| Readme                                                      | NPM                                                                |
| ----------------------------------------------------------- | ------------------------------------------------------------------ |
| [babel-preset-varan](packages/babel-preset-varan/README.md) | [![npm][npm-babel-preset-varan-image]][npm-babel-preset-varan-url] |
| [create-varan-app](packages/create-varan-app/README.md)     | [![npm][npm-create-varan-app-image]][npm-create-varan-app-url]     |
| [varan](packages/varan/README.md)                           | [![npm][npm-varan-image]][npm-varan-url]                           |

<a id="license"></a>

## License

Note that different packages within the repository might have a different license.

[MIT][license-url]

[npm-varan-url]: https://npmjs.org/package/varan
[npm-varan-image]: https://img.shields.io/npm/v/varan.svg
[npm-create-varan-app-url]: https://npmjs.org/package/create-varan-app
[npm-create-varan-app-image]: https://img.shields.io/npm/v/create-varan-app.svg
[npm-babel-preset-varan-url]: https://npmjs.org/package/babel-preset-varan
[npm-babel-preset-varan-image]: https://img.shields.io/npm/v/babel-preset-varan.svg
[conventional-commits-image]: https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg
[conventional-commits-url]: https://conventionalcommits.org/
[circleci-url]: https://circleci.com/gh/ersims/varan/tree/master
[circleci-image]: https://img.shields.io/circleci/project/github/ersims/varan/master.svg
[codecov-url]: https://codecov.io/gh/ersims/varan/tree/master
[codecov-image]: https://img.shields.io/codecov/c/github/ersims/varan/master.svg
[snyk-url]: https://snyk.io/test/github/ersims/varan/master
[snyk-image]: https://snyk.io/test/github/ersims/varan/master/badge.svg
[renovate-url]: https://renovateapp.com/
[renovate-image]: https://img.shields.io/badge/renovate-app-blue.svg
[lerna-image]: https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg
[lerna-url]: https://lerna.js.org
[license-url]: LICENSE.md
[license-image]: https://img.shields.io/github/license/ersims/varan.svg
