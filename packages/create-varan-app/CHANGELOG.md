# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.3.1](https://github.com/ersims/varan/compare/create-varan-app@0.3.0...create-varan-app@0.3.1) (2020-03-28)

### Bug Fixes

- **deps:** update dependency execa to v4 ([bde5132](https://github.com/ersims/varan/commit/bde5132dbe328a70a339b9b2477c360a25355130))
- **deps:** update dependency tar to v6 ([6f00bf9](https://github.com/ersims/varan/commit/6f00bf9d9323944a9888e9d8b305529366dc5356))
- **deps:** update dependency update-notifier to v4 ([f9885c3](https://github.com/ersims/varan/commit/f9885c3ad48efda178b3e09f4d56a474da85e91e))

# [0.3.0](https://github.com/ersims/varan/compare/create-varan-app@0.2.1...create-varan-app@0.3.0) (2019-11-18)

### Bug Fixes

- **deps:** update dependency chalk to v3 ([e0f0c4f](https://github.com/ersims/varan/commit/e0f0c4fea63510509fcc5aa89bb59a3a6b713fbf))
- **deps:** update dependency commander to v4 ([9e0caf0](https://github.com/ersims/varan/commit/9e0caf065a0d0676503f2e1888c24ce367b8d9a4))

## [0.2.1](https://github.com/ersims/varan/compare/create-varan-app@0.2.0...create-varan-app@0.2.1) (2019-10-20)

### Bug Fixes

- **deps:** update dependency execa to v3 ([4212732](https://github.com/ersims/varan/commit/4212732))

# [0.2.0](https://github.com/ersims/varan/compare/create-varan-app@0.1.2...create-varan-app@0.2.0) (2019-10-06)

### Bug Fixes

- **deps:** update dependency tar to v5 ([351a5bc](https://github.com/ersims/varan/commit/351a5bc))

### Features

- add integrity to asset-manifest.json ([02a4d78](https://github.com/ersims/varan/commit/02a4d78))

### BREAKING CHANGES

- asset-manifest.json now contains an object with src and
  integrity for each asset instead of previous src string.

Previous: { "asset.js": "asset.hash.js" }
New: { "asset.js": { src: "asset.hash.js", integrity: "sha256..." }

## [0.1.2](https://github.com/ersims/varan/compare/create-varan-app@0.1.1...create-varan-app@0.1.2) (2019-08-18)

### Bug Fixes

- ensure examples always use the latest varan version ([8918f22](https://github.com/ersims/varan/commit/8918f22))

## [0.1.1](https://github.com/ersims/varan/compare/create-varan-app@0.1.0...create-varan-app@0.1.1) (2019-08-13)

### Bug Fixes

- add missing files to released packages ([fbf7816](https://github.com/ersims/varan/commit/fbf7816))

# 0.1.0 (2019-08-13)

### Features

- add separate babel preset ([3acac18](https://github.com/ersims/varan/commit/3acac18))
- add support for using varan examples as project templates ([9342730](https://github.com/ersims/varan/commit/9342730))
