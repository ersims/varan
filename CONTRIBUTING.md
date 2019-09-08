# Contributing

[![Conventional Commits][conventional-commits-image]][conventional-commits-url]

This project follows [conventional commit conventions][conventional-commits-url] and uses [prettier][prettier-url] for code style.

Before adding a new feature or changing an existing features, please open an issue to discuss it so that you know we will accept your pull request before you spend your valuable time coding it.

## Getting started

All common contribution guidelines apply.
Please add or update unit tests, documentation and examples where applicable.

Thank you for any and all contributions!

## Commit conventions

Please follow these conventions for your commit messages.
Here is an excerpt of the most important guidelines.
The guidelines are more or less identical to the [Angular Commit Message Guidelines](https://github.com/angular/angular/blob/master/CONTRIBUTING.md#commit) with the exception of also requiring an exclamation mark for breaking changes.

### Commit Message Format

Each commit message consists of a **header**, a **body** and a **footer**. The header has a special
format that includes a **type**, a **scope** and a **subject**:

```
<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

The **header** is mandatory and the **scope** of the header is optional.
The **footer** should contain a [closing reference to an issue](https://help.github.com/articles/closing-issues-via-commit-messages/) if relevant.

If the commit contains a **BREAKING CHANGE**, the header must include a `!` before the colon and the body must contain the word `BREAKING CHANGE:` with a space or two newlines followed by a description of what is breaking.

```
chore(varan)!: drop Node v8 from CI

BREAKING CHANGE: dropping Node v8 which is no longer supported
```

### Allowed types

Must be one of the following:

- **build**: Changes that affect the build system or external dependencies
- **ci**: Changes to CI configuration files and scripts (example scopes: circleci, github)
- **docs**: Documentation only changes
- **feat**: A new feature
- **fix**: A bug fix
- **perf**: A code change that improves performance - but does not change any api or functionality
- **refactor**: A code change that is purely code structure (not a feature, bugfix or performance improvements)
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
- **test**: Adding missing tests or correcting existing tests

### Allowed scopes

Scopes allowed are the names of the affected package or one of the following:

- **circleci**: Changes related to Circle CI config
- **github**: Changes related to GitHub config
- **deps**: Pure dependencies changes (e.g. updates)
- **release**: Used when releasing packages

[conventional-commits-image]: https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg
[conventional-commits-url]: https://conventionalcommits.org/
[prettier-url]: https://prettier.io/
