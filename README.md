# Varan

A webpack starter-kit for production ready webpack applications. Includes full support for server side rendered React applications out of the box.

Disclaimer: There will be breaking changes and outdated documentation during the pre-v1.0.0 cycles.

[![CircleCI][circleci-image]][circleci-url]
[![Codecov branch][codecov-image]][codecov-url]
[![David][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![renovate-app badge][renovate-image]][renovate-url]
[![Conventional Commits][conventional-commits-image]][conventional-commits-url]
[![lerna][lerna-image]][lerna-url]
[![license][license-image]][license-url]

## Content

- [Packages](#packages)
- [Contributing](#contributing)
- [Release](#release)
- [License](#license)

<a id="packages"></a>

## Packages

| Readme                                                      | NPM                                                                |
| ----------------------------------------------------------- | ------------------------------------------------------------------ |
| [babel-preset-varan](packages/babel-preset-varan/README.md) | [![npm][npm-babel-preset-varan-image]][npm-babel-preset-varan-url] |
| [create-varan-app](packages/create-varan-app/README.md)     | [![npm][npm-create-varan-app-image]][npm-create-varan-app-url]     |
| [varan](packages/varan/README.md)                           | [![npm][npm-varan-image]][npm-varan-url]                           |

<a id="contributing"></a>

## Contributing

This project follows [conventional commit conventions][conventional-commits-url].

1. Clone the repo and enter the newly cloned directory

```bash
$ git clone https://github.com/ersims/varan.git
$ cd varan
```

2. Install dependencies and bootstrap the project automatically

```bash
$ npm install
```

3. If you are on windows you might have to run the bootstrap process twice the first time for everything to link up correctly

```bash
$ npm run bootstrap
```

<a id="release"></a>

### Release

Run `npm run release` to publish a new release and `npm run release --tag=next` to publish a pre-release.

<a id="license"></a>

## License

[MIT](LICENSE.md)

[npm-varan-url]: https://npmjs.org/package/varan
[npm-varan-image]: https://img.shields.io/npm/v/varan.svg
[npm-create-varan-app-url]: https://npmjs.org/package/create-varan-app
[npm-create-varan-app-image]: https://img.shields.io/npm/v/create-varan-app.svg
[npm-babel-preset-varan-url]: https://npmjs.org/package/babel-preset-varan
[npm-babel-preset-varan-image]: https://img.shields.io/npm/v/babel-preset-varan.svg
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
[license-url]: https://github.com/ersims/varan/blob/master/LICENSE.md
[license-image]: https://img.shields.io/github/license/ersims/varan.svg
