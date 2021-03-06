# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.17.1](https://github.com/ersims/varan/compare/varan@0.17.0...varan@0.17.1) (2020-03-28)

### Bug Fixes

- disable esmodules to prevent some parsing errors ([9b375ff](https://github.com/ersims/varan/commit/9b375ff5851239a9ffe3a3e6016e8a50a5b0498b))

# [0.17.0](https://github.com/ersims/varan/compare/varan@0.16.3...varan@0.17.0) (2020-03-28)

### Bug Fixes

- **deps:** update dependency execa to v4 ([bde5132](https://github.com/ersims/varan/commit/bde5132dbe328a70a339b9b2477c360a25355130))
- **deps:** update dependency file-loader to v5 ([30f8ff9](https://github.com/ersims/varan/commit/30f8ff9f770f31fe9d79f4232b7c86693e50b5b0))
- **deps:** update dependency file-loader to v6 ([4aaab77](https://github.com/ersims/varan/commit/4aaab77b05bad66940a786d6f0cf1fd0c099482b))
- **deps:** update dependency mini-css-extract-plugin to ^0.9.0 ([3dfb8d1](https://github.com/ersims/varan/commit/3dfb8d1ee394fe01fa6d17e872555989e1e750e9))
- **deps:** update dependency react-dev-utils to v10 ([dba8840](https://github.com/ersims/varan/commit/dba88408ed50af46ea1af14ba06581c86e062d30))
- **deps:** update dependency sharp to ^0.24.0 ([beb8a09](https://github.com/ersims/varan/commit/beb8a0979117fcb747910f90bc53c5e318e1347d))
- **deps:** update dependency sw-precache-webpack-plugin to v1 ([3c8bd65](https://github.com/ersims/varan/commit/3c8bd65a303572c39d22c1f1e39eeaf6d6b12c86))
- **deps:** update dependency update-notifier to v4 ([f9885c3](https://github.com/ersims/varan/commit/f9885c3ad48efda178b3e09f4d56a474da85e91e))
- **deps:** update dependency url-loader to v3 ([7770eda](https://github.com/ersims/varan/commit/7770edae7d49c8422dc55ac02fb16c4a632acc37))
- **deps:** update dependency url-loader to v4 ([6ef6f15](https://github.com/ersims/varan/commit/6ef6f15cbca71a65434686cce4c31d3902ddcb3f))
- **deps:** update dependency wait-on to v4 ([63422fb](https://github.com/ersims/varan/commit/63422fbd15412bbf54955fa2970fad56168f522f))

### Features

- drop support for node v8 ([be5b3d9](https://github.com/ersims/varan/commit/be5b3d90d2b360750aa956827e1315cc8585396f))

## [0.16.3](https://github.com/ersims/varan/compare/varan@0.16.2...varan@0.16.3) (2019-11-21)

### Features

- add loader to only return the src property from responsive-loader ([a539640](https://github.com/ersims/varan/commit/a539640737f53530ea4e6925d76bea0ef674ae9f))

## [0.16.2](https://github.com/ersims/varan/compare/varan@0.16.1...varan@0.16.2) (2019-11-18)

### Bug Fixes

- use responsive-loader as fallback only in production ([0ed8f03](https://github.com/ersims/varan/commit/0ed8f039469abf64f7d15a74057efbdfbfa2b679))

## [0.16.1](https://github.com/ersims/varan/compare/varan@0.16.0...varan@0.16.1) (2019-11-18)

### Bug Fixes

- use file-loader unless the issuing file can support more ([a71f689](https://github.com/ersims/varan/commit/a71f689bd452e146cc8f9314cccd0077b21070e9))

# [0.16.0](https://github.com/ersims/varan/compare/varan@0.15.2...varan@0.16.0) (2019-11-18)

### Bug Fixes

- use `APP_BUILD_VAR_` environment variables on server as well ([91b0e63](https://github.com/ersims/varan/commit/91b0e6359a0a7eeef6002976b43775e965694f62))
- **deps:** update dependency chalk to v3 ([e0f0c4f](https://github.com/ersims/varan/commit/e0f0c4fea63510509fcc5aa89bb59a3a6b713fbf))
- **deps:** update dependency commander to v4 ([9e0caf0](https://github.com/ersims/varan/commit/9e0caf065a0d0676503f2e1888c24ce367b8d9a4))
- **deps:** update dependency filesize to v6 ([1f14f22](https://github.com/ersims/varan/commit/1f14f220e87759af2099a6d2f80517219c091694))

### Features

- replace webpack-pwa-manifest with app-manifest-loader ([750c1fc](https://github.com/ersims/varan/commit/750c1fca16e6f85154d5669c8aeb934a412d4658))

### BREAKING CHANGES

- removed support for webpack-pwa-manifest in default
  varan webpack config in favor for app-manifest-loader to make manifest
  a part of the app and not build configuration. Migration is as simple as
  adding webpack-pwa-manifest as custom configuration or update your app
  to use handcrafted manifest files as per app-manifest-loader docs

## [0.15.2](https://github.com/ersims/varan/compare/varan@0.15.1...varan@0.15.2) (2019-10-20)

### Bug Fixes

- **deps:** update dependency execa to v3 ([4212732](https://github.com/ersims/varan/commit/4212732))
- json stringify env vars ([179a3d8](https://github.com/ersims/varan/commit/179a3d8))

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
