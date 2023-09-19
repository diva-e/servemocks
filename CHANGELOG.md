# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [2.0.1](https://github.com/diva-e/servemocks/compare/v2.0.0...v2.0.1) (2023-09-19)


### Bug Fixes

* fix log message prefix for patch, put and delete requests ([921db2b](https://github.com/diva-e/servemocks/commit/921db2b05cb14e7f2ba0b98763f040c606029415))
* log JSON requests bodies properly ([14d2098](https://github.com/diva-e/servemocks/commit/14d209873fda85a2a20af4ba87e22da87975bb63))

## [2.0.0](https://github.com/diva-e/servemocks/compare/v1.4.1...v2.0.0) (2023-09-18)


### ⚠ BREAKING CHANGES

* remove file extensions of image file extensions per default and add support for avif format
* remove restheart specific response behaviour
* migrate to es modules and upgrade dependencies

### Features

* add -c flag for compact logging when using CLI ([5d29bb0](https://github.com/diva-e/servemocks/commit/5d29bb0731ae5370aeed01ee7aa6367e0cd3fe0e))
* add eval mode as alternative for dynamic mock responses ([ed21148](https://github.com/diva-e/servemocks/commit/ed21148ea924d5ff786bd099782ffd0c3fd42bb8))
* add responseDelay_ms option ([cbc5856](https://github.com/diva-e/servemocks/commit/cbc5856855dadce580959cb468f8975e2ff0c93d))
* add support for delete, put and patch methods ([ffe7b60](https://github.com/diva-e/servemocks/commit/ffe7b60096f7590d4b8da7c4e49b7d825cf638d6))
* add support for javascript files (assets) ([afe43dd](https://github.com/diva-e/servemocks/commit/afe43dd88e89720a96d77e85aed06082df90c66e))
* enable dynamic responses by using .mjs files ([8820386](https://github.com/diva-e/servemocks/commit/8820386a6c044bced9bf7baddec0a11d78840ac2))
* enable endpointRegistrationLogging option for programmatic use ([175a30c](https://github.com/diva-e/servemocks/commit/175a30cb126264112f549acdadc3b9db18652c2e))
* introduce dedicated logger ([612b772](https://github.com/diva-e/servemocks/commit/612b7720b63d41b752d9985e5823219b949eee13))
* migrate to es modules and upgrade dependencies ([94103b4](https://github.com/diva-e/servemocks/commit/94103b493c65ba669759bec363b3fbb6ce6fe008))
* remove file extensions of image file extensions per default and add support for avif format ([b0ee700](https://github.com/diva-e/servemocks/commit/b0ee70018e43920a0380614e6902ad0ae6593483))
* remove restheart specific response behaviour ([df44a17](https://github.com/diva-e/servemocks/commit/df44a172b11456c72a67c27aad2a1f6c49d5cbe0))


### Bug Fixes

* sort endpoints after specificity in case multiple files match a route ([b1116c4](https://github.com/diva-e/servemocks/commit/b1116c4d816cabe6c9445aaae5bec213c08c341a)), closes [#11](https://github.com/diva-e/servemocks/issues/11)


### Dependency and Build-Related Updates

* npm update and audit fix ([0767638](https://github.com/diva-e/servemocks/commit/07676387188856433ee34b518bff7fbd22bf3561))

### [1.4.1](https://github.com/diva-e/servemocks/compare/v1.4.0...v1.4.1) (2023-02-20)


### Dependency and Build-Related Updates

* run npm update ([2619b26](https://github.com/diva-e/servemocks/commit/2619b26ee94d449cc6785229c8c900e39d8e8e8a))

## [1.4.0](https://github.com/diva-e/servemocks/compare/v1.3.3...v1.4.0) (2022-09-22)


### Features

* extract and expose createServeMocksExpressApp function ([4dfe9a9](https://github.com/diva-e/servemocks/commit/4dfe9a9eab2535c5db8ea47899cbf427c004fd1d))
* resolve absolute path of mock directory ([859a925](https://github.com/diva-e/servemocks/commit/859a925ce33c5a47ae4050c6a75cdac9d7d7bbd0))


### Dependency and Build-Related Updates

* update npm packages ([36a2dfd](https://github.com/diva-e/servemocks/commit/36a2dfdd8093221555baefa7ab62409518dfa7c9))

### [1.3.3](https://github.com/diva-e/servemocks/compare/v1.3.2...v1.3.3) (2022-06-09)


### Dependency and Build-Related Updates

* reduce bundle size ([fb88854](https://github.com/diva-e/servemocks/commit/fb888543e7049fd2db0e2853902dcb431ddb9da8))
* update dev dependencies ([231d90f](https://github.com/diva-e/servemocks/commit/231d90fa29baad0206141c03aefe8dc5180e16c3))

### [1.3.2](https://github.com/diva-e/servemocks/compare/v1.3.1...v1.3.2) (2022-05-31)

### [1.3.1](https://github.com/diva-e/servemocks/compare/v1.3.0...v1.3.1) (2022-02-18)

## [1.3.0](https://github.com/diva-e/servemocks/compare/v1.0.0...v1.3.0) (2022-02-18)


### Features

* add json-schema validation option for POST endpoints ([a3246d6](https://github.com/diva-e/servemocks/commit/a3246d68023c5b5304461635bd7f646a94d7cd4e))
* add respondWithRequestBody option for POST endpoints ([0dc4a39](https://github.com/diva-e/servemocks/commit/0dc4a394dbac02287ef1fe350f734ecff40fdbf0))
* add support for css files ([3bc1c5a](https://github.com/diva-e/servemocks/commit/3bc1c5a0fa2e805b3f8446c8ac40140b4e93e230))
* add support for html files ([cb5640d](https://github.com/diva-e/servemocks/commit/cb5640d4e724cf873819a3cc9d46ea8749fc6f48))
* enable request of type xml, plain, css and html  for respondWithRequestBody option ([50af1ab](https://github.com/diva-e/servemocks/commit/50af1ab7ccfe2ab90a3ba3ce6fe926be3a28bfaa))


### Bug Fixes

* fix defect endpoints on windows systems ([66ffda7](https://github.com/diva-e/servemocks/commit/66ffda707174efd8a6720b291392873d709ffa2c))
* increase json size limit from 100kb to 20mb ([dc7108f](https://github.com/diva-e/servemocks/commit/dc7108f8d93e7ab2cac6e6e534f18ba173c660e7))
* support node versions lower than 15 on windows ([2fef5a3](https://github.com/diva-e/servemocks/commit/2fef5a37c65d05eaa29664c8e3f5e039836947cf))

## [1.2.0](https://github.com/diva-e/servemocks/compare/v1.1.0...v1.2.0) (2021-06-08)

### Features

* add support for css files ([3bc1c5a](https://github.com/diva-e/servemocks/commit/3bc1c5a0fa2e805b3f8446c8ac40140b4e93e230))
* add support for html files ([cb5640d](https://github.com/diva-e/servemocks/commit/cb5640d4e724cf873819a3cc9d46ea8749fc6f48))
* enable request of type xml, plain, css and html  for respondWithRequestBody option ([50af1ab](https://github.com/diva-e/servemocks/commit/50af1ab7ccfe2ab90a3ba3ce6fe926be3a28bfaa))

## [1.1.0](https://github.com/diva-e/servemocks/compare/v1.0.5...v1.1.0) (2021-05-27)

### Features

* add json-schema validation option for POST endpoints ([a3246d6](https://github.com/diva-e/servemocks/commit/a3246d68023c5b5304461635bd7f646a94d7cd4e))
* add respondWithRequestBody option for POST endpoints ([0dc4a39](https://github.com/diva-e/servemocks/commit/0dc4a394dbac02287ef1fe350f734ecff40fdbf0))

### [1.0.5](https://github.com/diva-e/servemocks/compare/v1.0.4...v1.0.5) (2021-05-26)

### Bug Fixes

* increase json size limit from 100kb to 20mb ([dc7108f](https://github.com/diva-e/servemocks/commit/dc7108f8d93e7ab2cac6e6e534f18ba173c660e7))

### [1.0.4](https://github.com/diva-e/servemocks/compare/v1.0.3...v1.0.4) (2021-05-04)

### Bug Fixes

* support node versions lower than 15 on windows ([2fef5a3](https://github.com/diva-e/servemocks/commit/2fef5a37c65d05eaa29664c8e3f5e039836947cf))

### [1.0.3](https://github.com/diva-e/servemocks/compare/v1.0.2...v1.0.3) (2021-05-04)

### Bug Fixes

* fix defect endpoints on windows systems ([66ffda7](https://github.com/diva-e/servemocks/commit/66ffda707174efd8a6720b291392873d709ffa2c))

### [1.0.2](https://github.com/diva-e/servemocks/compare/v1.0.1...v1.0.2) (2021-04-15)

### [1.0.1](https://github.com/diva-e/servemocks/compare/v1.0.0...v1.0.1) (2021-04-14)

## 1.0.0 (2021-04-14)

### Features

* add basic mock-server cli app ([4c81ae7](https://github.com/eisverticker/servemocks/commit/4c81ae7940191746b7844f672454eedfe54a4d27))
