# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.15.1](https://github.com/ersims/varan/compare/varan@0.15.0...varan@0.15.1) (2019-10-06)

### Bug Fixes

- enable stdin while showing watcher spinner ([acdb9dd](https://github.com/ersims/varan/commit/acdb9dd))
- remove hot update assets from manifest ([0e525ce](https://github.com/ersims/varan/commit/0e525ce))

# [0.15.0](https://github.com/ersims/varan/compare/varan@0.14.0...varan@0.15.0) (2019-10-06)

### Bug Fixes

- **deps:** update dependency filesize to v5 ([2c87541](https://github.com/ersims/varan/commit/2c87541))
- change auto injected build env vars from APP* to APP_BUILD_VAR* ([db92546](https://github.com/ersims/varan/commit/db92546))
- remove compressed assets from asset build list ([001a735](https://github.com/ersims/varan/commit/001a735))

### Features

- add integrity to asset-manifest.json ([02a4d78](https://github.com/ersims/varan/commit/02a4d78))
- add support for css and sass modules ([2661d2c](https://github.com/ersims/varan/commit/2661d2c))
- enable historyApiFallback as default ([e7ec779](https://github.com/ersims/varan/commit/e7ec779))

### BREAKING CHANGES

- APP* environment variables are no longer automatically
  injected during build time. This is to prevent accidental leak of
  sensitive information. Use APP_BUILD_VAR* instead - or use the
  "buildVars" option.

Previous: APP*
New: APP_BUILD_VAR*

- asset-manifest.json now contains an object with src and
  integrity for each asset instead of previous src string.

Previous: { "asset.js": "asset.hash.js" }
New: { "asset.js": { src: "asset.hash.js", integrity: "sha256..." }

# [0.14.0](https://github.com/ersims/varan/compare/varan@0.13.3...varan@0.14.0) (2019-09-08)

### Bug Fixes

- **deps:** update dependency sass-loader to v8 ([e6674f4](https://github.com/ersims/varan/commit/e6674f4))
- **deps:** update dependency terser-webpack-plugin to v2 ([19f455c](https://github.com/ersims/varan/commit/19f455c))
- always use terser source maps to ensure proper file resolving ([2485b17](https://github.com/ersims/varan/commit/2485b17))

### Features

- add brotli compression by default ([920bad6](https://github.com/ersims/varan/commit/920bad6))
- add support for custom build time variables ([27b0bcf](https://github.com/ersims/varan/commit/27b0bcf))

## [0.13.3](https://github.com/ersims/varan/compare/varan@0.13.2...varan@0.13.3) (2019-08-21)

### Bug Fixes

- use webpack-assets-manifest for manifest generation ([cb1919e](https://github.com/ersims/varan/commit/cb1919e))

## [0.13.2](https://github.com/ersims/varan/compare/varan@0.13.1...varan@0.13.2) (2019-08-18)

### Bug Fixes

- make fibers optional to improve reliability on various platforms ([51901b1](https://github.com/ersims/varan/commit/51901b1))

## [0.13.1](https://github.com/ersims/varan/compare/varan@0.13.0...varan@0.13.1) (2019-08-13)

### Bug Fixes

- add missing files to released packages ([fbf7816](https://github.com/ersims/varan/commit/fbf7816))

# 0.13.0 (2019-08-13)

### Features

- add separate babel preset ([3acac18](https://github.com/ersims/varan/commit/3acac18))
- add support for using varan examples as project templates ([9342730](https://github.com/ersims/varan/commit/9342730))
