# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.3.1](https://github.com/ersims/varan/compare/babel-preset-varan@0.3.0...babel-preset-varan@0.3.1) (2020-03-28)

### Bug Fixes

- **deps:** update dependency @svgr/webpack to v5 ([73eb472](https://github.com/ersims/varan/commit/73eb472ba1313307a752278960e4076c49fe3e1c))

# [0.3.0](https://github.com/ersims/varan/compare/babel-preset-varan@0.2.0...babel-preset-varan@0.3.0) (2019-11-18)

**Note:** Version bump only for package babel-preset-varan

# [0.2.0](https://github.com/ersims/varan/compare/babel-preset-varan@0.1.1...babel-preset-varan@0.2.0) (2019-10-06)

### Features

- add integrity to asset-manifest.json ([02a4d78](https://github.com/ersims/varan/commit/02a4d78))

### BREAKING CHANGES

- asset-manifest.json now contains an object with src and
  integrity for each asset instead of previous src string.

Previous: { "asset.js": "asset.hash.js" }
New: { "asset.js": { src: "asset.hash.js", integrity: "sha256..." }

## [0.1.1](https://github.com/ersims/varan/compare/babel-preset-varan@0.1.0...babel-preset-varan@0.1.1) (2019-08-13)

### Bug Fixes

- add missing files to released packages ([fbf7816](https://github.com/ersims/varan/commit/fbf7816))

# 0.1.0 (2019-08-13)

### Features

- add separate babel preset ([3acac18](https://github.com/ersims/varan/commit/3acac18))
- add support for using varan examples as project templates ([9342730](https://github.com/ersims/varan/commit/9342730))
