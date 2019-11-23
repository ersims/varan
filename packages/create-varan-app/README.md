# create-varan-app

Create a fully fledged server side rendered react app in one simple command `npx create-varan-app my-project`

[![npm][npm-image]][npm-url]
[![CircleCI][circleci-image]][circleci-url]
[![Codecov branch][codecov-image]][codecov-url]
[![David][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![license][license-image]][license-url]

## Documentation

- [Usage](#usage)
  - [Options](#usage-options)

<a id="usage"></a>

## Usage

Run one of the following commands to create a new varan project

```bash
$ npx create-varan-app my-project
```

```bash
$ npm init varan-app my-project
```

<a id="options"></a>

### Options

```bash
$ npx create-varan-app
Usage:  <project name> [options]

Options:
  -V, --version                output the version number
  -s, --silent                 silence output
  -e, --example <example>      create project from an example. See https://github.com/ersims/varan/tree/master/examples for a list of examples
  -r, --fromGitRepo <gitRepo>  create project from an existing Git repository (default: "https://github.com/ersims/varan-boilerplate.git")
  -h, --help                   output usage information
```

<a id="license"></a>

## License

[MIT][license-url]

[npm-url]: https://npmjs.org/package/create-varan-app
[npm-image]: https://img.shields.io/npm/v/create-varan-app.svg
[circleci-url]: https://circleci.com/gh/ersims/varan/tree/master
[circleci-image]: https://img.shields.io/circleci/project/github/ersims/varan/master.svg
[codecov-url]: https://codecov.io/gh/ersims/varan/tree/master/packages/varan
[codecov-image]: https://img.shields.io/codecov/c/github/ersims/varan/master.svg
[david-url]: https://david-dm.org/ersims/varan/master?path=packages/create-varan-app
[david-image]: https://img.shields.io/david/ersims/varan.svg?path=packages/create-varan-app
[snyk-url]: https://snyk.io/test/github/ersims/varan/master?targetFile=packages/create-varan-app/package.json
[snyk-image]: https://snyk.io/test/github/ersims/varan/master/badge.svg?targetFile=packages/create-varan-app/package.json
[license-url]: LICENSE.md
[license-image]: https://img.shields.io/github/license/ersims/varan.svg
